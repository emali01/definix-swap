import MULTICALL_ABI from './abi.json'
import { ChainId } from ".."

const MULTICALL_NETWORKS: { [chainId: number]: string } = {
  [ChainId.MAINNET]: process.env.REACT_APP_MULTICALL_ADDRESS_MAINNET || '',
  [ChainId.TESTNET]: process.env.REACT_APP_MULTICALL_ADDRESS_TESTNET || ''
}

export { MULTICALL_ABI, MULTICALL_NETWORKS }
