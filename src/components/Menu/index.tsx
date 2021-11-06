import { useCaverJsReact } from '@sixnetwork/caverjs-react-core'
import { injected,klip } from 'connectors'
import { supportedLanguages } from 'constants/localisation/languageCodes'
import useGetLocalProfile from 'hooks/useGetLocalProfile'
import useTheme from 'hooks/useTheme'
import React from 'react'
import { KlipModalContext } from "@sixnetwork/klaytn-use-wallet"
import { Menu as UikitMenu } from 'definixswap-uikit'
import useTranslation from 'hooks/Localisation/useTranslation'
import { links } from './config'
import UserBlock from './UserBlock'
import Chain from './Chain'
import SettingsModal from '../PageHeader/SettingsModal'

const Menu: React.FC = (props) => {
  const { setShowModal, showModal } = React.useContext(KlipModalContext())
  const { account, activate, deactivate } = useCaverJsReact()
  const { setLangCode, selectedLangCode, t } = useTranslation()
  const { isDark, toggleTheme } = useTheme()
  // const priceData = useGetPriceData()
  // const finixPrice = useFinixPrice()
  // const finixPriceUsd = priceData ? Number(priceData.prices.Finix) : undefined
  const profile = useGetLocalProfile()
  const showModalKlip = () => {
    setShowModal(true)
  }
  const closeModalKlip = () => {
    setShowModal(false)
  }
  return (
    <UikitMenu
      userBlock={<UserBlock />}
      settingModal={<SettingsModal />}
      chain={<Chain />}
      // account={account as string}
      // login={(connectorId: string) => {
      //   if (connectorId === "klip") {   
      //     window.localStorage.setItem("connector","klip")
      //     return activate(klip(showModalKlip, closeModalKlip))
      //   } 
      //   window.localStorage.setItem("connector","injected")
      //   return activate(injected)
      // }}
      // logout={deactivate}
      
      links={links(t)}
      currentLang={selectedLangCode}
      langs={supportedLanguages}
      setLang={({ code }) => setLangCode(code)}
      // profile={profile}
      {...props}
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
