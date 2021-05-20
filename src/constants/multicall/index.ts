import { ChainId } from 'definixswap-sdk'
import MULTICALL_ABI from './abi.json'

const MULTICALL_NETWORKS: { [chainId in ChainId]: string } = {
  [ChainId.MAINNET]: process.env.REACT_APP_MULTICALL_ADDRESS_MAINNET || '',
  [ChainId.BSCTESTNET]: process.env.REACT_APP_MULTICALL_ADDRESS_TESTNET || ''
}

export { MULTICALL_ABI, MULTICALL_NETWORKS }
