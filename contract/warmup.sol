// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract WarmupContract {
    // 事件，用于通知押金已收到并且可以验证
    event DepositReceived(address indexed user, string uuid);

    // 存储押金的结构体
    struct Deposit {
        address user;
        // uint256 amount;
        bool exists;
    }

    // 映射UUID到押金信息
    mapping(string => Deposit) public deposits;

    // 函数：用户发送UUID并存储ETH押金
    function deposit(string memory uuid) public {
        // require(msg.value > 0, "Deposit amount must be greater than zero");

        // 检查是否已经存在该UUID的押金
        require(!deposits[uuid].exists, "Deposit with this UUID already exists");

        // 创建新的押金记录
        deposits[uuid] = Deposit({
            user: msg.sender,
            // amount: msg.value,
            exists: true
        });

        // 触发事件
        emit DepositReceived(msg.sender, uuid);
    }

    // 函数：根据UUID获取信息
    function getDeposit(string memory uuid) public view returns (address) {
        Deposit memory depositInfo = deposits[uuid];
        require(depositInfo.exists, "Deposit does not exist");
        return depositInfo.user;
    }

    // 函数：取回押金（仅限押金的所有者）
    // function withdraw(string memory uuid) public {
    //     Deposit memory depositInfo = deposits[uuid];
    //     require(depositInfo.exists, "Deposit does not exist");
    //     require(depositInfo.user == msg.sender, "Only the deposit owner can withdraw");

    //     uint256 amount = depositInfo.amount;
    //     deposits[uuid].exists = false;
    //     deposits[uuid].amount = 0;

    //     payable(msg.sender).transfer(amount);
    // }
}
