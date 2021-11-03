import BigNumber from 'bignumber.js'
import { useEffect, useState } from 'react'
import _ from 'lodash'
import { useSingleCallResult } from '../state/multicall/hooks'
import { useActiveWeb3React } from './index'
import { useTokenContract } from './useContract'
import { VFINIX_ADDRESS } from '../constants'

// export const getVfinixBalance = () => {
//     const { chainId = parseInt(process.env.REACT_APP_CHAIN_ID || '0'), account } = useActiveWeb3React()
//     const [balanceVfinix, setBalanceVfinix] = useState<number>(0)
//     useEffect(() => {
//         const fetch = async () => {
//             const vfinixContract = useTokenContract(VFINIX_ADDRESS[chainId])
//             if (vfinixContract) {
//                 const n = +(await vfinixContract.balanceOf(account)).toFixed()
//                 setBalanceVfinix(n)
//             }
//         }
//         fetch()

//     }, [chainId, account])

// return balanceVfinix
// }

export default function useLongTermStake () {
    const [data, setData] = useState<number>(0)
    const { chainId = parseInt(process.env.REACT_APP_CHAIN_ID || '0'), account } = useActiveWeb3React()

    useEffect(() => {
        const fetch = async () => {
            const vfinixContract = useTokenContract(VFINIX_ADDRESS[parseInt(process.env.REACT_APP_CHAIN_ID|| "0")])
            const totalSupply: BigNumber = useSingleCallResult(vfinixContract, 'balanceOf',[account||""])?.result?.[0]
            console.log("totalSupply",totalSupply)
            setData(0)
        }
        fetch()
    }, [account,chainId])

    return data
}

