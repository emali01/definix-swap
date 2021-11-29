import React from 'react'
import { supportedLanguages } from 'constants/localisation/languageCodes'
import { useWallet } from "@sixnetwork/klaytn-use-wallet"
import { Login, Menu as UikitMenu } from 'definixswap-uikit'
import { useUserSlippageTolerance, useUserDeadline } from 'state/user/hooks'
import { useTranslation, Trans } from 'react-i18next'
import { links } from './config'

const Menu: React.FC = (props) => {
  const { account, connect, reset } = useWallet()
  const [userSlippageTolerance, setUserslippageTolerance] = useUserSlippageTolerance();
  const [deadline, setDeadline] = useUserDeadline();
  const { i18n, t } = useTranslation()
  return (
    <UikitMenu
      // SettingsModal slippage
      userSlippageTolerance={userSlippageTolerance}
      setUserslippageTolerance={setUserslippageTolerance}
      // SettingsModal deadline
      deadline={deadline}
      setDeadline={setDeadline}
      account={account}
      login={connect as Login}
      logout={reset}
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
