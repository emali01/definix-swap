import React from 'react'
import { supportedLanguages } from 'constants/localisation/languageCodes'
import { useCaverJsReact } from '@sixnetwork/caverjs-react-core'
import { Menu as UikitMenu } from 'definixswap-uikit-v2'
import { useTranslation, Trans } from 'react-i18next'
import { useUserSlippageTolerance, useUserDeadline } from 'state/user/hooks'
import useCaverJsReactForWallet from 'hooks/useCaverJsReactForWallet'
import { links } from './config'

const Menu: React.FC = (props) => {
  const { account } = useCaverJsReact()
  const { login, logout } = useCaverJsReactForWallet();
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
      login={login}
      logout={logout}
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
