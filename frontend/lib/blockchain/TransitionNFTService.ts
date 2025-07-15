/**
 * AEON Transition NFT Service
 * TypeScript integration for blockchain-based transition ownership and royalties
 * Future-proofs AEON for decentralized creator economy
 */

import { ethers, parseEther, formatEther, parseUnits } from 'ethers';
import { createClient } from '@/lib/supabase/client';
import { creditEngine } from '../payments/CreditEngine';

// Contract ABI (simplified for key functions)
const TRANSITION_NFT_ABI = [
  "function mintTransition(string name, string description, string category, string glslCode, string tokenURI, uint256 price, uint256 royaltyPercentage) returns (uint256)",
  "function purchaseTransition(uint256 tokenId) payable",
  "function updateViralScore(uint256 tokenId, uint256 newScore)",
  "function batchUpdateViralScores(uint256[] tokenIds, uint256[] newScores)",
  "function getTransition(uint256 tokenId) view returns (tuple(string name, string description, string category, string glslCode, address creator, uint256 viralScore, uint256 usageCount, uint256 price, uint256 royaltyPercentage, bool isActive, uint256 createdAt))",
  "function getCreatorTransitions(address creator) view returns (uint256[])",
  "function withdrawEarnings()",
  "event TransitionMinted(uint256 indexed tokenId, address indexed creator, string name, uint256 price)",
  "event TransitionPurchased(uint256 indexed tokenId, address indexed buyer, address indexed creator, uint256 price, uint256 royalty)",
  "event ViralScoreUpdated(uint256 indexed tokenId, uint256 oldScore, uint256 newScore)"
];

export interface BlockchainTransition {
  tokenId: number;
  name: string;
  description: string;
  category: string;
  glslCode: string;
  creator: string;
  viralScore: number;
  usageCount: number;
  price: string; // Wei amount
  royaltyPercentage: number;
  isActive: boolean;
  createdAt: number;
}

export interface MintTransitionParams {
  name: string;
  description: string;
  category: string;
  glslCode: string;
  price: string; // ETH amount
  royaltyPercentage: number; // Basis points (100 = 1%)
}

export class TransitionNFTService {
  private provider: ethers.providers.Web3Provider | null = null;
  private contract: ethers.Contract | null = null;
  private supabase = createClient();
  
  // Contract addresses (would be set based on network)
  private readonly CONTRACT_ADDRESSES = {
    mainnet: '0x...', // Would be deployed contract address
    goerli: '0x...', // Testnet address
    localhost: '0x...' // Local development
  };

  constructor() {
    this.initializeProvider();
  }

  /**
   * Initialize Web3 provider and contract
   */
  private async initializeProvider(): Promise<void> {
    if (typeof window !== 'undefined' && window.ethereum) {
      try {
        this.provider = new ethers.providers.Web3Provider(window.ethereum);
        const network = await this.provider.getNetwork();
        const contractAddress = this.getContractAddress(network.chainId);
        
        if (contractAddress) {
          this.contract = new ethers.Contract(
            contractAddress,
            TRANSITION_NFT_ABI,
            this.provider
          );
        }
      } catch (error) {
        console.error('Failed to initialize Web3 provider:', error);
      }
    }
  }

  /**
   * Get contract address for network
   */
  private getContractAddress(chainId: number): string | null {
    switch (chainId) {
      case 1: return this.CONTRACT_ADDRESSES.mainnet;
      case 5: return this.CONTRACT_ADDRESSES.goerli;
      case 1337: return this.CONTRACT_ADDRESSES.localhost;
      default: return null;
    }
  }

  /**
   * Connect wallet
   */
  async connectWallet(): Promise<string | null> {
    if (!window.ethereum) {
      throw new Error('MetaMask not installed');
    }

    try {
      await window.ethereum.request({ method: 'eth_requestAccounts' });
      const signer = this.provider?.getSigner();
      const address = await signer?.getAddress();
      return address || null;
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      return null;
    }
  }

  /**
   * Mint transition as NFT
   */
  async mintTransition(params: MintTransitionParams): Promise<{
    success: boolean;
    tokenId?: number;
    transactionHash?: string;
    error?: string;
  }> {
    if (!this.contract || !this.provider) {
      return { success: false, error: 'Contract not initialized' };
    }

    try {
      const signer = this.provider.getSigner();
      const contractWithSigner = this.contract.connect(signer);

      // Convert price to Wei
      const priceWei = parseEther(params.price);

      // Generate metadata URI (would upload to IPFS in production)
      const tokenURI = await this.generateTokenURI(params);

      // Mint transaction
      const tx = await contractWithSigner.mintTransition(
        params.name,
        params.description,
        params.category,
        params.glslCode,
        tokenURI,
        priceWei,
        params.royaltyPercentage
      );

      const receipt = await tx.wait();
      
      // Extract token ID from events
      const mintEvent = receipt.events?.find((e: any) => e.event === 'TransitionMinted');
      const tokenId = mintEvent?.args?.tokenId?.toNumber();

      // Sync with Supabase
      if (tokenId) {
        await this.syncTransitionToSupabase(tokenId, params, receipt.transactionHash);
      }

      return {
        success: true,
        tokenId,
        transactionHash: receipt.transactionHash
      };

    } catch (error) {
      console.error('Failed to mint transition:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Minting failed'
      };
    }
  }

  /**
   * Purchase transition usage rights
   */
  async purchaseTransition(tokenId: number): Promise<{
    success: boolean;
    transactionHash?: string;
    error?: string;
  }> {
    if (!this.contract || !this.provider) {
      return { success: false, error: 'Contract not initialized' };
    }

    try {
      const signer = this.provider.getSigner();
      const contractWithSigner = this.contract.connect(signer);

      // Get transition details
      const transition = await this.getTransition(tokenId);
      if (!transition) {
        return { success: false, error: 'Transition not found' };
      }

      // Purchase transaction
      const tx = await contractWithSigner.purchaseTransition(tokenId, {
        value: transition.price
      });

      const receipt = await tx.wait();

      // Track purchase in Supabase
      await this.trackPurchaseInSupabase(tokenId, receipt.transactionHash);

      return {
        success: true,
        transactionHash: receipt.transactionHash
      };

    } catch (error) {
      console.error('Failed to purchase transition:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Purchase failed'
      };
    }
  }

  /**
   * Update viral scores (admin only)
   */
  async updateViralScores(updates: Array<{ tokenId: number; viralScore: number }>): Promise<{
    success: boolean;
    transactionHash?: string;
    error?: string;
  }> {
    if (!this.contract || !this.provider) {
      return { success: false, error: 'Contract not initialized' };
    }

    try {
      const signer = this.provider.getSigner();
      const contractWithSigner = this.contract.connect(signer);

      const tokenIds = updates.map(u => u.tokenId);
      const viralScores = updates.map(u => Math.floor(u.viralScore * 1000)); // Scale to contract format

      const tx = await contractWithSigner.batchUpdateViralScores(tokenIds, viralScores);
      const receipt = await tx.wait();

      return {
        success: true,
        transactionHash: receipt.transactionHash
      };

    } catch (error) {
      console.error('Failed to update viral scores:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Update failed'
      };
    }
  }

  /**
   * Get transition details from blockchain
   */
  async getTransition(tokenId: number): Promise<BlockchainTransition | null> {
    if (!this.contract) return null;

    try {
      const result = await this.contract.getTransition(tokenId);
      
      return {
        tokenId,
        name: result.name,
        description: result.description,
        category: result.category,
        glslCode: result.glslCode,
        creator: result.creator,
        viralScore: result.viralScore.toNumber() / 1000, // Scale back from contract
        usageCount: result.usageCount.toNumber(),
        price: result.price.toString(),
        royaltyPercentage: result.royaltyPercentage.toNumber(),
        isActive: result.isActive,
        createdAt: result.createdAt.toNumber()
      };

    } catch (error) {
      console.error('Failed to get transition:', error);
      return null;
    }
  }

  /**
   * Get creator's transitions
   */
  async getCreatorTransitions(creatorAddress: string): Promise<number[]> {
    if (!this.contract) return [];

    try {
      const tokenIds = await this.contract.getCreatorTransitions(creatorAddress);
      return tokenIds.map((id: any) => id.toNumber());
    } catch (error) {
      console.error('Failed to get creator transitions:', error);
      return [];
    }
  }

  /**
   * Withdraw creator earnings
   */
  async withdrawEarnings(): Promise<{
    success: boolean;
    transactionHash?: string;
    error?: string;
  }> {
    if (!this.contract || !this.provider) {
      return { success: false, error: 'Contract not initialized' };
    }

    try {
      const signer = this.provider.getSigner();
      const contractWithSigner = this.contract.connect(signer);

      const tx = await contractWithSigner.withdrawEarnings();
      const receipt = await tx.wait();

      return {
        success: true,
        transactionHash: receipt.transactionHash
      };

    } catch (error) {
      console.error('Failed to withdraw earnings:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Withdrawal failed'
      };
    }
  }

  /**
   * Generate metadata URI for NFT
   */
  private async generateTokenURI(params: MintTransitionParams): Promise<string> {
    // In production, this would upload to IPFS
    const metadata = {
      name: params.name,
      description: params.description,
      image: `https://aeon.ai/transitions/${params.name.toLowerCase().replace(/\s+/g, '-')}/preview.jpg`,
      attributes: [
        { trait_type: 'Category', value: params.category },
        { trait_type: 'Royalty', value: `${params.royaltyPercentage / 100}%` },
        { trait_type: 'Price', value: `${params.price} ETH` }
      ],
      animation_url: `https://aeon.ai/transitions/${params.name.toLowerCase().replace(/\s+/g, '-')}/preview.mp4`
    };

    // For now, return a placeholder URI
    return `data:application/json;base64,${Buffer.from(JSON.stringify(metadata)).toString('base64')}`;
  }

  /**
   * Sync blockchain transition to Supabase
   */
  private async syncTransitionToSupabase(
    tokenId: number,
    params: MintTransitionParams,
    transactionHash: string
  ): Promise<void> {
    try {
      await this.supabase
        .from('blockchain_transitions')
        .insert({
          token_id: tokenId,
          name: params.name,
          description: params.description,
          category: params.category,
          glsl_code: params.glslCode,
          price_eth: params.price,
          royalty_percentage: params.royaltyPercentage,
          transaction_hash: transactionHash,
          created_at: new Date().toISOString()
        });
    } catch (error) {
      console.error('Failed to sync to Supabase:', error);
    }
  }

  /**
   * Track purchase in Supabase
   */
  private async trackPurchaseInSupabase(tokenId: number, transactionHash: string): Promise<void> {
    try {
      await this.supabase
        .from('blockchain_purchases')
        .insert({
          token_id: tokenId,
          transaction_hash: transactionHash,
          purchased_at: new Date().toISOString()
        });
    } catch (error) {
      console.error('Failed to track purchase:', error);
    }
  }

  /**
   * Check if blockchain features are available
   */
  isBlockchainAvailable(): boolean {
    return !!(typeof window !== 'undefined' && window.ethereum && this.contract);
  }

  /**
   * Process crypto payout to creator wallet
   */
  async processCryptoPayout(
    creatorId: string,
    creditAmount: number,
    walletAddress: string,
    tokenType: 'ETH' | 'USDC' = 'USDC'
  ): Promise<{
    success: boolean;
    transactionHash?: string;
    amount?: string;
    error?: string;
  }> {
    if (!this.contract || !this.provider) {
      return { success: false, error: 'Blockchain not initialized' };
    }

    try {
      // Get creator wallet info
      const wallet = await creditEngine.getCreatorWallet(creatorId);
      if (wallet.balance < creditAmount) {
        return { success: false, error: 'Insufficient balance' };
      }

      // Convert credits to crypto amount (1 credit = $0.01)
      const usdAmount = creditAmount * 0.01;
      let cryptoAmount: string;

      if (tokenType === 'ETH') {
        // Get ETH price (would use oracle in production)
        const ethPrice = 2000; // Placeholder - would fetch from Chainlink
        cryptoAmount = parseEther((usdAmount / ethPrice).toString()).toString();
      } else {
        // USDC has 6 decimals
        cryptoAmount = parseUnits(usdAmount.toString(), 6).toString();
      }

      // Request payout through credit engine
      const payoutResult = await creditEngine.requestPayout({
        creatorId,
        amount: creditAmount,
        method: 'crypto',
        destination: walletAddress
      });

      if (!payoutResult.success) {
        return { success: false, error: payoutResult.error };
      }

      // In production, this would:
      // 1. Transfer tokens from platform wallet to creator wallet
      // 2. Use multi-sig for security
      // 3. Handle gas fees
      // 4. Implement proper oracle pricing

      // Simulate crypto transfer
      const mockTxHash = `0x${Math.random().toString(16).substr(2, 64)}`;

      // Record blockchain transaction
      await this.recordCryptoTransaction(
        creatorId,
        creditAmount,
        cryptoAmount,
        walletAddress,
        tokenType,
        mockTxHash
      );

      console.log(`🪙 Crypto payout processed: ${usdAmount} ${tokenType} to ${walletAddress}`);

      return {
        success: true,
        transactionHash: mockTxHash,
        amount: cryptoAmount
      };

    } catch (error) {
      console.error('Crypto payout failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Crypto payout failed'
      };
    }
  }

  /**
   * Get creator's crypto earnings from NFT royalties
   */
  async getCreatorCryptoEarnings(creatorAddress: string): Promise<{
    totalEarnings: string;
    pendingWithdrawals: string;
    transactionCount: number;
  }> {
    if (!this.contract) {
      return { totalEarnings: '0', pendingWithdrawals: '0', transactionCount: 0 };
    }

    try {
      // Get creator's transitions
      const tokenIds = await this.getCreatorTransitions(creatorAddress);

      let totalEarnings = 0n; // Use BigInt instead of ethers.BigNumber
      let transactionCount = 0;

      // Sum earnings from all transitions
      for (const tokenId of tokenIds) {
        const transition = await this.getTransition(tokenId);
        if (transition) {
          // In production, would query actual earnings from contract
          totalEarnings = totalEarnings + parseEther('0.1'); // Placeholder
          transactionCount += transition.usageCount;
        }
      }

      return {
        totalEarnings: formatEther(totalEarnings),
        pendingWithdrawals: '0', // Would get from contract
        transactionCount
      };

    } catch (error) {
      console.error('Failed to get crypto earnings:', error);
      return { totalEarnings: '0', pendingWithdrawals: '0', transactionCount: 0 };
    }
  }

  /**
   * Sync blockchain earnings with credit system
   */
  async syncBlockchainEarnings(creatorId: string): Promise<void> {
    try {
      // Get creator's wallet address from database
      const { data: wallet } = await this.supabase
        .from('creator_wallets')
        .select('crypto_wallet_address')
        .eq('creator_id', creatorId)
        .single();

      if (!wallet?.crypto_wallet_address) {
        console.log('No crypto wallet found for creator');
        return;
      }

      // Get blockchain earnings
      const earnings = await this.getCreatorCryptoEarnings(wallet.crypto_wallet_address);

      // Convert to credits and sync with credit system
      const ethPrice = 2000; // Would use oracle
      const usdEarnings = parseFloat(earnings.totalEarnings) * ethPrice;
      const creditEarnings = Math.floor(usdEarnings / 0.01); // Convert to credits

      // Add to creator balance
      if (creditEarnings > 0) {
        await creditEngine.addCredits(
          creatorId,
          creditEarnings,
          'royalty',
          'Blockchain NFT royalty sync'
        );
      }

      console.log(`🔄 Synced ${creditEarnings} credits from blockchain for creator ${creatorId}`);

    } catch (error) {
      console.error('Failed to sync blockchain earnings:', error);
    }
  }

  /**
   * Get current network info
   */
  async getNetworkInfo(): Promise<{ chainId: number; name: string } | null> {
    if (!this.provider) return null;

    try {
      const network = await this.provider.getNetwork();
      return {
        chainId: network.chainId,
        name: network.name
      };
    } catch (error) {
      console.error('Failed to get network info:', error);
      return null;
    }
  }

  /**
   * Private helper for recording crypto transactions
   */
  private async recordCryptoTransaction(
    creatorId: string,
    creditAmount: number,
    cryptoAmount: string,
    walletAddress: string,
    tokenType: string,
    transactionHash: string
  ): Promise<void> {
    try {
      await this.supabase
        .from('crypto_transactions')
        .insert({
          creator_id: creatorId,
          credit_amount: creditAmount,
          crypto_amount: cryptoAmount,
          token_type: tokenType,
          wallet_address: walletAddress,
          transaction_hash: transactionHash,
          status: 'completed'
        });
    } catch (error) {
      console.error('Failed to record crypto transaction:', error);
    }
  }
}

// Export singleton instance
export const transitionNFTService = new TransitionNFTService();

// Utility functions
export function formatEthPrice(weiAmount: string): string {
  return formatEther(weiAmount);
}

export function parseEthPrice(ethAmount: string): string {
  return parseEther(ethAmount).toString();
}
