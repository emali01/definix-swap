import React from 'react'
import { Redirect, RouteComponentProps } from 'react-router-dom'
import Swap from './index'
import { WKLAY_ADDRESS } from '../../config'

// Redirects to swap but only replace the pathname
export function RedirectPathToSwapOnly({ location }: RouteComponentProps) {
  return <Redirect to={{ ...location, pathname: '/swap' }} />
}

export function RedirectToSwap(props: RouteComponentProps<{ currencyIdA: string; currencyIdB: string }>) {
  const {
    match: {
      params: { currencyIdA, currencyIdB },
    },
  } = props
  if (currencyIdA && currencyIdB && currencyIdA.toLowerCase() === currencyIdB.toLowerCase()) {
    const translateToken = currencyIdA === "0x0000000000000000000000000000000000000000" ? WKLAY_ADDRESS[process.env.REACT_APP_CHAIN_ID].toLowerCase() : currencyIdA
    return <Redirect to={`/swap?inputCurrency=${translateToken}`} />
  }
  if (currencyIdA && !currencyIdB) {
    const translateToken = currencyIdA === "0x0000000000000000000000000000000000000000" ? WKLAY_ADDRESS[process.env.REACT_APP_CHAIN_ID].toLowerCase() : currencyIdA
    return <Redirect to={`/swap?inputCurrency=${translateToken}`} />
  }
  if (currencyIdA && currencyIdB) {
    const translateToken = currencyIdA === "0x0000000000000000000000000000000000000000" ? WKLAY_ADDRESS[process.env.REACT_APP_CHAIN_ID].toLowerCase() : currencyIdA
    const translateTokenB = currencyIdB === "0x0000000000000000000000000000000000000000" ? WKLAY_ADDRESS[process.env.REACT_APP_CHAIN_ID].toLowerCase() : currencyIdB
    return <Redirect to={`/swap?inputCurrency=${translateToken}&outputCurrency=${translateTokenB}`} />
  }
  return <Swap {...props} />
}

export default RedirectPathToSwapOnly
