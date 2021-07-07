import { useCaverJsReact } from 'caverjs-react-core'
import { injected } from 'connectors'
import { useTranslation } from 'contexts/Localization'
import { languageList } from 'config/localization/languages'
import useGetLocalProfile from 'hooks/useGetLocalProfile'
import useGetPriceData from 'hooks/useGetPriceData'
import useTheme from 'hooks/useTheme'
import React, { useContext } from 'react'
import { ConnectorId, Menu as UikitMenu } from 'uikit-dev'
import numeral from 'numeral'
import links from './config'
import useFinixPrice from '../../hooks/useFinixPrice'

const Menu: React.FC = (props) => {
  const { account, activate, deactivate } = useCaverJsReact()
  const { isDark, toggleTheme } = useTheme()
  const { currentLanguage, setLanguage, t } = useTranslation()
  const priceData = useGetPriceData()
  const finixPrice = useFinixPrice()
  const finixPriceUsd = priceData ? Number(priceData.prices.Finix) : undefined
  const profile = useGetLocalProfile()

  return (
    <UikitMenu
      links={links}
      account={account as string}
      login={(connectorId: ConnectorId) => {
        return activate(injected)
      }}
      logout={deactivate}
      isDark={isDark}
      toggleTheme={toggleTheme}
      currentLang={currentLanguage.code}
      langs={languageList}
      // @ts-ignore
      setLang={setLanguage}
      finixPriceUsd={finixPriceUsd}
      profile={profile}
      price={finixPrice <= 0 ? 'N/A' : numeral(finixPrice).format('0,0.00')}
      {...props}
    />
  )
}

export default Menu
