import React from 'react'
import { useWeb3React } from '@web3-react/core'
import { Button, ButtonProps, ConnectorId } from 'uikit-dev'
import { useWalletKlaytnModal } from 'uikit-dev/widgets/WalletKlaytnModal'
import { injected, walletconnect } from 'connectors'
import useI18n from 'hooks/useI18n'
import useAccount from 'state/account/hooks'

const UnlockButton: React.FC<ButtonProps> = props => {
  const TranslateString = useI18n()
  const [account, setAccount] = useAccount()

  const handleLogin = (accountAddress) => {
    setAccount(accountAddress)
  }

  const handleLogout = () => {
    setAccount(undefined)
  }

  const { onPresentConnectKlaytnModal } = useWalletKlaytnModal(handleLogin, handleLogout, account as string)

  return (
    <Button onClick={onPresentConnectKlaytnModal} {...props}>
      {TranslateString(292, 'Unlock Wallet')}
    </Button>
  )
}

export default UnlockButton
