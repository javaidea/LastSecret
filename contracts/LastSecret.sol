// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";

import "hardhat/console.sol";

contract LastSecret is OwnableUpgradeable {
    using ECDSA for bytes32;

    uint private secret;

    mapping(address => uint256) public users;

    event SecretChanged(address from, uint256 time);

    struct User {
        address user;
        uint256 expiresAt;
    }

    string private constant EIP712_DOMAIN_NAME = "LastSecret";
    string private constant EIP712_DOMAIN_VERSION = "1";
    bytes32 private constant EIP712_DOMAIN_TYPE_HASH =
        keccak256(
            "EIP712Domain(string name,string version,address verifyingContract,uint256 contractVersion)"
        );

    bytes32 private constant USER_TYPE_HASH =
        keccak256("User(address user,uint256 expiresAt)");

    function initialize() public initializer {
        __Ownable_init();
        secret = 0;
    }

    function setUserEnabled(address user, uint enabled) external onlyOwner {
        users[user] = enabled;
    }

    function setSecret(uint _secret) external onlyOwner {
        secret = _secret;
        emit SecretChanged(msg.sender, block.timestamp);
    }

    function getSecret() external view onlyOwner returns (uint) {
        return secret;
    }

    function hashUser(User memory user) private view returns (bytes32) {
        uint256 enabled = users[user.user];
        require(enabled > 0, "Invalid user");

        return keccak256(abi.encode(USER_TYPE_HASH, user.user, user.expiresAt));
    }

    function verifySignature(
        bytes32 messageHash,
        bytes memory signature
    ) private view {
        address verifyingContract = address(this);
        bytes32 domainSeparator = keccak256(
            abi.encode(
                EIP712_DOMAIN_TYPE_HASH,
                keccak256(bytes(EIP712_DOMAIN_NAME)),
                keccak256(bytes(EIP712_DOMAIN_VERSION)),
                verifyingContract,
                3
            )
        );

        bytes32 digest = keccak256(
            abi.encodePacked("\x19\x01", domainSeparator, messageHash)
        );

        require(digest.recover(signature) == owner(), "Invalid signature");
    }

    modifier validSignature(uint256 expiresAt) {
        require(block.timestamp < expiresAt, "Expired signature");
        _;
    }

    function setSecretWithSignature(
        uint _secret,
        uint256 expiresAt,
        bytes memory signature
    ) external validSignature(expiresAt) {
        bytes32 userHash = hashUser(
            User({user: msg.sender, expiresAt: expiresAt})
        );

        verifySignature(userHash, signature);

        secret = _secret;

        emit SecretChanged(msg.sender, block.timestamp);
    }

    function getSecretWithSignature(
        uint256 expiresAt,
        bytes memory signature
    ) external view validSignature(expiresAt) returns (uint256) {
        bytes32 userHash = hashUser(
            User({user: msg.sender, expiresAt: expiresAt})
        );

        verifySignature(userHash, signature);

        return secret;
    }
}
