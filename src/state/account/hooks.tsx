/* eslint-disable import/prefer-default-export */
import { useDispatch, useSelector } from 'react-redux'
import { useCallback } from 'react'

import { AppDispatch, AppState } from '../index'
import { updateAccountAddress } from './actions'

export default function useAccount(): [string | null | undefined, (name: string | undefined | null) => void] {
  const dispatch = useDispatch<AppDispatch>()
  const account = useSelector<AppState, AppState['account']['account']>((state) => state.account.account)
  const setAccount = useCallback(
    (newAccount: string | undefined | null) => {
      dispatch(updateAccountAddress({ accountAddress: newAccount }))
    },
    [dispatch]
  )
  return [account, setAccount]
}
