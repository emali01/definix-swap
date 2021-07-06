import React,{useContext} from 'react'
import { KlipModalContext } from "klaytn-use-wallet"
import { abi as IUniswapV2Router02ABI } from '@uniswap/v2-periphery/build/IUniswapV2Router02.json'

export const { setShowModal ,showModal} = useContext(KlipModalContext())

