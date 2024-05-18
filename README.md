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

