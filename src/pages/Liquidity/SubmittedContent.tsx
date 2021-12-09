import React from 'react';
import Caver from 'caver-js'
import { ethers } from 'ethers'
import { Button } from 'definixswap-uikit-v2'
import { useTranslation } from 'react-i18next';
import { Currency, TokenAmount } from 'definixswap-sdk';
import { Field } from 'state/mint/actions';
import farms from 'constants/farm'
import HERODOTUS_ABI from 'constants/abis/herodotus.json'
import { ApprovalState } from 'hooks/useApproveCallback';
import BigNumberJs from 'bignumber.js'
import { TransactionSubmittedContent } from 'components/TransactionConfirmationModal';
import { useHerodotusContract } from 'hooks/useContract';
import UseDeParam from 'hooks/useDeParam';
import { useActiveWeb3React } from 'hooks';
import { HERODOTUS_ADDRESS } from 'constants/index';
import { calculateGasMargin } from 'utils';

interface IProps {
  txHash: string;
  content: () => React.ReactNode; // modal header
  currencies: {
    CURRENCY_A?: Currency;
    CURRENCY_B?: Currency;
  };
  liquidityMinted: TokenAmount;
  setAttemptingTxn: React.Dispatch<React.SetStateAction<boolean>>;
  approvalLP: ApprovalState;
  approveLPCallback: () => Promise<void>;
}

const SubmittedContent: React.FC<IProps> = ({
  txHash,
  content,
  currencies,
  liquidityMinted,
  setAttemptingTxn,
  approvalLP,
  approveLPCallback
}) => {
  const { account, chainId } = useActiveWeb3React()
  const herodotusAddress = HERODOTUS_ADDRESS[chainId || '']
  const herodotusContract = useHerodotusContract()
  const { t } = useTranslation();
  const onClick = () => {
    const firstToken = currencies[Field.CURRENCY_A]
    const secondToken = currencies[Field.CURRENCY_B]
    const farm = farms.find(
      x =>
        x.pid !== 0 &&
        x.pid !== 1 &&
        ((x.firstSymbol === firstToken?.symbol && x.secondSymbol === secondToken?.symbol) ||
          (x.firstSymbol === secondToken?.symbol && x.secondSymbol === firstToken?.symbol))
    )

    if (farm && farm.pid !== 1 && farm.pid !== 0 && liquidityMinted) {
      return new Promise((resolve, reject) => {
        setAttemptingTxn(true)
        if (approvalLP !== ApprovalState.APPROVED) {
          approveLPCallback()
            .then(() => {
              resolve(true)
            })
            .catch(err => {
              reject(err)
            })
        } else {
          resolve(true)
        }
      })
        .then(() => {
          const args = [
            farm.pid,
            new BigNumberJs(liquidityMinted.toExact()).times(new BigNumberJs(10).pow(18)).toString()
          ]
          return herodotusContract?.estimateGas.deposit(...args)
        })
        .then(estimatedGasLimit => {
          if (estimatedGasLimit) {
            const args = [
              farm.pid,
              new BigNumberJs(liquidityMinted.toExact()).times(new BigNumberJs(10).pow(18)).toString()
            ]

            const iface = new ethers.utils.Interface(HERODOTUS_ABI)

            return UseDeParam(chainId, 'KLAYTN_FEE_DELEGATE', 'N').then((flagFeeDelegate) => {
              if (flagFeeDelegate === 'Y') {
                const caverFeeDelegate = new Caver(process.env.REACT_APP_SIX_KLAYTN_EN_URL)
                const feePayerAddress = process.env.REACT_APP_FEE_PAYER_ADDRESS

                // @ts-ignore
                const caver = new Caver(window.caver)

                return caver.klay
                  .signTransaction({
                    type: 'FEE_DELEGATED_SMART_CONTRACT_EXECUTION',
                    from: account,
                    to: herodotusAddress,
                    gas: calculateGasMargin(estimatedGasLimit),
                    data: iface.encodeFunctionData('deposit', [...args]),
                  })
                  .then(function (userSignTx) {
                    // console.log('userSignTx tx = ', userSignTx)
                    const userSigned = caver.transaction.decode(userSignTx.rawTransaction)
                    // console.log('userSigned tx = ', userSigned)
                    userSigned.feePayer = feePayerAddress
                    // console.log('userSigned After add feePayer tx = ', userSigned)

                    return caverFeeDelegate.rpc.klay
                      .signTransactionAsFeePayer(userSigned)
                      .then(function (feePayerSigningResult) {
                        // console.log('feePayerSigningResult tx = ', feePayerSigningResult)
                        return caverFeeDelegate.rpc.klay
                          .sendRawTransaction(feePayerSigningResult.raw)
                          .on('transactionHash', (depositTx) => {
                            console.log('deposit tx = ', depositTx)
                            return depositTx.transactionHash
                          })
                      })
                  })
                  .catch(function (tx) {
                    console.log('deposit error tx = ', tx)
                    return tx.transactionHash
                  })
              }

              return herodotusContract?.deposit(...args, {
                gasLimit: calculateGasMargin(estimatedGasLimit)
              })
            })
          }
          return true
        })
        .then(function (tx) {
          window.location.href = `${process.env.REACT_APP_FRONTEND_URL}/farm`
          return true
        })
        .catch(function (tx) {
          window.location.href = `${process.env.REACT_APP_FRONTEND_URL}/farm`
          return true
        })
    }
    window.location.href = `${process.env.REACT_APP_FRONTEND_URL}/farm`
    return true
  }

  return (
    <TransactionSubmittedContent
      title={t("Add Liquidity Complete")}
      date={`${new Date().toDateString()}, ${new Date().toTimeString().split(" ")[0]}`}
      chainId={chainId}
      hash={txHash}
      content={content}
      button={
        <Button
          onClick={onClick}
          width="100%"
        >
          {t('Add this Liquidity to Farm')}
        </Button>
      }
    />
  )
}

export default React.memo(SubmittedContent);