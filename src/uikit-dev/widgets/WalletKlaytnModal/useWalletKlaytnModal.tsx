import React from 'react'
import { useModal } from '../Modal'
import ConnectModal from './ConnectModal'
import AccountModal from './AccountModal'
import { Login } from '../WalletModal/types'

interface ReturnType {
  onPresentConnectKlaytnModal: () => void
  onPresentAccountKlaytnModal: () => void
}

const useWalletKlaytnModal = (login: Login, logout: () => void, account?: string): ReturnType => {
  const [onPresentConnectKlaytnModal] = useModal(<ConnectModal login={login} />)
  const [onPresentAccountKlaytnModal] = useModal(<AccountModal account={account || ''} logout={logout} login={login} />)
  return { onPresentConnectKlaytnModal, onPresentAccountKlaytnModal }
}

export default useWalletKlaytnModal
