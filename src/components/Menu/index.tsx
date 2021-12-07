import React, { useCallback } from 'react'
import { injected, klip } from 'connectors'
import { supportedLanguages } from 'constants/localisation/languageCodes'
import { useCaverJsReact } from '@sixnetwork/caverjs-react-core'
import { KlipModalContext, useWallet } from "@sixnetwork/klaytn-use-wallet"
import { Menu as UikitMenu } from 'definixswap-uikit'
import { useUserSlippageTolerance, useUserDeadline } from 'state/user/hooks'
import { useTranslation, Trans } from 'react-i18next'
import { links } from './config'

const Menu: React.FC = (props) => {
  const { setShowModal } = React.useContext(KlipModalContext())
  const { connect, reset } = useWallet()
  const { account, activate, deactivate } = useCaverJsReact()
  const [userSlippageTolerance, setUserslippageTolerance] = useUserSlippageTolerance();
  const [deadline, setDeadline] = useUserDeadline();
  const { i18n, t } = useTranslation()

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

  return (
    <UikitMenu
      // SettingsModal slippage
      userSlippageTolerance={userSlippageTolerance}
      setUserslippageTolerance={setUserslippageTolerance}
      // SettingsModal deadline
      deadline={deadline}
      setDeadline={setDeadline}
      account={account}
      login={onLogin}
      logout={onLogout}
      Trans={Trans}
      currentLang={i18n.languages[0]}
      langs={supportedLanguages}
      setLang={({ code }) => i18n.changeLanguage(code)}
      links={links(t)}
      {...props}
    />
  )
}

export default Menu
