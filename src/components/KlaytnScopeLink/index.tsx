import React from 'react'
import styled from 'styled-components'
import { Text, ArrowRightGIcon } from '@fingerlabs/definixswap-uikit-v2'
import { useTranslation } from 'react-i18next'

interface Props {
  hash: string;
}

const WrapLink = styled.a`
  display: flex;
  align-items: center;
`

const LinkText = styled(Text)`
  ${({ theme }) => theme.textStyle.R_12R}
  color: ${({ theme }) => theme.colors.mediumgrey};
`

const KlaytnScopeLink: React.FC<Props> = ({ hash }) => {
  const { t } = useTranslation();
  return (
    <WrapLink href={`https://scope.klaytn.com/tx/${hash}`} target='_blank'>
      <LinkText>
        {t('View on KlaytnScope')}
      </LinkText>
      <ArrowRightGIcon />
    </WrapLink>
  )
}

export default KlaytnScopeLink;