import React from 'react'
import { createCaverJsReactRoot, CaverJsReactProvider } from '@kanthakarn-test/caverjs-react-core'
import { KlipModalContext } from '@kanthakarn-test/klaytn-use-wallet'
import { Provider } from 'react-redux'
import { ModalProvider } from 'uikit-dev'
import { LanguageProvider } from 'contexts/Localization'
import { NetworkContextName } from './constants'
import store from './state'
import getLibrary from './utils/getLibrary'
import { ThemeContextProvider } from './ThemeContext'

const Web3ProviderNetwork = createCaverJsReactRoot(NetworkContextName)

const Providers: React.FC = ({ children }) => {
  const { setShowModal } = React.useContext(KlipModalContext())
  const onHiddenModal = () => {
    setShowModal(false)
  }
  window.onclick = function (event) {
    if (event.target === document.getElementById('customKlipModal')) {
      onHiddenModal()
    }
  }
  return (
    <CaverJsReactProvider getLibrary={getLibrary}>
      <Web3ProviderNetwork getLibrary={getLibrary}>
        <Provider store={store}>
          <ThemeContextProvider>
            <LanguageProvider>
              <ModalProvider>{children}</ModalProvider>
            </LanguageProvider>
          </ThemeContextProvider>
        </Provider>
      </Web3ProviderNetwork>
    </CaverJsReactProvider>
  )
}

export default Providers
