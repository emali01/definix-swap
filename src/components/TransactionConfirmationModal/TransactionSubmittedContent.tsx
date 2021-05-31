import { RowBetween } from 'components/Row'
import { ChainId } from 'definixswap-sdk'
import React from 'react'
import Lottie from 'react-lottie'
import { ChevronRightIcon, Heading, Link, Text } from 'uikit-dev'
import complete from 'uikit-dev/animation/complete.json'
import CopyToClipboard from 'uikit-dev/widgets/WalletModal/CopyToClipboard'
import { getBscScanLink } from '../../utils'

const options = {
  loop: true,
  autoplay: true,
  animationData: complete,
}

type TransactionSubmittedContentProps = {
  title: string
  date?: string
  onDismiss: () => void
  hash: string | undefined
  chainId: ChainId
  content?: any
}

const TransactionSubmittedContent = ({
  title,
  date,
  onDismiss,
  chainId,
  hash,
  content,
}: TransactionSubmittedContentProps) => {
  return (
    <div className="pa-6 pt-4" style={{ position: 'relative', width: '480px', height: '480px' }}>
      <Lottie options={options} height={120} width={120} />
      <Heading fontSize="24px !important" textAlign="center">
        {title}
      </Heading>
      <Text color="textSubtle" textAlign="center" className="mt-2" fontSize="12px">
        {date}
      </Text>

      {content()}

      {chainId && hash && (
        <RowBetween className="mt-6">
          <div className="flex">
            <Text className="mr-2">Transaction Hash</Text>
            <Text className="mr-2" bold>
              {`${hash.substring(0, 8)}...${hash.substring(hash.length - 8)}`}
            </Text>
            <CopyToClipboard noPadding toCopy={hash} />
          </div>

          <Link
            external
            href={getBscScanLink(chainId, hash, 'transaction')}
            bold={false}
            className="flex-shrink"
            color="textSubtle"
            fontSize="12px"
          >
            View on BscScan
            <ChevronRightIcon color="textSubtle" />
          </Link>
        </RowBetween>
      )}
    </div>
  )
}

export default TransactionSubmittedContent
