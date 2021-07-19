import React from 'react'
import { useCaverJsReact } from '@kanthakarn-test/caverjs-react-core'
import { Button, ButtonProps, ConnectorId, useWalletModal } from 'uikit-dev'
<<<<<<< HEAD
import { injected, klip } from 'connectors'
import { KlipModalContext } from "@kanthakarn-test/klaytn-use-wallet"
import useI18n from 'hooks/useI18n'

const UnlockButton: React.FC<ButtonProps> = props => {
  const { setShowModal, showModal } = React.useContext(KlipModalContext())
  const TranslateString = useI18n()
=======
import { injected } from 'connectors'
import { useTranslation } from 'contexts/Localization'

const UnlockButton: React.FC<ButtonProps> = props => {
  const { t: translate } = useTranslation()
>>>>>>> 057db958c4d5d38dc4dfb2720023d5a6cad60278
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
