import { Credentials, StringTranslations } from '@crowdin/crowdin-api-client'
import React, { Suspense, useEffect, useState } from 'react'
import { HashRouter, Route, Switch } from 'react-router-dom'
import { useCaverJsReact } from '@sixnetwork/caverjs-react-core'
import { injected,klip } from 'connectors'
import { KlipModalContext, useWallet } from "@sixnetwork/klaytn-use-wallet"
import { GlobalStyle, Loading } from 'definixswap-uikit'
import Menu from '../components/Menu'
import Popups from '../components/Popups'
import Web3ReactManager from '../components/Web3ReactManager'
import { AppWrapper } from '../components/Layout'
import { allLanguages, EN } from '../constants/localisation/languageCodes'
import { LanguageContext } from '../hooks/LanguageContext'
import { TranslationsContext } from '../hooks/TranslationsContext'
import Liquidity from './Liquidity'
import { RedirectDuplicateTokenIds, RedirectOldAddLiquidityPathStructure } from './Liquidity/redirects'
import Pool from './Pool'
import PoolFinder from './PoolFinder'
import RemoveLiquidity from './RemoveLiquidity'
import { RedirectOldRemoveLiquidityPathStructure } from './RemoveLiquidity/redirects'
import Swap from './Swap'
import { RedirectPathToSwapOnly, RedirectToSwap } from './Swap/redirects'

export default function App() {
  const { account, connect } = useWallet();
  const [selectedLanguage, setSelectedLanguage] = useState<any>(undefined)
  const [translatedLanguage, setTranslatedLanguage] = useState<any>(undefined)
  const [translations, setTranslations] = useState<Array<any>>([])
  const apiKey = `${process.env.REACT_APP_CROWDIN_APIKEY}`
  const projectId = parseInt(`${process.env.REACT_APP_CROWDIN_PROJECTID}`)
  const fileId = 6

  // wallet
  useEffect(() => {
    if (!account && window.localStorage.getItem('accountStatus') && checkConnector('injected')) {
      connect('injected')
    } else if (
      !account &&
      window.localStorage.getItem('accountStatus') &&
      checkConnector('klip') &&
      window.localStorage.getItem('userAccount')
    ) {
      connect('klip')
    }
  }, [account, connect])
  const checkConnector = (connector: string) => window.localStorage.getItem('connector') === connector

  const credentials: Credentials = {
    token: apiKey,
  }

  const stringTranslationsApi = new StringTranslations(credentials)

  const getStoredLang = (storedLangCode: string) => {
    return allLanguages.filter((language) => {
      return language.code === storedLangCode
    })[0]
  }

  useEffect(() => {
    const storedLangCode = localStorage.getItem('definixSwapLanguage')
    if (storedLangCode) {
      const storedLang = getStoredLang(storedLangCode)
      setSelectedLanguage(storedLang)
    } else {
      setSelectedLanguage(EN)
    }
  }, [])

  const fetchTranslationsForSelectedLanguage = async () => {
    stringTranslationsApi
      .listLanguageTranslations(projectId, selectedLanguage.code, undefined, fileId, 200)
      .then((translationApiResponse) => {
        if (translationApiResponse.data.length < 1) {
          setTranslations(['error'])
        } else {
          setTranslations(translationApiResponse.data)
        }
      })
      .then(() => setTranslatedLanguage(selectedLanguage))
      .catch((error) => {
        setTranslations(['error'])
        console.error(error)
      })
  }

  useEffect(() => {
    if (selectedLanguage) {
      fetchTranslationsForSelectedLanguage()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedLanguage])

  return (
    <Suspense fallback={null}>
      <GlobalStyle />
      <HashRouter>
        <AppWrapper>
          <LanguageContext.Provider
            value={{ selectedLanguage, setSelectedLanguage, translatedLanguage, setTranslatedLanguage }}
          >
            <TranslationsContext.Provider value={{ translations, setTranslations }}>
              <Menu>
                <Suspense fallback={<Loading />}>
                  <Popups />
                  <Web3ReactManager>
                    <Switch>
                      <Route exact strict path="/swap" component={Swap} />
                      <Route exact path="/swap/:currencyIdA/:currencyIdB" component={RedirectToSwap} />
                      <Route exact path="/swap/:currencyIdA" component={RedirectToSwap} />
                      <Route exact strict path="/find" component={PoolFinder} />
                      {/* <Route exact strict path="/liquidity" component={Pool} /> */}
                      <Route exact strict path="/liquidity" component={Liquidity} />
                      {/* <Route exact path="/add" component={AddLiquidity} /> */}
                      <Route exact strict path="/remove/:currencyIdA/:currencyIdB" component={RemoveLiquidity} />
                      <Route exact path="/add/:currencyIdA" component={RedirectOldAddLiquidityPathStructure} />
                      <Route exact path="/add/:currencyIdA/:currencyIdB" component={RedirectDuplicateTokenIds} />
                      <Route exact strict path="/remove/:tokens" component={RedirectOldRemoveLiquidityPathStructure} />
                      <Route component={RedirectPathToSwapOnly} />
                    </Switch>
                  </Web3ReactManager>
                </Suspense>
              </Menu>
            </TranslationsContext.Provider>
          </LanguageContext.Provider>
        </AppWrapper>
      </HashRouter>
    </Suspense>
  )
}
