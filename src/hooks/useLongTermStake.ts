import BigNumber from 'bignumber.js'
import { useEffect, useState, useCallback, useMemo } from 'react'
import _ from 'lodash'
import { useSingleCallResult } from '../state/multicall/hooks'
import { useActiveWeb3React } from './index'
import addresses from '../constants/contracts'
import { useTokenContract } from './useContract'
import { getCaverContract } from '../utils/caver'
import VaultInfoFacet from '../constants/abis/VaultInfoFacet.json'

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

export const getAddress = (address: any): string => {
  const mainNetChainId = 8217
  const { chainId = parseInt(process.env.REACT_APP_CHAIN_ID || '0'), account } = useActiveWeb3React()
  return address[chainId] ? address[chainId] : address[mainNetChainId]
}

export default function useLongTermStake() {
  const [vfinixBalnace, setVfinixBalnace] = useState(new BigNumber(0))
  const { account } = useActiveWeb3React()
  const vfinixContract = useTokenContract(getAddress(addresses.vfinix), false)
  const vfinix: BigNumber = useSingleCallResult(vfinixContract, 'balanceOf', [account || undefined])?.result?.[0]

  const fetch = useCallback(() => {
    return setVfinixBalnace(new BigNumber(vfinix).dividedBy(new BigNumber(10).pow(18)))
  }, [vfinix])
  return { fetch, vfinixBalnace }
}

export const useRank = () => {
  const { account } = useActiveWeb3React()
  const [rank, setRank] = useState<string>()

  return useMemo(async () => {
    if (account) {
      const userVfinixInfoContract = getCaverContract(getAddress(addresses.vfinix), VaultInfoFacet.abi)
      const [userVfinixLocks] = await Promise.all([await userVfinixInfoContract.methods.locks(account, 0, 0).call()])
      let maxRank = -1
      for (let i = 0; i < userVfinixLocks.length; i++) {
        const selector = userVfinixLocks[i]
        if (selector.isUnlocked === false && selector.isPenalty === false) {
          if (maxRank < selector.level) maxRank = selector.level
        }
      }
      setRank(maxRank.toString())
      return maxRank
    }
    return rank
  }, [account, rank])
}
