import { useCaverJsReact } from '@sixnetwork/caverjs-react-core'
import { injected,klip } from 'connectors'
import { allLanguages } from 'constants/localisation/languageCodes'
import { LanguageContext } from 'hooks/LanguageContext'
import useGetLocalProfile from 'hooks/useGetLocalProfile'
import useTheme from 'hooks/useTheme'
import React, { useContext } from 'react'
import { KlipModalContext } from "@sixnetwork/klaytn-use-wallet"
import { Menu as UikitMenu } from 'definixswap-uikit'

const Menu: React.FC = (props) => {
  const { setShowModal, showModal } = React.useContext(KlipModalContext())
  const { account, activate, deactivate } = useCaverJsReact()
  const { selectedLanguage, setSelectedLanguage } = useContext(LanguageContext)
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
      account={account as string}
      login={(connectorId: string) => {
        if (connectorId === "klip") {   
          window.localStorage.setItem("connector","klip")
          return activate(klip(showModalKlip, closeModalKlip))
        } 
        window.localStorage.setItem("connector","injected")
        return activate(injected)
      }}
      logout={deactivate}
      
      currentLang={selectedLanguage?.code || 'en'}
      langs={allLanguages}
      setLang={setSelectedLanguage}
      profile={profile}
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
