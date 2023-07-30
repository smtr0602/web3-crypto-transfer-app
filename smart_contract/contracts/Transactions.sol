// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.19;

contract Transactions {
    uint256 transactionCount;
    TransferStruct[] transactions;

    struct TransferStruct {
        address addressFrom;
        address addressTo;
        uint256 amount;
        string message;
        uint256 timestamp;
    }

    event Transfer(
        address addressFrom,
        address addressTo,
        uint256 amount,
        string message,
        uint256 timestamp
    );

    function addToBlockchain(
        address payable addressTo,
        uint amount,
        string memory message
    ) public {
        transactionCount++;
        transactions.push(
            TransferStruct(
                msg.sender,
                addressTo,
                amount,
                message,
                block.timestamp
            )
        );
        emit Transfer(msg.sender, addressTo, amount, message, block.timestamp);
    }

    function getAllTransactions()
        public
        view
        returns (TransferStruct[] memory)
    {
        return transactions;
    }

    function getTransactionCount() public view returns (uint256) {
        return transactionCount;
    }
}
