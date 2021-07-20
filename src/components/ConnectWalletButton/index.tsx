import React from 'react'
import { useCaverJsReact,  } from '@sixnetwork/caverjs-react-core'
import { Button, ButtonProps, ConnectorId, useWalletModal } from 'uikit-dev'
import { injected } from 'connectors'
import { useTranslation } from 'contexts/Localization'
import { KlipModalContext } from "@sixnetwork/klaytn-use-wallet"

const UnlockButton: React.FC<ButtonProps> = props => {
  const { setShowModal, showModal } = React.useContext(KlipModalContext())
  const { t: translate } = useTranslation()
  const { account, activate, deactivate } = useCaverJsReact()
  const showModalKlip = () => {
    setShowModal(true)
  }
  const closeModalKlip = () => {
    setShowModal(false)
  }
  const handleLogin = (connectorId: ConnectorId) => {
    if (connectorId === "klip") {
      window.localStorage.setItem("connector","klip")
      return activate(klip(showModalKlip, closeModalKlip))
    }
    window.localStorage.setItem("connector", "injected")
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
