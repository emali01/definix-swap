import React from 'react'
import { useCaverJsReact } from 'caverjs-react-core'
import { Button, ButtonProps, ConnectorId, useWalletModal } from 'uikit-dev'
import { injected } from 'connectors'
import useI18n from 'hooks/useI18n'

const UnlockButton: React.FC<ButtonProps> = props => {
  const TranslateString = useI18n()
  const { account, activate, deactivate } = useCaverJsReact()

  const handleLogin = (connectorId: ConnectorId) => {
    return activate(injected)
  }

  const { onPresentConnectModal } = useWalletModal(handleLogin, deactivate, account as string)

  return (
    <Button onClick={onPresentConnectModal} {...props}>
      {TranslateString(292, 'Unlock Wallet')}
    </Button>
  )
}

export default UnlockButton
