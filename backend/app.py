#-*- coding: utf-8 -*-
from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import uuid
from sqlalchemy import create_engine, Column, String, Integer, Text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import requests
import json

app = Flask(__name__)
CORS(app)

UPLOAD_FOLDER = 'uploads'
ALLOWED_EXTENSIONS = {'png'}
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

DATABASE_URL = "sqlite:///zkproofs.db"
engine = create_engine(DATABASE_URL)
Base = declarative_base()

class Proof(Base):
    __tablename__ = 'proofs'
    id = Column(Integer, primary_key=True, autoincrement=True)
    uuid = Column(String(36), unique=True, nullable=False)
    pubInputs = Column(Text, nullable=False)
    proof = Column(Text, nullable=False)
    address = Column(Text, nullable=False)

Base.metadata.create_all(engine)
Session = sessionmaker(bind=engine)
session = Session()

if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@app.route('/api/upload_human_info', methods=['POST'])
def upload_human_info():
    """
        说明：本接口上传的信息取决于活体识别+真人校验使用的是什么算法
        在本次黑客松中为了简化，我们只用上传一张人脸图片即可（在实际场景中传静态图片是不安全的）
    """
    if 'image' not in request.files:
        return jsonify({'error': 'No file part'}), 400
    
    file = request.files['image']
    
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400
    
    if file and allowed_file(file.filename):
        filename = str(uuid.uuid4())
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(filepath)
        return jsonify({'message': 'File uploaded successfully', 'filepath': filename}), 200
    
    return jsonify({'error': 'Invalid file type'}), 400

@app.route('/api/get_proof/<string:uuid>', methods=['GET'])
def get_proof(uuid):
    """
        返回 zkML 计算结果中用于 verify 合约的校验数据
    """
    proof_record = session.query(Proof).filter_by(uuid=uuid).first()
    if proof_record:
        return jsonify({
            'pubInputs': proof_record.pubInputs,
            'proof': proof_record.proof
        }), 200
    else:
        return jsonify({'error': 'Proof not found'}), 404
    
from utils import vector_search, issue_sbt, save_to_vector_db
@app.route('/api/zk_human_verify', methods=['POST'])
def zk_human_verify():
    uid = request.form.get('id')
    address = request.form.get('address')

    # 调用 zkML 微服务
    response = requests.post('http://localhost:5051/zk_human_model', json={'uuid': uid})
    if response.status_code == 200:
        data = response.json()
        embedding = data['embedding']
        
        pubInputs = json.dumps(data['pubInputs'])
        proof = json.dumps(data['proof'])

        new_proof = Proof(address=address, uuid=uid, pubInputs=pubInputs, proof=proof)
        session.add(new_proof)
        session.commit()

        new_proof_id = new_proof.id
        is_valid = vector_search(embedding)
        if is_valid:
            save_to_vector_db(embedding, new_proof_id) # 保存 embedding 到向量数据库
            issue_sbt(address, uid) # 颁发 SBT
            return jsonify({'message': 'Verification successful and SBT issued', 'id': id}), 200
        else:
            return jsonify({'error': 'Verification failed'}), 400
    else:
        return jsonify({'error': 'Failed to get embedding for UUID: {}'.format(id)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
