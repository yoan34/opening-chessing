import React, { CSSProperties } from 'react'


type ProgressBarProps = {
  total: number
  current: number
}

const ProgressBar = ({ total, current }: ProgressBarProps) => {
  const percentage = (current / total) * 100

  return (
    <div style={styles.progressContainer}>
      <div style={styles.progressHeader}>
        <span>Openings Progress: {current}/{total}</span>
      </div>
      <div style={styles.progressBarContainer}>
        <div
          style={{
            ...styles.progressBar,
            width: `${percentage}%`
          }}
        />
      </div>
    </div>
  )
}

// Styles
const styles: { [key: string]: CSSProperties } = {
  progressContainer: {
    padding: '8px 16px',
    marginBottom: '20px'
  },
  progressHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '8px',
    fontSize: '14px',
    fontWeight: 500
  },
  progressBarContainer: {
    width: '100%',
    height: '10px',
    backgroundColor: '#e5e7eb',
    borderRadius: '9999px',
    overflow: 'hidden'
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#3d5afb',
    borderRadius: '9999px',
    transition: 'width 0.5s ease-in-out'
  }
}

export default ProgressBar