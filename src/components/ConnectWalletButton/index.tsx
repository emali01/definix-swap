import React from 'react'
import { useCaverJsReact } from 'caverjs-react-core'
import { Button, ButtonProps, ConnectorId, useWalletModal } from 'uikit-dev'
import { injected } from 'connectors'
import { useTranslation } from 'contexts/Localization'

const UnlockButton: React.FC<ButtonProps> = props => {
  const { t: translate } = useTranslation()
  const { account, activate, deactivate } = useCaverJsReact()

  const handleLogin = (connectorId: ConnectorId) => {
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
