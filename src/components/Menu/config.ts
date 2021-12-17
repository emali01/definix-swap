export const links = (t: (key: string) => string, currentLang: string) => {
  return [
    {
      label: t('Home'),
      icon: 'GnbHomeNIcon',
      activeIcon: 'GnbHomeSIcon',
      href: process.env.REACT_APP_FRONTEND_URL,
    },
    {
      label: t('Exchange'),
      icon: 'GnbExchangeNIcon',
      activeIcon: 'GnbExchangeNIcon',
      items: [
        {
          label: t('Swap'),
          href: '/swap',
        },
        {
          label: t('Liquidity'),
          href: '/liquidity',
        },
      ],
    },
    {
      label: t('Yield Farming'),
      icon: 'GnbFarmingNIcon',
      activeIcon: 'GnbFarmingNIcon',
      items: [
        {
          label: t('Farm'),
          href: `${process.env.REACT_APP_FRONTEND_URL}/farm`,
        },
        {
          label: t('Pool'),
          href: `${process.env.REACT_APP_FRONTEND_URL}/pool`,
        },
      ],
    },
    {
      label: t('Rebalancing'),
      icon: 'GnbRebalancingNIcon',
      activeIcon: 'GnbRebalancingSIcon',
      href: `${process.env.REACT_APP_FRONTEND_URL}/rebalancing`,
    },
    {
      label: t('vFINIX'),
      icon: 'GnbFinixNIcon',
      activeIcon: 'GnbFinixSIcon',
      items: [
        {
          label: t('Long-term Stake'),
          href: `${process.env.REACT_APP_FRONTEND_URL}/long-term-stake`,
        },
      ],
    },
    {
      label: t('Bridge'),
      icon: 'GnbBridgeNIcon',
      activeIcon: 'GnbBridgeSIcon',
      href: `${process.env.REACT_APP_FRONTEND_URL}/bridge`,
    },
    {
      label: t('More'),
      icon: 'GnbMoreNIcon',
      activeIcon: 'GnbMoreNIcon',
      items: [
        {
          label: t('Document'),
          href: currentLang === 'ko' ? 'https://sixnetwork.gitbook.io/definix-on-klaytn-kr/' : 'https://sixnetwork.gitbook.io/definix-on-klaytn-en/',
          target: '_blank'
        },
        {
          label: t('Feedback'),
          href: 'https://forms.gle/x9rfWuzD9Kpa8xa47',
          target: '_blank'
        },
      ],
    },
  ]
}

export const socials = [
  {
    label: 'facebook',
    icon: 'FooterFacebookIcon',
    href: 'https://www.facebook.com/thesixnetwork',
  },
  {
    label: 'Twitter',
    icon: 'FooterTwitterIcon',
    href: 'https://twitter.com/DefinixOfficial',
  },
  {
    label: 'telegram',
    icon: 'FooterTelegramIcon',
    href: 'https://t.me/SIXNetwork',
  },
  {
    label: 'kakao',
    icon: 'FooterKakaotalkIcon',
    href: 'https://open.kakao.com/o/gQNRT5K',
  },
  {
    label: 'gitbook',
    icon: 'FooterGitbookIcon',
    href: 'https://sixnetwork.gitbook.io/definix-on-klaytn-en/',
  },
  {
    label: 'github',
    icon: 'FooterGithubIcon',
    href: 'https://github.com/thesixnetwork',
  },
  {
    label: 'reddit',
    icon: 'FooterRedditIcon',
    href: 'https://www.reddit.com/r/sixnetwork',
  },
]
