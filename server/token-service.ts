interface TokenMetadata {
  name: string;
  symbol: string;
  logo?: string;
  decimals?: string;
  mint: string;
}

interface MoralisTokenResponse {
  mint: string;
  standard: string;
  name: string;
  symbol: string;
  logo?: string;
  decimals?: string;
}

export class TokenService {
  private moralisApiKey?: string;

  constructor() {
    this.moralisApiKey = process.env.MORALIS_API_KEY;
  }

  async getTokenMetadata(contractAddress: string): Promise<TokenMetadata | null> {
    // If no API key, return null to fall back to mock data
    if (!this.moralisApiKey) {
      console.log("No Moralis API key found, using mock data");
      return null;
    }

    try {
      const response = await fetch(
        `https://solana-gateway.moralis.io/token/mainnet/${contractAddress}/metadata`,
        {
          headers: {
            'X-API-Key': this.moralisApiKey,
            'Accept': 'application/json'
          }
        }
      );

      if (!response.ok) {
        console.error(`Moralis API error: ${response.status} ${response.statusText}`);
        return null;
      }

      const data: MoralisTokenResponse = await response.json();
      
      return {
        name: data.name || `Token ${contractAddress.slice(0, 4)}`,
        symbol: data.symbol || 'UNK',
        logo: data.logo,
        decimals: data.decimals,
        mint: data.mint
      };
    } catch (error) {
      console.error('Error fetching token metadata:', error);
      return null;
    }
  }

  // Alternative: Try DexScreener API as fallback (no API key required)
  async getTokenMetadataFallback(contractAddress: string): Promise<TokenMetadata | null> {
    try {
      const response = await fetch(`https://api.dexscreener.com/latest/dex/tokens/${contractAddress}`);
      
      if (!response.ok) {
        return null;
      }

      const data = await response.json();
      
      if (data.pairs && data.pairs.length > 0) {
        const pair = data.pairs[0];
        const token = pair.baseToken?.address === contractAddress ? pair.baseToken : pair.quoteToken;
        
        if (token) {
          return {
            name: token.name || `Token ${contractAddress.slice(0, 4)}`,
            symbol: token.symbol || 'UNK',
            logo: token.logo,
            mint: contractAddress
          };
        }
      }

      return null;
    } catch (error) {
      console.error('Error fetching token metadata from DexScreener:', error);
      return null;
    }
  }

  async getTokenMetadataWithFallback(contractAddress: string): Promise<TokenMetadata | null> {
    // Try Moralis first
    let metadata = await this.getTokenMetadata(contractAddress);
    
    // If Moralis fails, try DexScreener
    if (!metadata) {
      metadata = await this.getTokenMetadataFallback(contractAddress);
    }

    return metadata;
  }
}

export const tokenService = new TokenService();