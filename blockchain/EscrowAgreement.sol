// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract EscrowAgreement {
    enum State { Created, Accepted, InProgress, Completed, Paid, Cancelled }
    State public currentState;

    address payable public client;
    address payable public provider;
    address public receiver;

    uint public paymentAmount;
    string public agreementTerms;
    string public termsHash_IPFS;
    
    // Thêm 3 biến mới
    uint public deliveryDeadline;
    uint public penaltyAmount;
    bool public isLate;

    event ContractAccepted(address indexed provider);
    event StatusUpdated(State newState);
    event ContractPaid(address indexed provider, uint amountPaid, uint penaltyRefunded, bool isLate);
    event ContractCancelled(address indexed client, uint amountRefunded);

    modifier inState(State _state) { require(currentState == _state, "Trang thai khong hop le"); _; }
    modifier onlyClient() { require(msg.sender == client, "Chi Client duoc phep"); _; }
    modifier onlyProvider() { require(msg.sender == provider, "Chi Provider duoc phep"); _; }
    modifier onlyReceiver() { require(msg.sender == receiver, "Chi Receiver duoc phep"); _; }

    constructor(
        address _client, // <--- QUAN TRỌNG: Nhận địa chỉ Client từ Factory
        address _receiver,
        string memory _agreementTerms,
        string memory _termsHash_IPFS,
        uint _deliveryDeadline,
        uint _penaltyAmount
    ) payable {
        require(msg.value > 0, "Phai ky quy tien");
        
        client = payable(_client); // <--- Gán đúng người tạo
        receiver = _receiver;
        paymentAmount = msg.value;
        agreementTerms = _agreementTerms;
        termsHash_IPFS = _termsHash_IPFS;
        deliveryDeadline = _deliveryDeadline;
        penaltyAmount = _penaltyAmount;
        isLate = false;
        
        currentState = State.Created;
    }

    function acceptAgreement() external inState(State.Created) {
        require(msg.sender != client, "Client khong the tu chap nhan");
        provider = payable(msg.sender);
        currentState = State.Accepted;
        emit ContractAccepted(provider);
    }

    function updateStatusInProgress() external onlyProvider inState(State.Accepted) {
        currentState = State.InProgress;
        emit StatusUpdated(State.InProgress);
    }

    function updateStatusCompleted() external onlyProvider inState(State.InProgress) {
        currentState = State.Completed;
        emit StatusUpdated(State.Completed);
    }

    function confirmAndPay() external onlyReceiver inState(State.Completed) {
        uint amountToProvider = paymentAmount;
        uint amountToRefundClient = 0;

        if (block.timestamp > deliveryDeadline) {
            isLate = true;
            if (penaltyAmount < paymentAmount) {
                amountToProvider = paymentAmount - penaltyAmount;
                amountToRefundClient = penaltyAmount;
            } else {
                amountToProvider = 0;
                amountToRefundClient = paymentAmount;
            }
        }

        if (amountToProvider > 0) {
            (bool success, ) = provider.call{value: amountToProvider}("");
            require(success, "Thanh toan Provider that bai");
        }
        if (amountToRefundClient > 0) {
            (bool success, ) = client.call{value: amountToRefundClient}("");
            require(success, "Hoan tien phat that bai");
        }

        currentState = State.Paid;
        emit ContractPaid(provider, amountToProvider, amountToRefundClient, isLate);
    }

    function cancelAgreement() external onlyClient inState(State.Created) {
        (bool success, ) = client.call{value: paymentAmount}("");
        require(success, "Hoan tien that bai");
        currentState = State.Cancelled;
        emit ContractCancelled(client, paymentAmount);
    }

    function getAgreementDetails() public view returns (
        State, address, address, address, uint, string memory, string memory, uint, uint, bool
    ) {
        return (currentState, client, provider, receiver, paymentAmount, agreementTerms, termsHash_IPFS, deliveryDeadline, penaltyAmount, isLate);
    }
}