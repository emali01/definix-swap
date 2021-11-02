import React, { useState } from 'react'
import { DefaultTheme, ThemeProvider as SCThemeProvider } from 'styled-components'
import { light, dark } from 'definixswap-uikit';
import oldLight from 'uikit-dev/theme/light';
import oldDark from 'uikit-dev/theme/dark';

const CACHE_KEY = 'IS_DARK'

export interface ThemeContextType {
  isDark: boolean
  toggleTheme: (isDarkMode) => void
}

const ThemeContext = React.createContext<ThemeContextType>({
  isDark: false,
  toggleTheme: (isDarkMode) => null,
})

const ThemeContextProvider: React.FC = ({ children }) => {
  const [isDark, setIsDark] = useState(() => {
    const isDarkUserSetting = localStorage.getItem(CACHE_KEY)
    return isDarkUserSetting ? JSON.parse(isDarkUserSetting) : false
  })

  const toggleTheme = (isDarkmode) => {
    setIsDark(() => {
      localStorage.setItem(CACHE_KEY, JSON.stringify(isDarkmode))
      return isDarkmode
    })
  }

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme }}>
      <SCThemeProvider theme={(isDark ? {
        ...oldDark,
        ...dark,
        colors: {
          ...oldDark.colors,
          ...(dark as DefaultTheme).colors,
        }
      } : {
        ...oldLight,
        ...light,
        colors: {
          ...oldLight.colors,
          ...(light as DefaultTheme).colors,
        }
      }) as DefaultTheme}>{children}</SCThemeProvider>
    </ThemeContext.Provider>
  )
}

export { ThemeContext, ThemeContextProvider }
