import { getOpeningsToLearn } from '@/api'

import ProgressBar from '@/components/ProgressBar'
import React, { CSSProperties, useEffect, useRef, useState } from 'react'
import Chessboard from 'chessboardjsx'
import { Chess, Square, Move } from 'chess.js'
import { useLocation } from 'react-router-dom'
import { toast } from 'react-toastify'

type HistoryMove = {
  freq?: number
  uci: string
  cp: number
  total_games?: number
  name?: { name: string }
}


const OPENINGS_TRAININGS = [
  "Queen's Gambit Accepted: Central Variation, Alekhine System",
  "Queen's Gambit Accepted: Central Variation, Greco Variation",
  "Queen's Gambit Accepted: Central Variation, McDonnell Defense",
  "Queen's Gambit Accepted: Central Variation, Modern Defense",
  "Queen's Gambit Accepted: Central Variation, Rubinstein Defense",
  "Queen's Gambit Accepted: Saduleto Variation"
]

const calculateMoveScore = (moveIndex: number, prevMoveProbability: number): number => {
  const baseScore = 10
  const positionMultiplier = 1 + moveIndex * 0.25
  let difficultyMultiplier = 1
  if (prevMoveProbability > 0.5) difficultyMultiplier = 0.5
  if (prevMoveProbability > 0.4) difficultyMultiplier = 0.75
  if (prevMoveProbability > 0.3) difficultyMultiplier = 1
  if (prevMoveProbability > 0.2) difficultyMultiplier = 1.25
  if (prevMoveProbability > 0.1) difficultyMultiplier = 1.5
  if (prevMoveProbability > 0.05) difficultyMultiplier = 2
  if (prevMoveProbability <= 0.05) difficultyMultiplier = 2.5
  console.log('moveIndex', moveIndex, 'prevProb', prevMoveProbability)
  return baseScore * positionMultiplier * difficultyMultiplier
}

const WithMoveValidation = () => {
  const location = useLocation()
  const { fen, name, color, moves } = location.state || {}
  const [game, setGame] = useState(new Chess('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1'))
  const [cp, setCp] = useState(0)
  const [hint, setHint] = useState(0)
  const [openingName, setOpeningName] = useState(name ?? '')
  const [newFen, setNewFen] = useState(fen ?? 'start')
  const [totalMove, setTotalMove] = useState('')
  const [newMoves, setNewMoves] = useState(moves ?? [])
  const [squareStyles, setSquareStyles] = useState({})
  const [pieceSquare, setPieceSquare] = useState('')
  const [history, setHistory] = useState<Move[]>([])
  const [moveHistory, setMoveHistory] = useState<HistoryMove[]>([])

  const [lastComputerMove, setLastComputerMove] = useState('')
  const isCalculatingMove = useRef(false)

  const [openings, setOpenings] = useState<Array<{
    name: string,
    moves: string[],
    fen: string
  }>>([])
  const [currentOpening, setCurrentOpening] = useState<number | null>(null)
  const [currentMoveIndex, setCurrentMoveIndex] = useState(0)
  const [playedOpenings, setPlayedOpenings] = useState<number[]>([])

  const selectRandomOpening = () => {
    if (openings.length > 0) {
      let randomIndex: number; // Déclarer la variable ici

      // Filtrer les index qui n'ont pas encore été joués
      const availableIndexes = Array.from(Array(openings.length).keys())
        .filter(index => !playedOpenings.includes(index))

      // Si toutes les ouvertures ont été jouées, réinitialiser
      if (availableIndexes.length === 0) {
        toast.success('Vous avez pratiqué toutes les ouvertures ! On recommence un nouveau cycle.', {
          position: 'top-center',
          autoClose: 3000,
        })
        setPlayedOpenings([])
        randomIndex = Math.floor(Math.random() * openings.length)
        setPlayedOpenings([randomIndex])
      } else {
        // Sinon, choisir parmi les ouvertures restantes
        randomIndex = availableIndexes[Math.floor(Math.random() * availableIndexes.length)]
        setPlayedOpenings(prev => [...prev, randomIndex])
      }

      setCurrentOpening(randomIndex)
      setCurrentMoveIndex(0)
      setGame(new Chess())
      setNewFen('start')
      setOpeningName(openings[randomIndex].name)
      setTotalMove(openings[randomIndex].moves.join(','))
      setNewMoves([])
      setMoveHistory([])
      setHistory([])
      setCp(0)
      setHint(0)
    }
  }
  useEffect(() => {
    const loadOpenings = async () => {
      try {
        const openingNames = OPENINGS_TRAININGS
        const result = await getOpeningsToLearn(openingNames)

        if (result) {
          setOpenings(result)
          const randomIndex = Math.floor(Math.random() * result.length)
          setCurrentOpening(randomIndex)
          setOpeningName(result[randomIndex].name)
          setTotalMove(result[randomIndex].moves)
          setPlayedOpenings([randomIndex])  // Ajouter la première ouverture aux ouvertures jouées
        }
      } catch (error) {
        console.error('Error loading openings:', error)
        toast.error('Error loading openings')
      }
    }

    loadOpenings()
  }, [])
  console.log('Openings loaded:', openings)

  useEffect(() => {
    const makeComputerMove = async () => {
      if (isCalculatingMove.current || currentOpening === null) return
      isCalculatingMove.current = true

      try {
        // Récupérer l'ouverture actuelle et le prochain coup
        const opening = openings[currentOpening]
        const currentTargetMove = opening.moves[currentMoveIndex]

        // Si nous avons atteint la fin de l'ouverture
        if (currentMoveIndex >= opening.moves.length) {
          toast.success('Opening completed! Moving to next one...', {
            position: 'top-center',
            autoClose: 2000,
          })
          setTimeout(selectRandomOpening, 2000)
          return
        }

        // Faire le coup
        const move = game.move({
          from: currentTargetMove.slice(0, 2),
          to: currentTargetMove.slice(2, 4),
          promotion: 'q'
        })

        if (move) {
          setNewFen(game.fen())
          setHistory(game.history({ verbose: true }))
          setMoveHistory(prev => [...prev, {
            uci: currentTargetMove,
            cp: 0, // Valeur par défaut
            name: { name: opening.name }
          }])
          setNewMoves((prev: string[]) => [...prev, currentTargetMove])
          setCurrentMoveIndex(prev => prev + 1)
        }
      } catch (error) {
        console.error('Error in computer move:', error)
      } finally {
        isCalculatingMove.current = false
      }
    }

    const isComputerTurn = currentOpening !== null &&
      ((currentMoveIndex % 2 === 1 && color === 'white') ||
        (currentMoveIndex % 2 === 0 && color === 'black'))

    if (isComputerTurn) {
      void makeComputerMove()
    }
  }, [currentMoveIndex, currentOpening, newMoves])

  const restartGame = () => {
    selectRandomOpening()
    toast.info('Starting new random opening', {
      position: 'top-center',
      autoClose: 1500,
    })
  }

  const squareStyling = (pieceSquare: string, history: any[]) => {
    const lastMove = history.length ? history[history.length - 1] : null
    const sourceSquare = lastMove?.from
    const targetSquare = lastMove?.to

    return {
      [pieceSquare]: { backgroundColor: 'rgba(255, 255, 0, 0.4)' },
      ...(sourceSquare && {
        [sourceSquare]: { backgroundColor: 'rgba(255, 255, 0, 0.4)' }
      }),
      ...(targetSquare && {
        [targetSquare]: { backgroundColor: 'rgba(255, 255, 0, 0.4)' }
      })
    }
  }

  const removeHighlightSquare = () => {
    setSquareStyles(squareStyling(pieceSquare, history))
  }

  const highlightSquare = (sourceSquare: string, squaresToHighlight: string[]) => {
    const highlightStyles = [sourceSquare, ...squaresToHighlight].reduce(
      (a, c) => ({
        ...a,
        [c]: {
          background: 'radial-gradient(circle, #fffc00 36%, transparent 40%)',
          borderRadius: '50%'
        }
      }),
      squareStyling(pieceSquare, history)
    )

    setSquareStyles((prev) => ({ ...prev, ...highlightStyles }))
  }

  const onDrop = async ({ sourceSquare, targetSquare }: { sourceSquare: string; targetSquare: string }) => {
    try {
      if (sourceSquare === targetSquare || currentOpening === null) return

      const opening = openings[currentOpening]
      const currentTargetMove = opening.moves[currentMoveIndex]
      const playerMove = `${sourceSquare}${targetSquare}`

      if (playerMove !== currentTargetMove) {
        setHint(hint + 1)
        if (hint + 1 >= 3) {
          setSquareStyles({
            [currentTargetMove.slice(0, 2)]: { backgroundColor: 'blue' },
            [currentTargetMove.slice(2, 4)]: { backgroundColor: 'blue' }
          })
          setHint(0)
        }
        return false
      }

      const move = game.move({
        from: sourceSquare,
        to: targetSquare,
        promotion: 'q'
      })

      if (move === null) return false

      setNewMoves((prev: string[]) => [...prev, currentTargetMove])
      setNewFen(game.fen())
      setHistory(game.history({ verbose: true }))
      setMoveHistory(prev => [...prev, {
        uci: playerMove,
        cp: 0,
        name: { name: opening.name }
      }])
      setCurrentMoveIndex(prev => prev + 1)
      setHint(0)

      return true
    } catch (error) {
      console.error('Error processing move:', error)
      return false
    }
  }

  const onMouseOverSquare = (square: Square) => {
    const moves = game.moves({ square, verbose: true })
    if (moves.length === 0) return
    const squaresToHighlight = moves.map((move) => move.to)
    highlightSquare(square, squaresToHighlight)
  }

  const onMouseOutSquare = () => removeHighlightSquare()

  const onSquareClick = (square: string) => {
    console.log('Square clicked:', square)

    if (!pieceSquare) {
      setPieceSquare(square)
      setSquareStyles(squareStyling(square, history))
      return
    }

    try {
      const move = game.move({
        from: pieceSquare,
        to: square,
        promotion: 'q'
      })

      if (move === null) {
        console.log(`Invalid move from ${pieceSquare} to ${square}`)
        setPieceSquare('')
        return
      }

      setNewFen(game.fen())
      setHistory(game.history({ verbose: true }))
      setPieceSquare('')
      setSquareStyles(squareStyling(square, history))
    } catch (error) {
      console.error('An error occurred during the move:', error)
      setPieceSquare('')
    }
  }

  const onSquareRightClick = (square: string) => {
    setSquareStyles({ [square]: { backgroundColor: 'deepPink' } })
  }
  // d2d4g8f6c2c4c7c5d4d5b7b5c4b5a7a6e2e3g7g6b1c3f8g7e3e4
  // d2d4g8f6c2c4c7c5d4d5b7b5c4b5a7a6e2e3d7d6b1c3g7g6e3e4
  const totalOpeningsCount = openings.length
  const completedOpeningsCount = playedOpenings.length
  return (
    <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'flex-start' }}>
      <ProgressBar
        total={totalOpeningsCount}
        current={completedOpeningsCount}
      />
      <div style={styles.containerChessboard}>
        <h2 style={{ maxWidth: '700px' }}>{openingName ? openingName : 'Start'}</h2>
        <h4 style={{ maxWidth: '700px' }}>{totalMove ? totalMove : 'Start'}</h4>
        <Chessboard
          id="humanVsHuman"
          width={600}
          orientation={color}
          position={newFen}
          onDrop={onDrop}
          onMouseOverSquare={onMouseOverSquare}
          onMouseOutSquare={onMouseOutSquare}
          boardStyle={{ borderRadius: '5px', boxShadow: '0 5px 15px rgba(0, 0, 0, 0.5)' }}
          squareStyles={squareStyles}
          onSquareClick={onSquareClick}
          onSquareRightClick={onSquareRightClick}
          transitionDuration={150}
          darkSquareStyle={{ backgroundColor: 'rgba(140,162,173,1)' }}
          lightSquareStyle={{ backgroundColor: 'rgba(222,227,230, 0.5)' }}
        />
        <div style={styles.containerBtn}>
          <button style={styles.btn} onClick={restartGame}>Restart</button>
        </div>

      </div>
    </div>)
}

const styles: { [key: string]: CSSProperties } = {
  containerInfo: {
    display: 'flex',
  },
  containerChessboard: {
    display: 'flex',
    flexDirection: 'column'
  },
  containerMoves: {
    alignSelf: 'flex-start',
    marginTop: '40px',
    padding: '0 50px'
  },
  btn: {
    width: 'fit-content',
    alignSelf: 'center',
    padding: '5px 10px',
    borderRadius: '10px',
    backgroundColor: '#3d5afb',
    color: 'white',
    fontSize: '14px',
    fontWeight: 'bold'
  },
  containerBtn: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: '50px',
    marginTop: '30px'
  }
}

export default WithMoveValidation
