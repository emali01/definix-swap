import React from 'react';
import { useTranslation } from 'react-i18next';
import { TransactionErrorContent } from 'components/TransactionConfirmationModal';
import { Button } from 'definixswap-uikit';
import { useHistory } from 'react-router';
import { useActiveWeb3React } from 'hooks';

interface IProps {
  txHash: string;
  content: () => React.ReactNode; // modal header
}

const ErrorContent: React.FC<IProps> = ({txHash, content}) => {
  const { chainId } = useActiveWeb3React()
  const { t } = useTranslation();
  const history = useHistory();
  return (
    <TransactionErrorContent
      title="Add Liquidity Failed"
      date={`${new Date().toDateString()}, ${new Date().toTimeString().split(" ")[0]}`}
      chainId={chainId}
      hash={txHash}
      content={content}
      button={
        <Button
          onClick={() => history.replace('/liquidity')}
          width="100%"
        >
          {t('Add Liquidity Again')}
        </Button>
      }
    />
  )
}

export default ErrorContent;