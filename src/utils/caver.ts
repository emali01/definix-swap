/* eslint-disable import/prefer-default-export */
import Caver from 'caver-js'

// const network = 'testnet'
// const apiURL = network === "mainnet" ? "https://api.cypress.klaytn.net:8651/" : "https://api.baobab.klaytn.net:8651/"
const apiURL = "https://api.baobab.klaytn.net:8651/"

const getCaver = () => {
  const caver = new Caver(apiURL)
  return caver
}

export { getCaver }
