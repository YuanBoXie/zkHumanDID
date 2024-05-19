# zkHumanDID
Eth Beijing 2024 Entry - zkHumanDID - Creating on-chain DID digital identities for real human beings

# 交互流程
User side：用户 -> 链接钱包 (wagmi) -> 上传图片 (Flask) -> 触发交易 (Metamask)

Server side: 保存图片 -> 检测到用户触发合约押金交易 -> 离线ZKML校验 -> 触发SBT合约颁发zkHumanDID

1. 触发领取 SBT 流程：
 - 链接钱包(wagmi)
 - 上传图片(Flask服务器接收用户上传的图片)
 - 触发交易(存入押金以及写入校验数据hash)
2. 离线ZKML校验过程：
 - off-chain 的监控程序检测到新的 claim 交易确认后，触发离线ZKML校验过程
 - 离线ZKML校验程序读取交易数据，调用人脸识别模型进行验证
    - 对人脸模型计算 embedding
    - 在向量数据库中查找相似 embedding 进行阈值校验，确定是否存在相似度低于阈值的记录
        - 如有：验证失败，该人脸已被占用，拒绝claim
        - 如无：验证成功，写入zkML校验数据hash，调用合约颁发SBT

# 离线ZKML校验流程
1. 监控程序检测到新交易确认
2. 读取交易数据和上传的图片
3. 调用人脸识别模型计算embedding
4. 在向量数据库中检索相似度
5. 生成零知识证明（zkML）验证embedding计算结果
6. 调用智能合约颁发SBT

# 合约地址（部署在Scroll测试网上）
1. Warmup合约，用于存储UUID 0x2cc703ce58f5e219f26ce493eec0f50622180097
2. Halo2Verifier合约 0xB158384435Dd62E36B79e9b59fa1A7c53E6f024B
3. ZkRealHumanSBT合约 0xB2EE145Ea0009B06A5957AB237EeB9879fAbb811

# Interactive Process

#### User Side:
1. User -> Connect Wallet (wagmi)
2. Upload Image (Flask)
3. Trigger Transaction (Metamask)

#### Server Side:
1. Save Image
2. Detect User Triggering Contract Deposit Transaction
3. Offline ZKML Verification
4. Trigger SBT Contract Issuance for zkHumanDID

## Triggering the SBT Claim Process:
1. Connect Wallet (wagmi)
2. Upload Image (Flask server receives user-uploaded image)
3. Trigger Transaction (deposit collateral and write verification data hash)

## Offline ZKML Verification Process:
1. Off-chain monitoring program detects a new claim transaction confirmation and triggers the offline ZKML verification process
2. Offline ZKML verification program reads transaction data and calls the face recognition model for verification
   - Compute embedding for the face model
   - Search for similar embeddings in the vector database and perform threshold verification to determine if there are records with similarity below the threshold
      - If yes: Verification fails, the face has been occupied, claim is denied
      - If no: Verification succeeds, write zkML verification data hash, call contract to issue SBT

## Offline ZKML Verification Workflow:
1. Monitoring program detects new transaction confirmation
2. Read transaction data and uploaded image
3. Call face recognition model to compute embedding
4. Search for similarity in the vector database
5. Generate zero-knowledge proof (zkML) to verify embedding calculation result
6. Call smart contract to issue SBT

## Contract Addresses (Deployed on Scroll Testnet)
1. Warmup Contract, used to store UUID 0x2cc703ce58f5e219f26ce493eec0f50622180097
2. Halo2Verifier Contract 0xB158384435Dd62E36B79e9b59fa1A7c53E6f024B
3. ZkRealHumanSBT Contract 0xB2EE145Ea0009B06A5957AB237EeB9879fAbb811

