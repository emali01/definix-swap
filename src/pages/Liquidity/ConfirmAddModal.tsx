import React, { useCallback, useState } from 'react'
import { Flex, Modal, Box, InjectedModalProps, Divider } from 'definixswap-uikit'
import styled from 'styled-components'
import { Currency, CurrencyAmount, Percent, Price, TokenAmount } from 'definixswap-sdk'
import { useTranslation } from 'react-i18next'
import ModalHeader from './ModalHeader'
import ModalBottom from './ModalBottom'

interface Props extends InjectedModalProps {
  noLiquidity: boolean;
  currencies: {
    CURRENCY_A?: Currency;
    CURRENCY_B?: Currency;
  };
  liquidityMinted: TokenAmount;
  price: Price;
  parsedAmounts: {
    CURRENCY_A?: CurrencyAmount;
    CURRENCY_B?: CurrencyAmount;
  };
  onAdd: () =>  Promise<void>;
  poolTokenPercentage: Percent;
  allowedSlippage: number;
}

const Wrap = styled(Box)`
  width: calc(100vw - 48px);
  height: 100%;

  @media screen and (min-width: 464px) {
    width: 416px;
  }
`


export default function ConfirmAddModal({
  noLiquidity,
  currencies,
  liquidityMinted,
  price,
  parsedAmounts,
  onAdd,
  poolTokenPercentage,
  allowedSlippage,
  onDismiss = () => null,
}: Props) {
  const { t } = useTranslation()

  return (
    <Modal title={t('Confirm Add Liquidity')} mobileFull onDismiss={onDismiss}>
      <Wrap>
        <Flex flexDirection="column" mb="20px" mt="16px">
          <ModalHeader
            noLiquidity={noLiquidity}
            currencies={currencies}
            liquidityMinted={liquidityMinted}
          />
        </Flex>
        <Divider mb="24px" mt="35px" />
        <Flex flexDirection="column">
          <ModalBottom 
            price={price}
            currencies={currencies}
            parsedAmounts={parsedAmounts}
            noLiquidity={noLiquidity}
            onAdd={onAdd}
            poolTokenPercentage={poolTokenPercentage}
            allowedSlippage={allowedSlippage}
          />
        </Flex>
      </Wrap>
    </Modal>
  )
}
