export function isValidSolanaAddress(address: string): boolean {
  // Basic Solana address validation
  // Should be 32-44 characters, base58 encoded
  const base58Regex = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/;
  return base58Regex.test(address.trim());
}

export function formatAddress(address: string): string {
  if (address.length <= 8) return address;
  return `${address.slice(0, 4)}...${address.slice(-4)}`;
}

export function generateMockTokenData(address: string) {
  // Generate consistent mock data based on address
  const hash = address.split('').reduce((a, b) => {
    a = ((a << 5) - a) + b.charCodeAt(0);
    return a & a;
  }, 0);
  
  const names = ['RocketCoin', 'MoonToken', 'SafeCoin', 'DiamondHands', 'FireCoin', 'GemToken'];
  const symbols = ['ROCKET', 'MOON', 'SAFE', 'DIAMOND', 'FIRE', 'GEM'];
  const emojis = ['🚀', '🌙', '🛡️', '💎', '🔥', '💎'];
  
  const index = Math.abs(hash) % names.length;
  
  return {
    name: names[index],
    symbol: symbols[index],
    emoji: emojis[index]
  };
}
