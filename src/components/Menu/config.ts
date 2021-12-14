export const links = (t: (key: string) => string) => {
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
          label: t('GitBook'),
          href: 'https://sixnetwork.gitbook.io/definix-on-klaytn-en/',
        },
        {
          label: t('Partnership'),
          href: 'https://docs.google.com/forms/d/e/1FAIpQLScQcrUmV53N5y-ita6zD4Do8nQ6zdI_Al795jMUK--HSbHU5Q/viewform',
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
