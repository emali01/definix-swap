import React, { useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Box, Flex, TitleSet, useMatchBreakpoints, Tabs, ColorStyles } from 'definixswap-uikit'
import LiquidityList from './LiquidityList'
import AddLiquidity from './AddLiquidity'

const Liquidity: React.FC = () => {
  const { isXl, isXxl } = useMatchBreakpoints()
  const isMobile = useMemo(() => !isXl && !isXxl, [isXl, isXxl])
  const { t } = useTranslation();

  const tabNames = useMemo(() => [t('Add'), t('Remove')], [t]);
  const [curTab, setCurTab] = useState<string>(tabNames[0]);
  return (
    <Flex width="100%" justifyContent="center">
      <Flex flexDirection="column" width={isMobile ? "100%" : "629px"}>
        <Flex mb="40px">
          <TitleSet
            title={t("Liquidity")}
            description={t("Pair your tokens and deposit in a liquidity pool to get high interest profit.")}
            link="/"
            linkLabel={t("Learn to swap.")}
          />
        </Flex>
        <Flex
          flexDirection="column"
        >
          <Box
            backgroundColor={ColorStyles.WHITE}
            borderTopLeftRadius="16px"
            borderTopRightRadius="16px"
          >
            <Tabs 
              tabs={tabNames}
              curTab={curTab}
              setCurTab={setCurTab}
              small={isMobile}
              equal={isMobile}
            />
          </Box>
          <Box>
            {curTab === tabNames[0] && (
              <AddLiquidity />
            )}
            {curTab === tabNames[1] && (
              <LiquidityList />
            )}
          </Box>
        </Flex>
      </Flex>

      {/* <TransactionConfirmationModal
        isOpen={showConfirm}
        isPending={!!attemptingTxn}
        isSubmitted={!!txHash}
        isError={!!errorMsg}
        confirmContent={() => (
          <ConfirmationModalContent
            mainTitle={t("Confirm Add liquidity")}
            title={noLiquidity ? t('You are creating a pool') : t('You will receive')}
            topContent={() => 
              <ModalHeader
                noLiquidity={noLiquidity}
                currencies={currencies}
                liquidityMinted={liquidityMinted}
              />
            }
            bottomContent={() =>
              <ModalBottom 
                price={price}
                currencies={currencies}
                parsedAmounts={parsedAmounts}
                noLiquidity={noLiquidity}
                onAdd={onAdd}
                poolTokenPercentage={poolTokenPercentage}
                allowedSlippage={allowedSlippage}
              />}
          />
        )}
        pendingIcon={null}
        submittedContent={() => 
          <SubmittedContent
            txHash={txHash}
            currencies={currencies}
            liquidityMinted={liquidityMinted}
            setAttemptingTxn={setAttemptingTxn}
            approvalLP={approvalLP}
            approveLPCallback={approveLPCallback}
            content={() => 
              <ModalHeader
                noLiquidity={noLiquidity}
                currencies={currencies}
                liquidityMinted={liquidityMinted}
              />}
          />
        }
        errorContent={() => 
          <ErrorContent
            txHash={txHash}
            content={() => 
              <ModalHeader
                noLiquidity={noLiquidity}
                currencies={currencies}
                liquidityMinted={liquidityMinted}
              />}
          />
        }
        onDismiss={handleDismissConfirmation}

        setShowConfirm={setShowConfirm}
        setTxHash={setTxHash}
        onFieldAInput={onFieldAInput}
        onFieldBInput={onFieldBInput}
      /> */}
    </Flex>
  )
}

export default React.memo(Liquidity);