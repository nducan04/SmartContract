// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./EscrowAgreement.sol";

contract AgreementFactory {
    address[] public allAgreements;
    mapping(address => address[]) public agreementsByClient;
    mapping(address => address[]) public agreementsByReceiver;

    event NewAgreementCreated(
        address indexed contractAddress,
        address indexed client,
        address indexed receiver,
        uint paymentAmount,
        string termsHash_IPFS,
        uint deliveryDeadline,
        uint penaltyAmount
    );

    function createAgreement(
        address _receiver,
        string memory _agreementTerms,
        string memory _termsHash_IPFS,
        uint _deliveryDeadline,
        uint _penaltyAmount
    ) external payable {
        require(msg.value > 0, "Phai gui tien ky quy");
        require(_receiver != address(0), "Nguoi nhan khong hop le");

        // QUAN TRỌNG: Truyền msg.sender (người gọi hàm) vào làm Client
        EscrowAgreement newAgreement = new EscrowAgreement{value: msg.value}(
            msg.sender, 
            _receiver,
            _agreementTerms,
            _termsHash_IPFS,
            _deliveryDeadline,
            _penaltyAmount
        );

        address newAgreementAddress = address(newAgreement);
        allAgreements.push(newAgreementAddress);
        agreementsByClient[msg.sender].push(newAgreementAddress);
        agreementsByReceiver[_receiver].push(newAgreementAddress);

        emit NewAgreementCreated(
            newAgreementAddress,
            msg.sender,
            _receiver,
            msg.value,
            _termsHash_IPFS,
            _deliveryDeadline,
            _penaltyAmount
        );
    }

    function getAllAgreements() external view returns (address[] memory) { return allAgreements; }
    function getAgreementsCount() external view returns (uint) { return allAgreements.length; }
    function getAgreementsByClient(address _client) external view returns (address[] memory) { return agreementsByClient[_client]; }
    function getAgreementsByReceiver(address _receiver) external view returns (address[] memory) { return agreementsByReceiver[_receiver]; }
}