import React from 'react'
import { createCaverJsReactRoot, CaverJsReactProvider } from '@sixnetwork/caverjs-react-core'
import { LanguageContextProvider } from 'hooks/Localisation/Provider'
import { KlipModalContext } from '@sixnetwork/klaytn-use-wallet'
import { Provider } from 'react-redux'
import { ModalProvider } from 'definixswap-uikit'
import { ModalProvider as OldModalProvider } from 'uikit-dev'
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
            <LanguageContextProvider>
              <OldModalProvider>
                <ModalProvider>{children}</ModalProvider>
              </OldModalProvider>
            </LanguageContextProvider>
          </ThemeContextProvider>
        </Provider>
      </Web3ProviderNetwork>
    </CaverJsReactProvider>
  )
}

export default Providers
