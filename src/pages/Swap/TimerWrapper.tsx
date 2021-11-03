import React from 'react'
import Flip from '../../uikit-dev/components/Flip'

interface IProps {
  isPhrase2: boolean;
  date: number;
  children: React.ReactNode;
}

const TimerWrapper: React.FC<IProps> = ({ isPhrase2, date, children }) => {
  return isPhrase2 ? (
    <>{children}</>
  ) : (
    <>
      <div>
        <br />
        <Flip date={date} />
        <br />
        <br />
        <br />
      </div>
      <div
        tabIndex={0}
        role="button"
        style={{ opacity: 0.4, pointerEvents: 'none' }}
        onClick={(e) => {
          e.preventDefault()
        }}
        onKeyDown={(e) => {
          e.preventDefault()
        }}
      >
        {children}
      </div>
    </>
  )
}

export default TimerWrapper;