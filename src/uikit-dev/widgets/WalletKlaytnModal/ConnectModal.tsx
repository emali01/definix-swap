import React from 'react'
import styled from 'styled-components'
import { Link } from '../../components/Link'
import { HelpIcon } from '../../components/Svg'
import { Modal } from '../Modal'
import WalletKaikasCard from './WalletKaikasCard'
import config from './config'
import caver from '../../../klaytn/caver'
import { Login } from '../WalletModal/types'

interface Props {
  onDismiss?: () => void
  login: Login
}

const HelpLink = styled(Link)`
  display: flex;
  align-self: center;
  align-items: center;
  margin-top: 24px;
`

const loadAccountInfo = (login) => async () => {
  // @ts-ignore
  const { klaytn } = window

  if (klaytn) {
    try {
      await klaytn.enable()
      setAccountInfo(login)()
      klaytn.on('accountsChanged', () => setAccountInfo(login)())
    } catch (error) {
      console.log('User denied account access')
    }
  } else {
    console.log('Non-Kaikas browser detected. You should consider trying Kaikas!')
  }
}

const setAccountInfo = login => async () => {
  // @ts-ignore
  const { klaytn } = window
  if (klaytn === undefined) return

  const account = klaytn.selectedAddress
  const balance = await caver.klay.getBalance(account)
  login(account)
  // this.setState({
  //   account,
  //   balance: caver.utils.fromPeb(balance, 'KLAY'),
  // })
}

const setNetworkInfo = () => {
  // @ts-ignore
  const { klaytn } = window
  if (klaytn === undefined) return

  // this.setState({ network: klaytn.networkVersion })
  klaytn.on('networkChanged', () => setNetworkInfo())
}

const ConnectModal: React.FC<Props> = ({ onDismiss = () => null, login = () => null }) => (
  <Modal title="Connect to a wallet" onDismiss={onDismiss} isRainbow>
    {config.map((entry, index) => (
      <WalletKaikasCard
        key={entry.title}
        login={loadAccountInfo(login)}
        walletConfig={entry}
        onDismiss={onDismiss}
        mb={index < config.length - 1 ? '8px' : '0'}
      />
    ))}
    <HelpLink
      href="https://docs.definixswap.finance/guides/faq#how-do-i-set-up-my-wallet-on-binance-smart-chain"
      external
    >
      <HelpIcon color="primary" mr="6px" />
      Learn how to connect
    </HelpLink>
  </Modal>
)

export default ConnectModal
