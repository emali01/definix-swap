export enum QuoteToken {
  'KBNB' = 'KBNB',
  'SIX' = 'SIX',
  'FINIX' = 'FINIX',
  'BNB' = 'BNB',
  'SYRUP' = 'SYRUP',
  'BUSD' = 'BUSD',
  'USDT' = 'USDT',
  'BTCB' = 'BTCB',
  'XRP' = 'XRP',
  'ETH' = 'ETH',
  'ADA' = 'ADA',
  'KSP' = 'KSP',
  'SIXFINIX' = 'FINIX-SIX',
  'FINIXKUSDT' = 'FINIX-KUSDT',
  'FINIXKLAY' = 'FINIX-KLAY',
  'SIXKUSDT' = 'SIX-KUSDT',
  'KDAIKUSDT' = 'KDAI-KUSDT',
}

export interface Address {
  56?: string
  97?: string
}

export interface FarmConfig {
  pid: number
  lpSymbol: string
  lpAddresses: Address
  tokenSymbol: string
  tokenAddresses: Address
  quoteTokenSymbol: QuoteToken
  quoteTokenAdresses: Address
  multiplier?: string
  isCommunity?: boolean
  dual?: {
    rewardPerBlock: number
    earnLabel: string
    endBlock: number
  }
  firstSymbol?: string
  secondSymbol?: string
}
