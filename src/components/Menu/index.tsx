import { useCaverJsReact } from '@sixnetwork/caverjs-react-core'
import { injected,klip } from 'connectors'
import { supportedLanguages } from 'constants/localisation/languageCodes'
import useGetLocalProfile from 'hooks/useGetLocalProfile'
import useTheme from 'hooks/useTheme'
import React from 'react'
import { KlipModalContext } from "@sixnetwork/klaytn-use-wallet"
import { Menu as UikitMenu } from 'definixswap-uikit'
import { useUserSlippageTolerance, useUserDeadline } from 'state/user/hooks'
import { useTranslation, Trans } from 'react-i18next'
import { links } from './config'

const Menu: React.FC = (props) => {
  const { setShowModal, showModal } = React.useContext(KlipModalContext())
  const [userSlippageTolerance, setUserslippageTolerance] = useUserSlippageTolerance();
  const [deadline, setDeadline] = useUserDeadline();
  const { account, activate, deactivate } = useCaverJsReact()
  const { i18n, t } = useTranslation()
  const { isDark, toggleTheme } = useTheme()
  // const priceData = useGetPriceData()
  // const finixPrice = useFinixPrice()
  // const finixPriceUsd = priceData ? Number(priceData.prices.Finix) : undefined
  // const profile = useGetLocalProfile()
  const showModalKlip = () => {
    setShowModal(true)
  }
  const closeModalKlip = () => {
    setShowModal(false)
  }
  return (
    <UikitMenu
      // SettingsModal slippage
      userSlippageTolerance={userSlippageTolerance}
      setUserslippageTolerance={setUserslippageTolerance}
      // SettingsModal deadline
      deadline={deadline}
      setDeadline={setDeadline}

      account={account}
      login={(connectorId: string) => {
        if (connectorId === "klip") {   
          window.localStorage.setItem("connector", "klip")
          return activate(klip(showModalKlip, closeModalKlip))
        } 
        window.localStorage.setItem("connector", "injected")
        return activate(injected)
      }}
      logout={deactivate}
      // netWorth={<NetWorth />}

      Trans={Trans}
      currentLang={i18n.language}
      langs={supportedLanguages}
      setLang={({ code }) => i18n.changeLanguage(code)}
      links={links(t)}
      {...props}

      // isDark={isDark}
      // toggleTheme={toggleTheme}
      // profile={profile}
      // isMobile={false}
      // isDark={isDark}
      // toggleTheme={toggleTheme}
      // links={links}
      // finixPriceUsd={finixPriceUsd}
      // price={finixPrice <= 0 ? 'N/A' : numeral(finixPrice).format('0,0.0000')}
    />
  )
}

export default Menu
