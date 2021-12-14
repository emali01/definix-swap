import { Currency, currencyEquals, ETHER, WETH } from 'definixswap-sdk'
import { useMemo, useContext } from 'react'
import { KlipModalContext } from '@sixnetwork/klaytn-use-wallet'
import { KlipConnector } from "@sixnetwork/klip-connector"
import * as klipProvider from './KlipProvider'
import { tryParseAmount } from '../state/swap/hooks'
import { useTransactionAdder } from '../state/transactions/hooks'
import { useCurrencyBalance } from '../state/wallet/hooks'
import { useActiveWeb3React } from './index'
import { useWETHContract } from './useContract'
import { getAbiByNameWETH } from './HookHelper'

export enum WrapType {
  NOT_APPLICABLE,
  WRAP,
  UNWRAP
}



const NOT_APPLICABLE = { wrapType: WrapType.NOT_APPLICABLE }
/**
 * Given the selected input and output currency, return a wrap callback
 * @param inputCurrency the selected input currency
 * @param outputCurrency the selected output currency
 * @param typedValue the user input value
 */
export default function useWrapCallback(
  inputCurrency: Currency | undefined,
  outputCurrency: Currency | undefined,
  typedValue: string | undefined
): { wrapType: WrapType; execute?: undefined | (() => Promise<void>); inputError?: string } {
  const { chainId, account, connector } = useActiveWeb3React()
  const { setShowModal } = useContext(KlipModalContext())
  const wethContract = useWETHContract()
  const balance = useCurrencyBalance(account ?? undefined, inputCurrency)
  // we can always parse the amount typed as the input currency, since wrapping is 1:1
  const inputAmount = useMemo(() => tryParseAmount(typedValue, inputCurrency), [inputCurrency, typedValue])
  const addTransaction = useTransactionAdder()

  return useMemo(() => {
    if (!wethContract || !chainId || !inputCurrency || !outputCurrency) return NOT_APPLICABLE

    const sufficientBalance = inputAmount && balance && !balance.lessThan(inputAmount)

    if (inputCurrency === ETHER && currencyEquals(WETH(chainId), outputCurrency)) {
      return {
        wrapType: WrapType.WRAP,
        execute:
          sufficientBalance && inputAmount
            ? async () => {
              try {
                if (isKlipConnector(connector)) {
                  // console.log("klip test 1",(+inputAmount.toSignificant(6)*1e18))
                  const valueKlip = +inputAmount.toSignificant(6)*1e12
                  klipProvider.genQRcodeContactInteract(
                    WETH(chainId).address,
                    JSON.stringify(getAbiByNameWETH("deposit")),
                    JSON.stringify([]),
                    `${valueKlip}000000`,
                    setShowModal
                  )
                  const tx = await klipProvider.checkResponse()
                  setShowModal(false)
                  // addTransaction(tx, { summary: `Wrap ${inputAmount.toSignificant(6)} KLAY to WKLAY` })
                  // addTransaction(undefined, {
                  //   type: 'removeLiquidity',
                  //   klipTx: tx,
                  //   data: {
                  //     firstToken: currencyA?.symbol,
                  //     firstTokenAmount: parsedAmounts[Field.CURRENCY_A]?.toSignificant(3),
                  //     secondToken: currencyB?.symbol,
                  //     secondTokenAmount: parsedAmounts[Field.CURRENCY_B]?.toSignificant(3)
                  //   },
                  //   summary: `Remove ${parsedAmounts[Field.CURRENCY_A]?.toSignificant(3)} ${currencyA?.symbol
                  //     } and ${parsedAmounts[Field.CURRENCY_B]?.toSignificant(3)} ${currencyB?.symbol}`
                  // })
                } else {
                  const txReceipt = await wethContract.deposit({ value: `0x${inputAmount.raw.toString(16)}` })
                  addTransaction(txReceipt, { summary: `Wrap ${inputAmount.toSignificant(6)} KLAY to WKLAY` })
                }
              } catch (error) {
                console.error('Could not deposit', error)
              }
            }
            : undefined,
        inputError: sufficientBalance ? undefined : 'Insufficient ETH balance'
      }
    } if (currencyEquals(WETH(chainId), inputCurrency) && outputCurrency === ETHER) {
      return {
        wrapType: WrapType.UNWRAP,
        execute:
          sufficientBalance && inputAmount
            ? async () => {
              try {
                if (isKlipConnector(connector)) {
                  // console.log("klip test 1",(+inputAmount.toSignificant(6)*1e18))
                  const valueKlip = +Number.parseFloat(inputAmount.toSignificant(6)).toFixed(6)*1e12
                  klipProvider.genQRcodeContactInteract(
                    WETH(chainId).address,
                    JSON.stringify(getAbiByNameWETH("deposit")),
                    JSON.stringify([]),
                    `${valueKlip}000000`,
                    setShowModal
                  )
                  const tx = await klipProvider.checkResponse()
                  setShowModal(false)
                  // addTransaction(tx, { summary: `Wrap ${inputAmount.toSignificant(6)} KLAY to WKLAY` })
                  // addTransaction(undefined, {
                  //   type: 'removeLiquidity',
                  //   klipTx: tx,
                  //   data: {
                  //     firstToken: currencyA?.symbol,
                  //     firstTokenAmount: parsedAmounts[Field.CURRENCY_A]?.toSignificant(3),
                  //     secondToken: currencyB?.symbol,
                  //     secondTokenAmount: parsedAmounts[Field.CURRENCY_B]?.toSignificant(3)
                  //   },
                  //   summary: `Remove ${parsedAmounts[Field.CURRENCY_A]?.toSignificant(3)} ${currencyA?.symbol
                  //     } and ${parsedAmounts[Field.CURRENCY_B]?.toSignificant(3)} ${currencyB?.symbol}`
                  // })
                } else {
                  const txReceipt = await wethContract.withdraw(`0x${inputAmount.raw.toString(16)}`)
                  addTransaction(txReceipt, { summary: `Unwrap ${inputAmount.toSignificant(6)} WKLAY to KLAY` })
                }
              } catch (error) {
                console.error('Could not withdraw', error)
              }
            }
            : undefined,
        inputError: sufficientBalance ? undefined : 'Insufficient WBNB balance'
      }
    }
    return NOT_APPLICABLE

  }, [wethContract,connector,setShowModal, chainId, inputCurrency, outputCurrency, inputAmount, balance, addTransaction])
}

const isKlipConnector = (connector) => connector instanceof KlipConnector