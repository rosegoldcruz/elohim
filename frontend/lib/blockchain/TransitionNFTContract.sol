// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

/**
 * AEON Transition NFT Contract
 * Enables creators to mint their transitions as NFTs with automatic royalty distribution
 * Future-proofs AEON for decentralized creator economy
 */
contract AeonTransitionNFT is ERC721, ERC721URIStorage, Ownable, ReentrancyGuard {
    using Counters for Counters.Counter;
    
    Counters.Counter private _tokenIdCounter;
    
    // Transition metadata
    struct TransitionMetadata {
        string name;
        string description;
        string category;
        string glslCode;
        address creator;
        uint256 viralScore;
        uint256 usageCount;
        uint256 price;
        uint256 royaltyPercentage; // Basis points (100 = 1%)
        bool isActive;
        uint256 createdAt;
    }
    
    // Mappings
    mapping(uint256 => TransitionMetadata) public transitions;
    mapping(address => uint256[]) public creatorTransitions;
    mapping(uint256 => uint256) public transitionEarnings;
    mapping(address => uint256) public creatorEarnings;
    
    // Events
    event TransitionMinted(
        uint256 indexed tokenId,
        address indexed creator,
        string name,
        uint256 price
    );
    
    event TransitionPurchased(
        uint256 indexed tokenId,
        address indexed buyer,
        address indexed creator,
        uint256 price,
        uint256 royalty
    );
    
    event RoyaltyPaid(
        uint256 indexed tokenId,
        address indexed creator,
        uint256 amount
    );
    
    event ViralScoreUpdated(
        uint256 indexed tokenId,
        uint256 oldScore,
        uint256 newScore
    );
    
    // Constants
    uint256 public constant MAX_ROYALTY = 5000; // 50% max royalty
    uint256 public constant PLATFORM_FEE = 250; // 2.5% platform fee
    
    constructor() ERC721("AEON Transition NFT", "AEON") {}
    
    /**
     * Mint a new transition NFT
     */
    function mintTransition(
        string memory name,
        string memory description,
        string memory category,
        string memory glslCode,
        string memory tokenURI,
        uint256 price,
        uint256 royaltyPercentage
    ) public returns (uint256) {
        require(bytes(name).length > 0, "Name cannot be empty");
        require(bytes(glslCode).length > 0, "GLSL code cannot be empty");
        require(royaltyPercentage <= MAX_ROYALTY, "Royalty too high");
        
        uint256 tokenId = _tokenIdCounter.current();
        _tokenIdCounter.increment();
        
        // Mint NFT to creator
        _safeMint(msg.sender, tokenId);
        _setTokenURI(tokenId, tokenURI);
        
        // Store transition metadata
        transitions[tokenId] = TransitionMetadata({
            name: name,
            description: description,
            category: category,
            glslCode: glslCode,
            creator: msg.sender,
            viralScore: 5000, // Default 5.0 score (scaled by 1000)
            usageCount: 0,
            price: price,
            royaltyPercentage: royaltyPercentage,
            isActive: true,
            createdAt: block.timestamp
        });
        
        // Track creator's transitions
        creatorTransitions[msg.sender].push(tokenId);
        
        emit TransitionMinted(tokenId, msg.sender, name, price);
        
        return tokenId;
    }
    
    /**
     * Purchase a transition (pay for usage rights)
     */
    function purchaseTransition(uint256 tokenId) public payable nonReentrant {
        require(_exists(tokenId), "Transition does not exist");
        require(transitions[tokenId].isActive, "Transition not active");
        require(msg.value >= transitions[tokenId].price, "Insufficient payment");
        
        TransitionMetadata storage transition = transitions[tokenId];
        address creator = transition.creator;
        uint256 price = transition.price;
        
        // Calculate fees
        uint256 platformFee = (price * PLATFORM_FEE) / 10000;
        uint256 royalty = (price * transition.royaltyPercentage) / 10000;
        uint256 creatorPayment = price - platformFee;
        
        // Update earnings
        transitionEarnings[tokenId] += royalty;
        creatorEarnings[creator] += creatorPayment;
        
        // Transfer payments
        payable(creator).transfer(creatorPayment);
        payable(owner()).transfer(platformFee);
        
        // Refund excess payment
        if (msg.value > price) {
            payable(msg.sender).transfer(msg.value - price);
        }
        
        // Update usage count
        transition.usageCount++;
        
        emit TransitionPurchased(tokenId, msg.sender, creator, price, royalty);
        emit RoyaltyPaid(tokenId, creator, creatorPayment);
    }
    
    /**
     * Update viral score (only owner/oracle)
     */
    function updateViralScore(uint256 tokenId, uint256 newScore) public onlyOwner {
        require(_exists(tokenId), "Transition does not exist");
        require(newScore <= 10000, "Score too high"); // Max 10.0 (scaled by 1000)
        
        uint256 oldScore = transitions[tokenId].viralScore;
        transitions[tokenId].viralScore = newScore;
        
        emit ViralScoreUpdated(tokenId, oldScore, newScore);
    }
    
    /**
     * Batch update viral scores (for OptimizerAgent integration)
     */
    function batchUpdateViralScores(
        uint256[] memory tokenIds,
        uint256[] memory newScores
    ) public onlyOwner {
        require(tokenIds.length == newScores.length, "Array length mismatch");
        
        for (uint256 i = 0; i < tokenIds.length; i++) {
            updateViralScore(tokenIds[i], newScores[i]);
        }
    }
    
    /**
     * Get transition metadata
     */
    function getTransition(uint256 tokenId) public view returns (TransitionMetadata memory) {
        require(_exists(tokenId), "Transition does not exist");
        return transitions[tokenId];
    }
    
    /**
     * Get creator's transitions
     */
    function getCreatorTransitions(address creator) public view returns (uint256[] memory) {
        return creatorTransitions[creator];
    }
    
    /**
     * Get top viral transitions
     */
    function getTopViralTransitions(uint256 limit) public view returns (uint256[] memory) {
        // This would need to be implemented with proper sorting
        // For now, return first N transitions (placeholder)
        uint256 totalSupply = _tokenIdCounter.current();
        uint256 returnLength = limit > totalSupply ? totalSupply : limit;
        
        uint256[] memory topTransitions = new uint256[](returnLength);
        for (uint256 i = 0; i < returnLength; i++) {
            topTransitions[i] = i;
        }
        
        return topTransitions;
    }
    
    /**
     * Deactivate transition
     */
    function deactivateTransition(uint256 tokenId) public {
        require(_exists(tokenId), "Transition does not exist");
        require(
            ownerOf(tokenId) == msg.sender || owner() == msg.sender,
            "Not authorized"
        );
        
        transitions[tokenId].isActive = false;
    }
    
    /**
     * Withdraw creator earnings
     */
    function withdrawEarnings() public nonReentrant {
        uint256 earnings = creatorEarnings[msg.sender];
        require(earnings > 0, "No earnings to withdraw");
        
        creatorEarnings[msg.sender] = 0;
        payable(msg.sender).transfer(earnings);
    }
    
    /**
     * Emergency withdraw (owner only)
     */
    function emergencyWithdraw() public onlyOwner {
        payable(owner()).transfer(address(this).balance);
    }
    
    // Override required functions
    function _burn(uint256 tokenId) internal override(ERC721, ERC721URIStorage) {
        super._burn(tokenId);
    }
    
    function tokenURI(uint256 tokenId) public view override(ERC721, ERC721URIStorage) returns (string memory) {
        return super.tokenURI(tokenId);
    }
    
    function supportsInterface(bytes4 interfaceId) public view override(ERC721, ERC721URIStorage) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
}

/**
 * AEON Transition Marketplace Contract
 * Handles marketplace operations and royalty distribution
 */
contract AeonTransitionMarketplace is ReentrancyGuard, Ownable {
    AeonTransitionNFT public transitionNFT;
    
    struct Listing {
        uint256 tokenId;
        address seller;
        uint256 price;
        bool active;
        uint256 listedAt;
    }
    
    mapping(uint256 => Listing) public listings;
    mapping(address => uint256[]) public userListings;
    
    event TransitionListed(uint256 indexed tokenId, address indexed seller, uint256 price);
    event TransitionSold(uint256 indexed tokenId, address indexed buyer, address indexed seller, uint256 price);
    event ListingCancelled(uint256 indexed tokenId, address indexed seller);
    
    constructor(address _transitionNFT) {
        transitionNFT = AeonTransitionNFT(_transitionNFT);
    }
    
    /**
     * List transition for sale
     */
    function listTransition(uint256 tokenId, uint256 price) public {
        require(transitionNFT.ownerOf(tokenId) == msg.sender, "Not token owner");
        require(price > 0, "Price must be greater than 0");
        require(!listings[tokenId].active, "Already listed");
        
        listings[tokenId] = Listing({
            tokenId: tokenId,
            seller: msg.sender,
            price: price,
            active: true,
            listedAt: block.timestamp
        });
        
        userListings[msg.sender].push(tokenId);
        
        emit TransitionListed(tokenId, msg.sender, price);
    }
    
    /**
     * Buy listed transition
     */
    function buyTransition(uint256 tokenId) public payable nonReentrant {
        Listing storage listing = listings[tokenId];
        require(listing.active, "Not listed for sale");
        require(msg.value >= listing.price, "Insufficient payment");
        
        address seller = listing.seller;
        uint256 price = listing.price;
        
        // Calculate platform fee
        uint256 platformFee = (price * 250) / 10000; // 2.5%
        uint256 sellerPayment = price - platformFee;
        
        // Transfer NFT
        transitionNFT.safeTransferFrom(seller, msg.sender, tokenId);
        
        // Transfer payments
        payable(seller).transfer(sellerPayment);
        payable(owner()).transfer(platformFee);
        
        // Refund excess
        if (msg.value > price) {
            payable(msg.sender).transfer(msg.value - price);
        }
        
        // Remove listing
        listing.active = false;
        
        emit TransitionSold(tokenId, msg.sender, seller, price);
    }
    
    /**
     * Cancel listing
     */
    function cancelListing(uint256 tokenId) public {
        require(listings[tokenId].seller == msg.sender, "Not your listing");
        require(listings[tokenId].active, "Not active listing");
        
        listings[tokenId].active = false;
        
        emit ListingCancelled(tokenId, msg.sender);
    }
}
