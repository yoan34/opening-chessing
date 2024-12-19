import React, { CSSProperties } from 'react'
import { Chessboard } from 'react-chessboard'
import { useNavigate } from 'react-router-dom'

interface OpeningItemProps {
  name: string;
  fen: string;
  moves: string;
  color: 'white' | 'black';
}

const OpeningItem: React.FC<OpeningItemProps> = ({ name, fen, color, moves }) => {
  const navigate = useNavigate()
  const listMoves = moves.split(',')
  const handlePlayOpening = () => {
    navigate(`/play`, {
      state: { fen, name, color, moves: listMoves }
    })
  }

  return (
    <div style={styles.container}>
      <h3 style={{ width: '300px' }}>{name}</h3>
      <div>
        <Chessboard position={fen} boardWidth={200} boardOrientation={color}/>
      </div>
      <button onClick={handlePlayOpening} style={{ marginTop: '10px' }}>
        Jouer cette ouverture
      </button>
      <div>{moves}</div>
    </div>
  )
}

const styles: { [key: string]: CSSProperties } = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    width: '400px',
    marginBottom: '20px',
    textAlign: 'center',
    backgroundColor: 'grey',
    padding: '10px',
    borderRadius: '10px'
  }
}

export default OpeningItem
