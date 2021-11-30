import React from 'react'
import { Button, ButtonProps, useWalletModal } from 'definixswap-uikit'
import { useTranslation } from 'react-i18next'
import { useWallet } from "@sixnetwork/klaytn-use-wallet"

const UnlockButton: React.FC<ButtonProps> = props => {
  const { t } = useTranslation();
  const { account, connect, reset } = useWallet()

  const { onPresentConnectModal } = useWalletModal(connect as any, reset, account)

  return (
    <Button lg width="100%" onClick={onPresentConnectModal} {...props}>
      {t('Unlock Wallet')}
    </Button>
  )
}

export default UnlockButton
