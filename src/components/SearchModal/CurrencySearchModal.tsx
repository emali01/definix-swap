import { Currency } from 'definixswap-sdk'
import { Modal, Box } from 'definixswap-uikit'
import { useTranslation } from 'react-i18next'
import React, { useCallback, useEffect, useState } from 'react'
import useLast from '../../hooks/useLast'
import { useSelectedListUrl } from '../../state/lists/hooks'
import { CurrencySearch } from './CurrencySearch'
import { ListSelect } from './ListSelect'

interface CurrencySearchModalProps {
  isOpen?: boolean;
  onDismiss?: () => void;
  selectedCurrency?: Currency | null
  onCurrencySelect: (currency: Currency) => void
  otherSelectedCurrency?: Currency | null
  // eslint-disable-next-line react/no-unused-prop-types
  showCommonBases?: boolean
}

export default function CurrencySearchModal({
  isOpen,
  onDismiss,
  onCurrencySelect,
  selectedCurrency,
  otherSelectedCurrency,
}: CurrencySearchModalProps) {
  const { t } = useTranslation();
  const [listView, setListView] = useState<boolean>(false)
  // const lastOpen = useLast(isOpen)

  // useEffect(() => {
  //   if (isOpen && !lastOpen) {
  //     setListView(false)
  //   }
  // }, [isOpen, lastOpen])

  // const handleCurrencySelect = useCallback(
  //   (currency: Currency) => {
  //     onCurrencySelect(currency)
  //     onDismiss()
  //   },
  //   [onDismiss, onCurrencySelect]
  // )

  // const handleClickChangeList = useCallback(() => {
  //   setListView(true)
  // }, [])
  // const handleClickBack = useCallback(() => {
  //   setListView(false)
  // }, [])

  // const onDismiss = () => {
  //   console.log('onDismiss')
  // }


  const selectedListUrl = useSelectedListUrl()
  const noListSelected = !selectedListUrl

  return (
    <Modal title={t('Select a token')} onDismiss={onDismiss}>
      <Box>
        <CurrencySearch
          onCurrencySelect={onCurrencySelect}
          onChangeList={() => {
            console.log('onChangeList')
          }}
          selectedCurrency={selectedCurrency}
          otherSelectedCurrency={otherSelectedCurrency}
          showCommonBases={false}
        />
      </Box>
    </Modal>
    // <Box maxHeight={90} minHeight={listView ? 40 : noListSelected ? 0 : 69.4}>
    //   {listView ? (
    //     <>
    //       {/* <ListSelect onDismiss={onDismiss} onBack={handleClickBack} /> */}
    //     </>
    //   ) : noListSelected ? (
    //     <>
    //       <CurrencySearch
    //         isOpen={isOpen}
    //         onDismiss={onDismiss}
    //         onCurrencySelect={handleCurrencySelect}
    //         onChangeList={handleClickChangeList}
    //         selectedCurrency={selectedCurrency}
    //         otherSelectedCurrency={otherSelectedCurrency}
    //         showCommonBases={false}
    //       />
    //     </>
    //   ) : (
    //     <>
    //       <CurrencySearch
    //         isOpen={isOpen}
    //         onDismiss={onDismiss}
    //         onCurrencySelect={handleCurrencySelect}
    //         onChangeList={handleClickChangeList}
    //         selectedCurrency={selectedCurrency}
    //         otherSelectedCurrency={otherSelectedCurrency}
    //         showCommonBases={false}
    //       />
    //     </>
    //   )}
    // </Box>
  )
}
