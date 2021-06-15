export enum QuoteToken {
  'KLAY' = 'KLAY',
  'SYRUP' = 'SYRUP',
  'KUSDT' = 'KUSDT',
  'KDAI' = 'KDAI',
  'KETH' = 'KETH',
  'KXRP' = 'KXRP',
  'KBTC' = 'KBTC',
  'KSP' = 'KSP',
  'KBNB' = 'KBNB',
  'SIX' = 'SIX',
  'FINIX' = 'FINIX',
  'SIXFINIX' = 'FINIX-SIX',
  'FINIXKUSDT' = 'FINIX-KUSDT',
  'FINIXKLAY' = 'FINIX-KLAY',
  'SIXKUSDT' = 'SIX-KUSDT',
  'KDAIKUSDT' = 'KDAI-KUSDT',
}

export interface Address {
  1001?: string
  8217?: string
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
}
