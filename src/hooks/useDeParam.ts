import multicall from '../utils/multicall'
import DEPARAM_ABI from '../constants/abis/deParam.json'
import {
  MULTICALL_ADDRESS,
  DEPARAM_ADDRESS,
} from '../constants'

const UseDeParam = async (key, defaultValue = '') => {
  const multicallContractAddress = MULTICALL_ADDRESS[process.env.REACT_APP_CHAIN_ID || '8217']
  const deParamContractAddress = DEPARAM_ADDRESS[process.env.REACT_APP_CHAIN_ID || '8217']

  const calls = [
    {
      address: deParamContractAddress,
      name: 'deParam',
      params: [key]
    },
  ]

  const [valuesResp] = await multicall(multicallContractAddress, DEPARAM_ABI, calls)

  // console.log(">>>>>>>>>>>>>>>>>>>>>>>> valuesResp = ", valuesResp.toString())

  return valuesResp !== null && valuesResp !== undefined && valuesResp.toString() !== null
    ? valuesResp.toString()
    : defaultValue
}

export default UseDeParam
