// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "../node_modules/@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "./Verifier.sol";

contract ZkRealHumanSBT is ERC721 {
    uint256 public tokenCounter;
    mapping(address => bool) public hasMinted;
    Halo2Verifier verifier;

    event VerificationSuccessful(address indexed user, uint256 tokenId);
    event VerificationFailed(address indexed user);

    constructor(Halo2Verifier v) ERC721("ZkRealHumanToken", "RHT") {
        tokenCounter = 0;
        verifier = v;
    }

    function verifyAndMint(bytes memory proof, uint256[] calldata instances) public {
        // Call the verify function with the proof
        bool isVerified = verifier.verifyProof(proof, instances);
        address user = msg.sender;
        if (isVerified) {
            require(!hasMinted[user], "User has already minted a token");
            uint256 newTokenId = tokenCounter;
            _safeMint(user, newTokenId);
            hasMinted[user] = true;
            tokenCounter++;
            emit VerificationSuccessful(user, newTokenId);
        } else {
            emit VerificationFailed(user);
        }
    }
}
