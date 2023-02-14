// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";

contract LastSecret is OwnableUpgradeable {
    using ECDSA for bytes32;

    uint private secret;

    event SecretChanged(address from, uint256 time);

    // This map is to store valid users, for valid user,
    // the bool value need to be true
    mapping(address => bool) public users;

    // The Domain structure defines the properties
    // of the domain that needs to be validated
    struct Domain {
        string name;
        string version;
        address verifyingContract;
        string owner;
    }

    // The User structure defines the data to be validated
    // in the signature
    struct User {
        address user;
        uint256 expiresAt;
    }

    string private constant EIP712_DOMAIN_NAME = "LastSecret";
    string private constant EIP712_DOMAIN_VERSION = "2";

    // This is the type hash of the EIP712 domain structure
    bytes32 private constant EIP712_DOMAIN_TYPE_HASH =
        keccak256(
            "EIP712Domain(string name,string version,address verifyingContract,string owner)"
        );

    // This is the type hash of the User structure
    bytes32 private constant USER_TYPE_HASH =
        keccak256("User(address user,uint256 expiresAt)");

    function initialize() public initializer {
        __Ownable_init();
        secret = 0;
    }

    function setUserEnabled(address user, bool enabled) external onlyOwner {
        users[user] = enabled;
    }

    function setSecret(uint _secret) external onlyOwner {
        secret = _secret;
        emit SecretChanged(msg.sender, block.timestamp);
    }

    function getSecret() external view onlyOwner returns (uint) {
        return secret;
    }

    function hashDomain(Domain memory domain) private pure returns (bytes32) {
        return
            keccak256(
                abi.encode(
                    EIP712_DOMAIN_TYPE_HASH,
                    keccak256(bytes(domain.name)),
                    keccak256(bytes(domain.version)),
                    domain.verifyingContract,
                    keccak256(bytes(domain.owner))
                )
            );
    }

    function hashUser(User memory user) private pure returns (bytes32) {
        return keccak256(abi.encode(USER_TYPE_HASH, user.user, user.expiresAt));
    }

    /**
     * Verify the EIP 712 signature
     * @param messageHash The message hash for EIP 712 structure
     * @param signature The signature to be verified
     */
    function verifySignature(
        bytes32 messageHash,
        bytes memory signature
    ) private view {
        address verifyingContract = address(this);
        bytes32 domainHash = hashDomain(
            Domain({
                name: EIP712_DOMAIN_NAME,
                version: EIP712_DOMAIN_VERSION,
                verifyingContract: verifyingContract,
                owner: "javaidea"
            })
        );

        // Calculate the hash according to the given domain and message hash
        bytes32 digest = keccak256(
            abi.encodePacked("\x19\x01", domainHash, messageHash)
        );

        // Use ECDSA to recover the address from the signature
        // and compare it with the owner
        require(digest.recover(signature) == owner(), "Invalid signature");
    }

    modifier validUser() {
        require(users[msg.sender], "Invalid user");
        _;
    }

    modifier validSignature(uint256 expiresAt) {
        require(block.timestamp < expiresAt, "Expired signature");
        _;
    }

    function setSecretWithSignature(
        uint _secret,
        uint256 expiresAt,
        bytes memory signature
    ) external validUser validSignature(expiresAt) {
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
    ) external view validUser validSignature(expiresAt) returns (uint256) {
        bytes32 userHash = hashUser(
            User({user: msg.sender, expiresAt: expiresAt})
        );

        verifySignature(userHash, signature);

        return secret;
    }
}
