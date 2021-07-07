import React from 'react'
import { useWeb3React } from '@web3-react/core'
import { Button, ButtonProps, ConnectorId, useWalletModal } from 'uikit-dev'
import { injected, walletconnect } from 'connectors'
import { useTranslation } from 'contexts/Localization'

const UnlockButton: React.FC<ButtonProps> = props => {
  const { t: translate } = useTranslation()
  const { account, activate, deactivate } = useWeb3React()

  const handleLogin = (connectorId: ConnectorId) => {
    if (connectorId === 'walletconnect') {
      return activate(walletconnect)
    }
    return activate(injected)
  }

  const { onPresentConnectModal } = useWalletModal(handleLogin, deactivate, account as string)

  return (
    <Button onClick={onPresentConnectModal} {...props}>
      {translate('Unlock Wallet')}
    </Button>
  )
}

export default UnlockButton
