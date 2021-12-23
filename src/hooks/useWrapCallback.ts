import { Currency, currencyEquals, ETHER, WETH } from 'definixswap-sdk'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { tryParseAmount } from '../state/swap/hooks'
import { useTransactionAdder } from '../state/transactions/hooks'
import { useCurrencyBalance } from '../state/wallet/hooks'
import { useActiveWeb3React } from './index'
import { useWETHContract } from './useContract'

export enum WrapType {
  NOT_APPLICABLE,
  WRAP,
  UNWRAP
}

interface IProps {
  wrapType: WrapType;
  execute?: undefined | (() => Promise<void>);
  loading?:boolean;
  inputError?: string;
  error?: {
    wrapError: unknown;
    unWrapError: unknown;
  };
  setError?: {
    setWrapError: React.Dispatch<unknown>;
    setUnWrapError: React.Dispatch<unknown>;
  }
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
): IProps {
  const [loading, setLoading] = useState<boolean>(false);
  const [wrapError, setWrapError] = useState<unknown>();
  const [unWrapError, setUnWrapError] = useState<unknown>();

  const { chainId, account } = useActiveWeb3React()
  const wethContract = useWETHContract()
  const balance = useCurrencyBalance(account ?? undefined, inputCurrency)
  // we can always parse the amount typed as the input currency, since wrapping is 1:1
  const inputAmount = useMemo(() => tryParseAmount(typedValue, inputCurrency), [inputCurrency, typedValue])
  const addTransaction = useTransactionAdder()
  const { t } = useTranslation();

  const executeWrap = useCallback(async () => {
    setLoading(true);
    try {
      const txReceipt = await wethContract.deposit({ value: `0x${inputAmount.raw.toString(16)}` })
      addTransaction(txReceipt, { summary: `Wrap ${inputAmount.toSignificant(6)} KLAY to WKLAY` })
      setLoading(false);
    } catch (err: unknown) {
      setWrapError(err);
      setLoading(false);
    }
  }, [addTransaction, inputAmount, wethContract]);

  const executeUnWrap = useCallback(async () => {
    setLoading(true);
    try {
      const txReceipt = await wethContract.withdraw(`0x${inputAmount.raw.toString(16)}`)
      addTransaction(txReceipt, { summary: `Unwrap ${inputAmount.toSignificant(6)} WKLAY to KLAY` });
      setLoading(false);
    } catch (err: unknown) {
      setUnWrapError(err);
      setLoading(false);
    }
  }, [addTransaction, inputAmount, wethContract]);

  return useMemo(() => {
    if (!wethContract || !chainId || !inputCurrency || !outputCurrency) return NOT_APPLICABLE

    const sufficientBalance = inputAmount && balance && !balance.lessThan(inputAmount)

    if (inputCurrency === ETHER && currencyEquals(WETH(chainId), outputCurrency)) {
      return {
        wrapType: WrapType.WRAP,
        execute:
          sufficientBalance && inputAmount
            ? executeWrap
            : undefined,
        loading,
        inputError: sufficientBalance ? undefined : t('Insufficient balance'),
        error: {
          wrapError,
          unWrapError
        },
        setError: {
          setWrapError,
          setUnWrapError
        }
      }
    } if (currencyEquals(WETH(chainId), inputCurrency) && outputCurrency === ETHER) {
      return {
        wrapType: WrapType.UNWRAP,
        execute:
          sufficientBalance && inputAmount
            ? executeUnWrap
            : undefined,
        loading,
        inputError: sufficientBalance ? undefined : t('Insufficient balance'),
        error: {
          wrapError,
          unWrapError
        },
        setError: {
          setWrapError,
          setUnWrapError
        }
      }
    } 
      return NOT_APPLICABLE
    
  }, [wethContract, chainId, inputCurrency, outputCurrency, inputAmount, balance, executeWrap, loading, t, wrapError, unWrapError, executeUnWrap])
}
