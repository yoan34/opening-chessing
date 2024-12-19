import React, { CSSProperties } from 'react'

type MoveHistoryProps = {
  freq?: number
  uci: string
  cp: number
  total_games?: number
  name?: { name: string }
}
type MovesHistoryProps = {
  moves: MoveHistoryProps[]
}

const MovesHistory: React.FC<MovesHistoryProps> = ({ moves }: MovesHistoryProps) => {
  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div style={styles.uci}>coup</div>
        <div style={styles.uci}>UCI</div>
        <div style={styles.cp}>CP</div>
        <div style={styles.freq}>joué %</div>
        <div style={styles.games}>parties</div>
      </div>
      {moves.map((move: MoveHistoryProps, index: number) => {
        const color = index % 2 === 0 ? 'white' : 'black'
        return (
          <div key={move.uci} style={color === 'white' ? styles.move : styles.moveBlack}>
            <div style={styles.uci}>{index + 1}</div>
            <div style={styles.uci}>{move.uci}</div>
            <div style={styles.cp}>{move.cp}</div>
            {move.freq && (
              <div style={styles.freq}>
                <div style={styles.barContainer}>
                  <div style={{ ...styles.bar, width: `${move.freq}%` }}/>
                  <span style={styles.barText}>{move.freq}%</span>
                </div>
              </div>

            )}
            {move.total_games && <div style={styles.games}>{move.total_games}</div>}
          </div>
        )
      })}
    </div>
  )
}

const styles: { [key: string]: CSSProperties } = {
  container: {},
  header: {
    display: 'flex',
    flexDirection: 'row',
    padding: '5px 10px',
  },
  move: {
    display: 'flex',
    flexDirection: 'row',
    padding: '5px 10px',
    borderTop: '1px solid black',
    backgroundColor: 'rgba(222,227,230, 0.5)'
  },
  moveBlack: {
    display: 'flex',
    flexDirection: 'row',
    padding: '5px 10px',
    borderTop: '1px solid black',
    backgroundColor: 'rgba(140,162,173,1)'
  },
  barContainer: {
    width: '100px',           // Largeur maximale de la barre
    height: '16px',            // Hauteur de la barre
    backgroundColor: '#e0e0e0', // Couleur de fond de la barre
    borderRadius: '5px',
    position: 'relative',      // Pour positionner le texte au centre
    overflow: 'hidden',
    marginLeft: '8px'
  },
  bar: {
    height: '100%',            // Hauteur de la barre colorée
    backgroundColor: '#4caf50', // Couleur de la barre de progression
    transition: 'width 0.3s ease' // Animation pour la progression
  },
  barText: {
    position: 'absolute',      // Positionnement absolu pour rester au centre
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)', // Centre le texte
    fontWeight: 'bold',
    color: '#000',             // Couleur du texte (noir pour contraster avec le fond)
    fontSize: '12px',
    zIndex: 1                  // Assure que le texte est au-dessus de la barre
  },
  opening: {
    width: '300px',
    fontWeight: 500
  },
  uci: {
    width: '80px',
    fontWeight: 'bold'
  },
  cp: {
    width: '80px',
    fontWeight: 'bold'
  },
  freq: {
    width: '150px',
    fontWeight: 'bold',
  },
  games: {
    width: '120px',
    fontWeight: 'bold'
  }
}

export default MovesHistory
