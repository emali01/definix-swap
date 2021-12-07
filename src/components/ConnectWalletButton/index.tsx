import React, { useCallback } from 'react'
import { Button, ButtonProps, useWalletModal } from 'definixswap-uikit'
import { useCaverJsReact } from '@sixnetwork/caverjs-react-core'
import { useTranslation } from 'react-i18next'
import { KlipModalContext, useWallet } from "@sixnetwork/klaytn-use-wallet"
import { injected, klip } from 'connectors'

const UnlockButton: React.FC<ButtonProps> = props => {
  const { setShowModal } = React.useContext(KlipModalContext())
  const { t } = useTranslation();
  const { connect, reset } = useWallet()
  const { account, activate, deactivate } = useCaverJsReact()

  const showModalKlip = useCallback(() => {
    setShowModal(true)
  }, [setShowModal])
  const closeModalKlip = useCallback(() => {
    setShowModal(false)
  }, [setShowModal])

  const onLogin = useCallback((connectorId) => {
    if (connectorId === 'klip') {
      activate(klip(showModalKlip, closeModalKlip))
    }
    activate(injected)
    connect(connectorId)
  }, [connect, activate, closeModalKlip, showModalKlip])

  const onLogout = useCallback(() => {
    deactivate();
    reset();
  }, [deactivate, reset])

  const { onPresentConnectModal } = useWalletModal(onLogin, onLogout, account)

  return (
    <Button lg width="100%" onClick={onPresentConnectModal} {...props}>
      {t('Unlock Wallet')}
    </Button>
  )
}

export default UnlockButton
