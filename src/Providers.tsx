import React from 'react'
import { createCaverJsReactRoot, CaverJsReactProvider } from '@sixnetwork/caverjs-react-core'
import { LanguageContextProvider } from 'hooks/Localisation/Provider'
import injected, { UseWalletProvider, KlipModalContext } from '@sixnetwork/klaytn-use-wallet'
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
  const onPresent = () => {
    setShowModal(true)
  }
  const onHiddenModal = () => {
    setShowModal(false)
  }
  window.onclick = (event) => {
    if (event.target === document.getElementById('customKlipModal')) {
      onHiddenModal()
    }
  }
  return (
    <UseWalletProvider
        chainId={parseInt(process.env.REACT_APP_CHAIN_ID)}
        connectors={{
          injected,
          klip: { showModal: onPresent, closeModal: onHiddenModal },
        }}
      >
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
    </UseWalletProvider>
  )
}

export default Providers
