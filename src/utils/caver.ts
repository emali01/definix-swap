import Caver from 'caver-js'
// import { HttpProviderOptions } from 'web3-core-helpers'
import { AbiItem } from 'web3-utils'
import { ContractOptions } from 'web3-eth-contract'
import getRpcUrl from 'utils/getRpcUrl'

const RPC_URL = getRpcUrl()
// const httpProvider = new Caver.providers.HttpProvider(RPC_URL, { timeout: 10000 })
// eslint-disable-next-line
declare const window: any;
const baseCaver = new Caver(window.klaytn)
const Contract = baseCaver.contract

/**
 * Provides a web3 instance using our own private provider httpProver
 */
const getCaver = () => {
  const caver = baseCaver
  return caver
}
const getContract = (abi: any, address: string, contractOptions?: ContractOptions) => {
  const caver = getCaver()
  // eslint-disable-next-line
  return new caver.contract((abi as unknown) as AbiItem, address, contractOptions)
}

export { getCaver, getContract, Contract }
