import Kaikas from './icons/Kaikas'
import Dcent from './icons/Dcent'
import KlipConnect from './icons/KlipConnect'
import TokenPocket from './icons/TokenPocket'
import { Config } from './types'


const connectors: Config[] = [
  {
    title: 'Kaikas',
    icon: Kaikas,
    connectorId: 'injected',
  },
  {
    title: 'D`CENT',
    icon: Dcent,
    connectorId: 'injected',
  },
  {
    title: 'Klip',
    icon: KlipConnect,
    connectorId: "klip"
  },
  {
    title: 'TokenPocket',
    icon: TokenPocket,
    connectorId: 'injected',
  }
]

export default connectors
export const localStorageKey = 'accountStatus'
