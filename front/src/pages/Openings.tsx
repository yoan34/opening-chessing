import OpeningItem from '@/components/OpeningItem'
import { Move } from 'chess.js'
import React, { CSSProperties, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Chessboard } from 'react-chessboard'

// Définir l'interface pour un élément d'ouverture
interface Opening {
  name: string;
  fen: string;
  moves: string;
}

// Typé le tableau `openings` en utilisant l'interface `Opening`
const openings: Opening[] = []

const startFen = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1'  // Position de départ standard

const Openings: React.FC = () => {
  const navigate = useNavigate()
  const [openings, setOpenings] = useState<Opening[]>([])
  useEffect(() => {
    // Appel de l'API pour récupérer les ouvertures
    fetch('http://127.0.0.1:8000/openings')
      .then((response) => response.json())
      .then((data) => setOpenings(data))
      .catch((error) => console.error('Erreur lors de la récupération des données:', error))

    const sessionData = {
      maxMoves: 10,
      NumberOfOpening: 3,
      startMove: "e2e4",
      secondes: 120,
      fen: "rnbqkb1r/pppppppp/8/8/8/8/PPPPPPPP/RNBQKB1R w KQkq - 0 1",
      openingName: "Ruy Lopez",
      createdAt: new Date().toISOString(), // Format ISO
      score: 100,
      openings: [
        {
          id: 1,
          score: 50,
          moves: [
            { uci: "e2e4", score: 20 },
            { uci: "e7e5", score: 30 }
          ]
        }
      ]
    };

    fetch('http://localhost:8000/save_session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(sessionData)
    })
      .then(response => response.json())
      .then(data => console.log('Session saved:', data))
      .catch(error => console.error('Error saving session:', error));
  }, [])

  const handleStartGame = (color: 'white' | 'black') => {
    navigate(`/play`, { state: { fen: startFen, name: 'Position de départ', color, moves: [] } })
  }

  const whiteOpenings = openings.filter(opening => opening.fen.includes(' w '))
  const blackOpenings = openings.filter(opening => opening.fen.includes(' b '))

  return (
    <div>
      <h1 style={{ textAlign: 'center' }}>Openings</h1>
      <p style={{ textAlign: 'center' }}>Choisissez votre couleur de départ :</p>

      <div style={styles.startingBoardContainer}>
        <div>
          <Chessboard position={startFen} boardWidth={400}/>
        </div>
        <div style={styles.buttonContainer}>
          <button style={styles.button} onClick={() => handleStartGame('white')}>White</button>
          <button style={styles.button} onClick={() => handleStartGame('black')}>Black</button>
        </div>
      </div>

      <p style={{ textAlign: 'center' }}>Liste des ouvertures d'échecs.</p>
      <div style={styles.columns}>
        {/* Condition pour vérifier s'il n'y a pas d'ouvertures disponibles */}
        {whiteOpenings.length === 0 && blackOpenings.length === 0 ? (
          <p>Not openings...</p>
        ) : (
          <>
            <div style={styles.column}>
              <h2>Blancs</h2>
              {whiteOpenings.map((opening) => (
                <OpeningItem key={opening.moves} color="white" moves={opening.moves} name={opening.name} fen={opening.fen}/>
              ))}
            </div>

            <div style={styles.column}>
              <h2>Noirs</h2>
              {blackOpenings.map((opening) => (
                <OpeningItem key={opening.moves} color="black" moves={opening.moves} name={opening.name} fen={opening.fen}/>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

const styles: { [key: string]: CSSProperties } = {
  startingBoardContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    marginBottom: '20px'
  },
  buttonContainer: {
    display: 'flex',
    gap: '10px',
    marginTop: '10px'
  },
  button: {
    padding: '10px 20px',
    backgroundColor: '#4CAF50',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer'
  },
  columns: {
    display: 'flex',
    gap: '20px',
    justifyContent: 'space-evenly'
  },
  column: {
    flex: 1,
    maxWidth: '400px'
  }
}

export default Openings
