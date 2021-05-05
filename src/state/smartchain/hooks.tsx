/* eslint-disable import/prefer-default-export */
import { useDispatch, useSelector } from 'react-redux'
import { useCallback } from 'react'
import { AppDispatch, AppState } from '../index'
import { setSmartChianName } from './actions'

export function useSmartChain(): [string, (name: string) => void] {
  const dispatch = useDispatch<AppDispatch>()
  const SmartChainName = useSelector<AppState, AppState['smartchain']['smartchainName']>(
    (state) => state.smartchain.smartchainName
  )
  const setSmartChian = useCallback(
    (newname: string) => {
      dispatch(setSmartChianName({ name: newname }))
    },
    [dispatch]
  )
  return [SmartChainName, setSmartChian]
}
