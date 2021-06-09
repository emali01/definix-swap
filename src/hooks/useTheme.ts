import { useContext } from 'react'
import { ThemeContext as StyledThemeCopntext } from 'styled-components'
import { ThemeContext } from '../ThemeContext'

const useTheme = () => {
  const { isDark, toggleTheme, setIsDark } = useContext(ThemeContext)
  const theme = useContext(StyledThemeCopntext)
  return { isDark, toggleTheme, theme, setIsDark }
}

export default useTheme
