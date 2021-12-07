import React from 'react'
import { Button, ButtonProps, useWalletModal } from 'definixswap-uikit'
import { useCaverJsReact } from '@sixnetwork/caverjs-react-core'
import { useTranslation } from 'react-i18next'
import useCaverJsReactForWallet from 'hooks/useCaverJsReactForWallet'

const UnlockButton: React.FC<ButtonProps> = props => {
  const { t } = useTranslation();
  const { account } = useCaverJsReact()
  const { login, logout } = useCaverJsReactForWallet();

  const { onPresentConnectModal } = useWalletModal(login, logout, account)

  return (
    <Button lg width="100%" onClick={onPresentConnectModal} {...props}>
      {t('Unlock Wallet')}
    </Button>
  )
}

export default UnlockButton
