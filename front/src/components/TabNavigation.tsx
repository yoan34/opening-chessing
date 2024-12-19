import React, { CSSProperties } from 'react'
import { useNavigate } from 'react-router-dom'

const TabNavigation: React.FC = () => {
  const navigate = useNavigate()

  return (
    <div style={styles.tabContainer}>
      <button onClick={() => navigate('/')} style={styles.tabButton}>
        Ouvertures
      </button>
      <button onClick={() => navigate('/play')} style={styles.tabButton}>
        Play
      </button>
    </div>
  )
}

const styles: { [key: string]: CSSProperties } = {
  tabContainer: {
    display: 'flex',
    justifyContent: 'space-around',
    padding: '10px 0',
    borderBottom: '1px solid black'

  },
  tabButton: {
    color: 'white',
    backgroundColor: 'grey',
    border: 'none',
    cursor: 'pointer',
    fontSize: '16px',
    padding: '10px 20px',
    borderRadius: '10px'
  }
}

export default TabNavigation
