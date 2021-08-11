import { AbiItem } from 'web3-utils'
import { Interface } from '@ethersproject/abi'
import { getCaver } from 'utils/caver'
import MultiCallAbi from 'constants/multicall/abi.json'

interface Call {
  address: string // Address of the contract
  name: string // Function name on the contract (exemple: balanceOf)
  params?: any[] // Function params
}

const multicall = async (address: string, abi: any[], calls: Call[]) => {
  const caver = await getCaver()
  const multi = new caver.klay.Contract((MultiCallAbi as unknown) as AbiItem, address)
  const itf = new Interface(abi)

  const calldata = calls.map((call) => [call.address.toLowerCase(), itf.encodeFunctionData(call.name, call.params)])
  const { returnData } = await multi.methods.aggregate(calldata).call()
  const res = returnData.map((call, i) => itf.decodeFunctionResult(calls[i].name, call))

  return res
}

export default multicall
