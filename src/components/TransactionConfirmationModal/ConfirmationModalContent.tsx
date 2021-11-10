import React from 'react'
import { Text, Flex, ColorStyles } from 'definixswap-uikit'

type ConfirmationModalContentProps = {
  mainTitle: string
  title?: string
  topContent: () => React.ReactNode
  bottomContent: () => React.ReactNode
}

const ConfirmationModalContent = ({ mainTitle, title, topContent, bottomContent }: ConfirmationModalContentProps) => {
  return (
    <Flex width="464px" flexDirection="column">
      <Flex flexDirection="column">
        <Flex justifyContent="space-between" p="22px 24px">
          <Text textStyle="R_18B" color={ColorStyles.BLACK}>
            {mainTitle}
          </Text>
        </Flex>
        

        {/* <Heading className="mb-6">{title}</Heading> */}
        {topContent()}
      </Flex>

      <div className="pa-6">{bottomContent()}</div>
    </Flex>
  )
}

export default React.memo(ConfirmationModalContent)
