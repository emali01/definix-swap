import { JSBI, Percent, Token, WETH, Config } from 'definixswap-sdk'
import sdkConfig from '../config'

Config.configure(sdkConfig)

export const ROUTER_ADDRESS = process.env.REACT_APP_ROUTER_ADDRESS

export const ChainId = {
  MAINNET: parseInt(process.env.REACT_APP_MAINNET_ID || '0') || 0,
  TESTNET: parseInt(process.env.REACT_APP_TESTNET_ID || '0') || 0
}

export const FACTORY_ADDRESS = {
  [ChainId.MAINNET]: process.env.REACT_APP_MAINNET_FACTORY_ADDRESS || '',
  [ChainId.TESTNET]: process.env.REACT_APP_TESTNET_FACTORY_ADDRESS || ''
}

// a list of tokens by chain
type ChainTokenList = {
  readonly [chainId: number]: Token[]
}

export const DEPARAM_ADDRESS = {
  [ChainId.MAINNET]: process.env.REACT_APP_DEPARAM_ADDRESS_MAINNET || '',
  [ChainId.TESTNET]: process.env.REACT_APP_DEPARAM_ADDRESS_TESTNET || ''
}

export const MULTICALL_ADDRESS = {
  [ChainId.MAINNET]: process.env.REACT_APP_MULTICALL_ADDRESS_MAINNET || '',
  [ChainId.TESTNET]: process.env.REACT_APP_MULTICALL_ADDRESS_TESTNET || ''
}

export const SIX_ADDRESS = {
  [ChainId.MAINNET]: process.env.REACT_APP_SIX_ADDRESS_MAINNET || '',
  [ChainId.TESTNET]: process.env.REACT_APP_SIX_ADDRESS_TESTNET || ''
}

export const FINIX_ADDRESS = {
  [ChainId.MAINNET]: process.env.REACT_APP_FINIX_ADDRESS_MAINNET || '',
  [ChainId.TESTNET]: process.env.REACT_APP_FINIX_ADDRESS_TESTNET || ''
}

export const KSP_ADDRESS = {
  [ChainId.MAINNET]: process.env.REACT_APP_KSP_ADDRESS_MAINNET || '',
  [ChainId.TESTNET]: process.env.REACT_APP_KSP_ADDRESS_TESTNET || ''
}

export const KDAI_ADDRESS = {
  [ChainId.MAINNET]: process.env.REACT_APP_KDAI_ADDRESS_MAINNET || '',
  [ChainId.TESTNET]: process.env.REACT_APP_KDAI_ADDRESS_TESTNET || ''
}

export const KUSDT_ADDRESS = {
  [ChainId.MAINNET]: process.env.REACT_APP_KUSDT_ADDRESS_MAINNET || '',
  [ChainId.TESTNET]: process.env.REACT_APP_KUSDT_ADDRESS_TESTNET || ''
}

export const WKLAY_ADDRESS = {
  [ChainId.MAINNET]: process.env.REACT_APP_WKLAY_ADDRESS_MAINNET || '',
  [ChainId.TESTNET]: process.env.REACT_APP_WKLAY_ADDRESS_TESTNET || ''
}

export const KETH_ADDRESS = {
  [ChainId.MAINNET]: process.env.REACT_APP_KETH_ADDRESS_MAINNET || '',
  [ChainId.TESTNET]: process.env.REACT_APP_KETH_ADDRESS_TESTNET || ''
}

export const KWBTC_ADDRESS = {
  [ChainId.MAINNET]: process.env.REACT_APP_KWBTC_ADDRESS_MAINNET || '',
  [ChainId.TESTNET]: process.env.REACT_APP_KWBTC_ADDRESS_TESTNET || ''
}

export const KXRP_ADDRESS = {
  [ChainId.MAINNET]: process.env.REACT_APP_KXRP_ADDRESS_MAINNET || '',
  [ChainId.TESTNET]: process.env.REACT_APP_KXRP_ADDRESS_TESTNET || ''
}

export const KBNB_ADDRESS = {
  [ChainId.MAINNET]: process.env.REACT_APP_KBNB_ADDRESS_MAINNET || '',
  [ChainId.TESTNET]: process.env.REACT_APP_KBNB_ADDRESS_TESTNET || ''
}

export const FINIX_SIX_LP = {
  [ChainId.MAINNET]: process.env.REACT_APP_FINIX_SIX_LP_MAINNET || '',
  [ChainId.TESTNET]: process.env.REACT_APP_FINIX_SIX_LP_TESTNET || ''
}

export const FINIX_KUSDT_LP = {
  [ChainId.MAINNET]: process.env.REACT_APP_FINIX_KUSDT_LP_MAINNET || '',
  [ChainId.TESTNET]: process.env.REACT_APP_FINIX_KUSDT_LP_TESTNET || ''
}

export const FINIX_KLAY_LP = {
  [ChainId.MAINNET]: process.env.REACT_APP_FINIX_KLAY_LP_MAINNET || '',
  [ChainId.TESTNET]: process.env.REACT_APP_FINIX_KLAY_LP_TESTNET || ''
}

export const FINIX_KSP_LP = {
  [ChainId.MAINNET]: process.env.REACT_APP_FINIX_KSP_LP_MAINNET || '',
  [ChainId.TESTNET]: process.env.REACT_APP_FINIX_KSP_LP_TESTNET || ''
}

export const SIX_KUSDT_LP = {
  [ChainId.MAINNET]: process.env.REACT_APP_SIX_KUSDT_LP_MAINNET || '',
  [ChainId.TESTNET]: process.env.REACT_APP_SIX_KUSDT_LP_TESTNET || ''
}

export const SIX_KLAY_LP = {
  [ChainId.MAINNET]: process.env.REACT_APP_SIX_KLAY_LP_MAINNET || '',
  [ChainId.TESTNET]: process.env.REACT_APP_SIX_KLAY_LP_TESTNET || ''
}

export const KUSDT_KDAI_LP = {
  [ChainId.MAINNET]: process.env.REACT_APP_KUSDT_KDAI_LP_MAINNET || '',
  [ChainId.TESTNET]: process.env.REACT_APP_KUSDT_KDAI_LP_TESTNET || ''
}

export const KLAY_KUSDT_LP = {
  [ChainId.MAINNET]: process.env.REACT_APP_KLAY_KUSDT_LP_MAINNET || '',
  [ChainId.TESTNET]: process.env.REACT_APP_KLAY_KUSDT_LP_TESTNET || ''
}

export const KLAY_KETH_LP = {
  [ChainId.MAINNET]: process.env.REACT_APP_KLAY_KETH_LP_MAINNET || '',
  [ChainId.TESTNET]: process.env.REACT_APP_KLAY_KETH_LP_TESTNET || ''
}

export const KLAY_KBTC_LP = {
  [ChainId.MAINNET]: process.env.REACT_APP_KLAY_KBTC_LP_MAINNET || '',
  [ChainId.TESTNET]: process.env.REACT_APP_KLAY_KBTC_LP_TESTNET || ''
}

export const KLAY_KXRP_LP = {
  [ChainId.MAINNET]: process.env.REACT_APP_KLAY_KXRP_LP_MAINNET || '',
  [ChainId.TESTNET]: process.env.REACT_APP_KLAY_KXRP_LP_TESTNET || ''
}

export const KETH_KUSDT_LP = {
  [ChainId.MAINNET]: process.env.REACT_APP_KETH_KUSDT_LP_MAINNET || '',
  [ChainId.TESTNET]: process.env.REACT_APP_KETH_KUSDT_LP_TESTNET || ''
}

export const KBTC_KUSDT_LP = {
  [ChainId.MAINNET]: process.env.REACT_APP_KBTC_KUSDT_LP_MAINNET || '',
  [ChainId.TESTNET]: process.env.REACT_APP_KBTC_KUSDT_LP_TESTNET || ''
}

export const KXRP_KUSDT_LP = {
  [ChainId.MAINNET]: process.env.REACT_APP_KXRP_KUSDT_LP_MAINNET || '',
  [ChainId.TESTNET]: process.env.REACT_APP_KXRP_KUSDT_LP_TESTNET || ''
}

export const HERODOTUS_ADDRESS = {
  [ChainId.MAINNET]: process.env.REACT_APP_HERODOTUS_MAINNET || '', // ==================
  [ChainId.TESTNET]: process.env.REACT_APP_HERODOTUS_TESTNET || ''
}

export const PANCAKE_MASTER_CHEF_ADDRESS = {
  [ChainId.MAINNET]: process.env.REACT_APP_PANCAKE_MASTER_CHEF_MAINNET || '', // ==================
  [ChainId.TESTNET]: process.env.REACT_APP_PANCAKE_MASTER_CHEF_TESTNET || ''
}

export const DAI = new Token(
  ChainId.MAINNET,
  '0xf24400CA87E2260FaA63233c2Be8e4259B214E4E',
  18,
  'KDAI',
  'Dai Stablecoin'
)
// export const BUSD = new Token(ChainId.MAINNET, '0xe9e7cea3dedca5984780bafc599bd69add087d56', 18, 'BUSD', 'Binance USD')
export const USDT = new Token(ChainId.MAINNET, '0x72f58bF36Ce713D408a854C060FbF89A25F87C4C', 18, 'KUSDT', 'Tether USD')
// export const UST = new Token(
//   ChainId.MAINNET,
//   '0x23396cf899ca06c4472205fc903bdb4de249d6fc',
//   18,
//   'UST',
//   'Wrapped UST Token'
// )

const WETH_ONLY: ChainTokenList = {
  [ChainId.MAINNET]: [WETH(ChainId.MAINNET)],
  [ChainId.TESTNET]: [WETH(ChainId.TESTNET)]
}

// used to construct intermediary pairs for trading
export const BASES_TO_CHECK_TRADES_AGAINST: ChainTokenList = {
  ...WETH_ONLY,
  [ChainId.TESTNET]: [
    new Token(ChainId.TESTNET, SIX_ADDRESS[ChainId.TESTNET], 18, 'SIX', 'SIX Token'),
    new Token(ChainId.TESTNET, FINIX_ADDRESS[ChainId.TESTNET], 18, 'FINIX', 'FINIX Token'),
    new Token(ChainId.TESTNET, KUSDT_ADDRESS[ChainId.TESTNET], 18, 'KUSDT', 'KUSDT Token'),
    new Token(ChainId.TESTNET, WKLAY_ADDRESS[ChainId.TESTNET], 18, 'WKLAY', 'Wrapped KLAY'),
    new Token(ChainId.TESTNET, KUSDT_ADDRESS[ChainId.TESTNET], 18, 'KUSDT', 'KUSDT Token'),
    new Token(ChainId.TESTNET, KSP_ADDRESS[ChainId.TESTNET], 18, 'KSP', 'KLAY Swap Protocol'),
    new Token(ChainId.TESTNET, KDAI_ADDRESS[ChainId.TESTNET], 18, 'KDAI', 'KDAI Token'),
    new Token(ChainId.TESTNET, KETH_ADDRESS[ChainId.TESTNET], 18, 'KETH', 'KETH Token'),
    new Token(ChainId.TESTNET, KWBTC_ADDRESS[ChainId.TESTNET], 18, 'KBTC', 'KBTC Token'),
    new Token(ChainId.TESTNET, KXRP_ADDRESS[ChainId.TESTNET], 18, 'KXRP', 'KXRP Token'),
    new Token(ChainId.TESTNET, KBNB_ADDRESS[ChainId.TESTNET], 18, 'KBNB', 'KBNB Token')
  ],
  [ChainId.MAINNET]: [
    ...WETH_ONLY[ChainId.MAINNET],
    DAI,
    USDT,
    new Token(ChainId.MAINNET, SIX_ADDRESS[ChainId.MAINNET], 18, 'SIX', 'SIX Token'),
    new Token(ChainId.MAINNET, FINIX_ADDRESS[ChainId.MAINNET], 18, 'FINIX', 'FINIX Token'),
    new Token(ChainId.MAINNET, KUSDT_ADDRESS[ChainId.MAINNET], 18, 'KUSDT', 'KUSDT Token'),
    new Token(ChainId.MAINNET, WKLAY_ADDRESS[ChainId.MAINNET], 18, 'WKLAY', 'Wrapped KLAY'),
    new Token(ChainId.MAINNET, KUSDT_ADDRESS[ChainId.MAINNET], 18, 'KUSDT', 'KUSDT Token'),
    new Token(ChainId.MAINNET, KSP_ADDRESS[ChainId.MAINNET], 18, 'KSP', 'KLAY Swap Protocol'),
    new Token(ChainId.MAINNET, KDAI_ADDRESS[ChainId.MAINNET], 18, 'KDAI', 'KDAI Token'),
    new Token(ChainId.MAINNET, KWBTC_ADDRESS[ChainId.MAINNET], 18, 'KBTC', 'KBTC Token'),
    new Token(ChainId.MAINNET, KETH_ADDRESS[ChainId.MAINNET], 18, 'KETH', 'KETH Token'),
    new Token(ChainId.MAINNET, KXRP_ADDRESS[ChainId.MAINNET], 18, 'KXRP', 'KXRP Token'),
    new Token(ChainId.MAINNET, KBNB_ADDRESS[ChainId.MAINNET], 18, 'KBNB', 'KBNB Token')
  ]
}

/**
 * Some tokens can only be swapped via certain pairs, so we override the list of bases that are considered for these
 * tokens.
 */
export const CUSTOM_BASES: { [chainId: number]: { [tokenAddress: string]: Token[] } } = {
  [ChainId.MAINNET]: {}
}

// used for display in the default list when adding liquidity
export const SUGGESTED_BASES: ChainTokenList = {
  ...WETH_ONLY,
  [ChainId.MAINNET]: [...WETH_ONLY[ChainId.MAINNET], DAI, USDT]
}

// used to construct the list of all pairs we consider by default in the frontend
export const BASES_TO_TRACK_LIQUIDITY_FOR: ChainTokenList = {
  ...WETH_ONLY,
  [ChainId.MAINNET]: [...WETH_ONLY[ChainId.MAINNET], DAI, USDT]
}

export const PINNED_PAIRS: { readonly [chainId: number]: [Token, Token][] } = {
  [ChainId.MAINNET]: [
    [
      new Token(ChainId.TESTNET, SIX_ADDRESS[ChainId.MAINNET], 18, 'SIX', 'SIX Token'),
      new Token(ChainId.TESTNET, FINIX_ADDRESS[ChainId.MAINNET], 18, 'FINIX', 'FINIX Token')
    ],
    [
      new Token(ChainId.TESTNET, SIX_ADDRESS[ChainId.MAINNET], 18, 'SIX', 'SIX Token'),
      new Token(ChainId.TESTNET, KUSDT_ADDRESS[ChainId.MAINNET], 18, 'KUSDT', 'KUSDT Token')
    ],
    [
      new Token(ChainId.TESTNET, SIX_ADDRESS[ChainId.MAINNET], 18, 'SIX', 'SIX Token'),
      new Token(ChainId.TESTNET, WKLAY_ADDRESS[ChainId.MAINNET], 18, 'WKLAY', 'Wrapped KLAY')
    ],
    [
      new Token(ChainId.TESTNET, FINIX_ADDRESS[ChainId.MAINNET], 18, 'FINIX', 'FINIX Token'),
      new Token(ChainId.TESTNET, KUSDT_ADDRESS[ChainId.MAINNET], 18, 'KUSDT', 'KUSDT Token')
    ],
    [
      new Token(ChainId.TESTNET, FINIX_ADDRESS[ChainId.MAINNET], 18, 'FINIX', 'FINIX Token'),
      new Token(ChainId.TESTNET, WKLAY_ADDRESS[ChainId.MAINNET], 18, 'WKLAY', 'Wrapped KLAY')
    ],
    [
      new Token(ChainId.TESTNET, FINIX_ADDRESS[ChainId.MAINNET], 18, 'FINIX', 'FINIX Token'),
      new Token(ChainId.TESTNET, KSP_ADDRESS[ChainId.MAINNET], 18, 'KSP', 'KLAY Swap Protocol')
    ],
    [
      new Token(ChainId.TESTNET, WKLAY_ADDRESS[ChainId.MAINNET], 18, 'WKLAY', 'Wrapped KLAY'),
      new Token(ChainId.TESTNET, KUSDT_ADDRESS[ChainId.MAINNET], 18, 'KUSDT', 'KUSDT Token')
    ],
    [
      new Token(ChainId.TESTNET, KDAI_ADDRESS[ChainId.MAINNET], 18, 'KDAI', 'KDAI Token'),
      new Token(ChainId.TESTNET, KUSDT_ADDRESS[ChainId.MAINNET], 18, 'KUSDT', 'KUSDT Token')
    ],
    [
      new Token(ChainId.TESTNET, KETH_ADDRESS[ChainId.MAINNET], 18, 'KETH', 'KETH Token'),
      new Token(ChainId.TESTNET, WKLAY_ADDRESS[ChainId.MAINNET], 18, 'WKLAY', 'Wrapped KLAY')
    ],
    [
      new Token(ChainId.TESTNET, KWBTC_ADDRESS[ChainId.MAINNET], 18, 'KBTC', 'KBTC Token'),
      new Token(ChainId.TESTNET, WKLAY_ADDRESS[ChainId.MAINNET], 18, 'WKLAY', 'Wrapped KLAY')
    ],
    [
      new Token(ChainId.TESTNET, KXRP_ADDRESS[ChainId.MAINNET], 18, 'KXRP', 'KXRP Token'),
      new Token(ChainId.TESTNET, WKLAY_ADDRESS[ChainId.MAINNET], 18, 'WKLAY', 'Wrapped KLAY')
    ],
    [
      new Token(ChainId.TESTNET, KETH_ADDRESS[ChainId.MAINNET], 18, 'KETH', 'KETH Token'),
      new Token(ChainId.TESTNET, KUSDT_ADDRESS[ChainId.MAINNET], 18, 'KUSDT', 'KUSDT Token')
    ],
    [
      new Token(ChainId.TESTNET, KWBTC_ADDRESS[ChainId.MAINNET], 18, 'KBTC', 'KBTC Token'),
      new Token(ChainId.TESTNET, KUSDT_ADDRESS[ChainId.MAINNET], 18, 'KUSDT', 'KUSDT Token')
    ],
    [
      new Token(ChainId.TESTNET, KXRP_ADDRESS[ChainId.MAINNET], 18, 'KXRP', 'KXRP Token'),
      new Token(ChainId.TESTNET, KUSDT_ADDRESS[ChainId.MAINNET], 18, 'KUSDT', 'KUSDT Token')
    ],
    [
      new Token(ChainId.TESTNET, KBNB_ADDRESS[ChainId.MAINNET], 18, 'KBNB', 'KBNB Token'),
      new Token(ChainId.TESTNET, KUSDT_ADDRESS[ChainId.MAINNET], 18, 'KUSDT', 'KUSDT Token')
    ],
    [
      new Token(ChainId.TESTNET, KBNB_ADDRESS[ChainId.MAINNET], 18, 'KBNB', 'KBNB Token'),
      new Token(ChainId.TESTNET, FINIX_ADDRESS[ChainId.MAINNET], 18, 'FINIX', 'FINIX Token')
    ]
  ],
  [ChainId.TESTNET]: [
    [
      new Token(ChainId.TESTNET, SIX_ADDRESS[ChainId.TESTNET], 18, 'SIX', 'SIX Token'),
      new Token(ChainId.TESTNET, FINIX_ADDRESS[ChainId.TESTNET], 18, 'FINIX', 'FINIX Token')
    ],
    [
      new Token(ChainId.TESTNET, SIX_ADDRESS[ChainId.TESTNET], 18, 'SIX', 'SIX Token'),
      new Token(ChainId.TESTNET, KUSDT_ADDRESS[ChainId.TESTNET], 18, 'KUSDT', 'KUSDT Token')
    ],
    [
      new Token(ChainId.TESTNET, SIX_ADDRESS[ChainId.TESTNET], 18, 'SIX', 'SIX Token'),
      new Token(ChainId.TESTNET, WKLAY_ADDRESS[ChainId.TESTNET], 18, 'WKLAY', 'Wrapped KLAY')
    ],
    [
      new Token(ChainId.TESTNET, FINIX_ADDRESS[ChainId.TESTNET], 18, 'FINIX', 'FINIX Token'),
      new Token(ChainId.TESTNET, KUSDT_ADDRESS[ChainId.TESTNET], 18, 'KUSDT', 'KUSDT Token')
    ],
    [
      new Token(ChainId.TESTNET, FINIX_ADDRESS[ChainId.TESTNET], 18, 'FINIX', 'FINIX Token'),
      new Token(ChainId.TESTNET, WKLAY_ADDRESS[ChainId.TESTNET], 18, 'WKLAY', 'Wrapped KLAY')
    ],
    [
      new Token(ChainId.TESTNET, FINIX_ADDRESS[ChainId.TESTNET], 18, 'FINIX', 'FINIX Token'),
      new Token(ChainId.TESTNET, KSP_ADDRESS[ChainId.TESTNET], 18, 'KSP', 'KLAY Swap Protocol')
    ],
    [
      new Token(ChainId.TESTNET, WKLAY_ADDRESS[ChainId.TESTNET], 18, 'WKLAY', 'Wrapped KLAY'),
      new Token(ChainId.TESTNET, KUSDT_ADDRESS[ChainId.TESTNET], 18, 'KUSDT', 'KUSDT Token')
    ],
    [
      new Token(ChainId.TESTNET, KDAI_ADDRESS[ChainId.TESTNET], 18, 'KDAI', 'KDAI Token'),
      new Token(ChainId.TESTNET, KUSDT_ADDRESS[ChainId.TESTNET], 18, 'KUSDT', 'KUSDT Token')
    ],
    [
      new Token(ChainId.TESTNET, KETH_ADDRESS[ChainId.TESTNET], 18, 'KETH', 'KETH Token'),
      new Token(ChainId.TESTNET, WKLAY_ADDRESS[ChainId.TESTNET], 18, 'WKLAY', 'Wrapped KLAY')
    ],
    [
      new Token(ChainId.TESTNET, KWBTC_ADDRESS[ChainId.TESTNET], 18, 'KBTC', 'KBTC Token'),
      new Token(ChainId.TESTNET, WKLAY_ADDRESS[ChainId.TESTNET], 18, 'WKLAY', 'Wrapped KLAY')
    ],
    [
      new Token(ChainId.TESTNET, KXRP_ADDRESS[ChainId.TESTNET], 18, 'KXRP', 'KXRP Token'),
      new Token(ChainId.TESTNET, WKLAY_ADDRESS[ChainId.TESTNET], 18, 'WKLAY', 'Wrapped KLAY')
    ],
    [
      new Token(ChainId.TESTNET, KETH_ADDRESS[ChainId.TESTNET], 18, 'KETH', 'KETH Token'),
      new Token(ChainId.TESTNET, KUSDT_ADDRESS[ChainId.TESTNET], 18, 'KUSDT', 'KUSDT Token')
    ],
    [
      new Token(ChainId.TESTNET, KWBTC_ADDRESS[ChainId.TESTNET], 18, 'KBTC', 'KBTC Token'),
      new Token(ChainId.TESTNET, KUSDT_ADDRESS[ChainId.TESTNET], 18, 'KUSDT', 'KUSDT Token')
    ],
    [
      new Token(ChainId.TESTNET, KXRP_ADDRESS[ChainId.TESTNET], 18, 'KXRP', 'KXRP Token'),
      new Token(ChainId.TESTNET, KUSDT_ADDRESS[ChainId.TESTNET], 18, 'KUSDT', 'KUSDT Token')
    ],
    [
      new Token(ChainId.TESTNET, KBNB_ADDRESS[ChainId.TESTNET], 18, 'KBNB', 'KBNB Token'),
      new Token(ChainId.TESTNET, KUSDT_ADDRESS[ChainId.TESTNET], 18, 'KUSDT', 'KUSDT Token')
    ],
    [
      new Token(ChainId.TESTNET, KBNB_ADDRESS[ChainId.TESTNET], 18, 'KBNB', 'KBNB Token'),
      new Token(ChainId.TESTNET, FINIX_ADDRESS[ChainId.TESTNET], 18, 'FINIX', 'FINIX Token')
    ]
  ]
}

export const NetworkContextName = 'NETWORK'

// default allowed slippage, in bips
export const INITIAL_ALLOWED_SLIPPAGE = 80
// 20 minutes, denominated in seconds
export const DEFAULT_DEADLINE_FROM_NOW = 60 * 20

// one basis point
export const ONE_BIPS = new Percent(JSBI.BigInt(1), JSBI.BigInt(10000))
export const BIPS_BASE = JSBI.BigInt(10000)
// used for warning states
export const ALLOWED_PRICE_IMPACT_LOW: Percent = new Percent(JSBI.BigInt(100), BIPS_BASE) // 1%
export const ALLOWED_PRICE_IMPACT_MEDIUM: Percent = new Percent(JSBI.BigInt(300), BIPS_BASE) // 3%
export const ALLOWED_PRICE_IMPACT_HIGH: Percent = new Percent(JSBI.BigInt(500), BIPS_BASE) // 5%
// if the price slippage exceeds this number, force the user to type 'confirm' to execute
export const PRICE_IMPACT_WITHOUT_FEE_CONFIRM_MIN: Percent = new Percent(JSBI.BigInt(1000), BIPS_BASE) // 10%
// for non expert mode disable swaps above this
export const BLOCKED_PRICE_IMPACT_NON_EXPERT: Percent = new Percent(JSBI.BigInt(1500), BIPS_BASE) // 15%

// used to ensure the user doesn't send so much ETH so they end up with <.01
export const MIN_ETH: JSBI = JSBI.exponentiate(JSBI.BigInt(10), JSBI.BigInt(16)) // .01 ETH
