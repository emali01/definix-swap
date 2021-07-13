import { abi as IUniswapV2Router02ABI } from '@uniswap/v2-periphery/build/IUniswapV2Router02.json'
import ERC20_ABI from '../constants/abis/erc20.json'


export const getApproveAbi = () => ERC20_ABI.find(abi => abi.type === 'function' && abi.name === 'approve')
export const getAbiByName = (methodName) => IUniswapV2Router02ABI.find(abi => abi.type === 'function' && abi.name === methodName)