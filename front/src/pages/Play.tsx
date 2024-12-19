import { computerPlay, saveSession, validateTopMove } from '@/api'
import MovesHistory from '@/components/MoveHistory'
import Session from '@/components/Session'
import SessionForm from '@/components/SessionForm'
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

type SessionMove = {
  uci: string
  score: number
}
type OpeningData = {
  id: number
  score: number
  moves: SessionMove[]
}

export type SessionData = {
  maxMoves: number;
  NumberOfOpening: number
  startMove: string;
  secondes: number;
  fen: string;
  openingName: string;
  createdAt: string;
  score: number;
  openings: OpeningData[]
};

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
  const [game, setGame] = useState(new Chess(fen ?? 'start'))
  const [cp, setCp] = useState(0)
  const [hint, setHint] = useState(0)
  const [openingName, setOpeningName] = useState(name ?? '')
  const [newFen, setNewFen] = useState(fen ?? 'start')
  const [newMoves, setNewMoves] = useState(moves ?? [])
  const [squareStyles, setSquareStyles] = useState({})
  const [pieceSquare, setPieceSquare] = useState('')
  const [history, setHistory] = useState<Move[]>([])
  const [moveHistory, setMoveHistory] = useState<HistoryMove[]>([])

  // SESSION
  const [openingLength, setOpeningLength] = useState<number | null>(null)
  const [stopAfterMoves, setStopAfterMoves] = useState<number | null>(null)
  const [sessionData, setSessionData] = useState<SessionData | null>(null)
  const [isSessionActive, setIsSessionActive] = useState<boolean>(false)

  const handleStartSession = (NumberOfOpening: number, maxMoves: number) => {
    setOpeningLength(NumberOfOpening)
    setStopAfterMoves(moves)
    setGame(new Chess(fen ?? 'start'))
    setCp(0)
    setHint(0)
    setOpeningName('')
    setNewFen(fen ?? 'start')
    setNewMoves(moves ?? [])
    setMoveHistory([])
    setSquareStyles({})
    setPieceSquare('')
    setHistory([])
    setIsSessionActive(true)
    setSessionData({
      maxMoves,
      NumberOfOpening,
      startMove: newMoves,
      fen: fen ?? 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
      openingName,
      secondes: 0,
      score: 0,
      createdAt: new Date().toISOString(),
      openings: [{ 'id': 1, moves: [], score: 0 }]
    })
  }

  const handleSessionEndOpening = (move: string) => {
    if (!sessionData) return
    const updatedOpenings = [...sessionData?.openings]

    const lastOpening = updatedOpenings[updatedOpenings.length - 1]
    const lastId = lastOpening?.id
    if (lastOpening && move) {
      lastOpening.moves = [...lastOpening.moves, { uci: move, score: 0 }]
      toast.info(`Top move was: ${move}`, {
        position: 'top-center',
        autoClose: 3000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true
      })
      setSquareStyles({
        [move.slice(0, 2)]: { backgroundColor: 'green' },
        [move.slice(2, 4)]: { backgroundColor: 'green' }
      })
    }
    if (openingLength === updatedOpenings.length) {
      setIsSessionActive(false)
    } else {
      if (lastId !== undefined) {
        const nextOpening = { id: lastId + 1, moves: [], score: 0 }
        updatedOpenings.push(nextOpening)
      }
    }

    setSessionData({
      ...sessionData,
      openings: updatedOpenings
    })
  }

  const handleSessionCorrectMove = (move: string) => {
    if (!sessionData) return
    const updatedOpenings = [...sessionData?.openings]

    const lastOpening = updatedOpenings[updatedOpenings.length - 1]
    if (lastOpening) {
      const moveCount = lastOpening?.moves?.length ?? 0
      const lastMoveFreq = moveHistory.length > 0 ? moveHistory[moveHistory.length - 1]?.freq ?? 1 : 1
      const score = calculateMoveScore(moveCount, lastMoveFreq)
      lastOpening.moves = [...lastOpening.moves, { uci: move, score }]
      const lastId = lastOpening?.id
      if (lastOpening.moves.length === sessionData.maxMoves) {
        toast.info(`Ouvertures fini en max ${sessionData.maxMoves} coups, bien joué!`, {
          position: 'top-center',
          autoClose: 2000,
          hideProgressBar: true,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true
        })
        if (openingLength === updatedOpenings.length) {
          setIsSessionActive(false)

          saveSession(sessionData).then(result => {
            if (result) {
              toast.info('Session terminé et sauvegardé !', {
                position: 'top-right',
                autoClose: 2000,
                hideProgressBar: true,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true
              })
            } else {
              console.error('Erreur lors de la sauvegarde de la session.')
            }
          }).catch(error => {
            console.error('Erreur inattendue:', error)
          })

        } else {
          if (lastId !== undefined) {
            const nextOpening = { id: lastId + 1, moves: [], score: 0 }
            updatedOpenings.push(nextOpening)
            handleNextOpening()
          }
        }
      }
    }

    setSessionData({
      ...sessionData,
      openings: updatedOpenings
    })
  }

  const handleResetOpening = () => {
    const sessionDataCopy: SessionData = {
      ...sessionData,
      maxMoves: sessionData?.maxMoves ?? 0,
      NumberOfOpening: sessionData?.NumberOfOpening ?? 0,
      startMove: sessionData?.startMove ?? '',
      secondes: sessionData?.secondes ?? 0,
      fen: sessionData?.fen ?? '',
      openingName: sessionData?.openingName ?? '',
      createdAt: sessionData?.createdAt ?? new Date().toISOString(),
      score: sessionData?.score ?? 0,
      openings: sessionData?.openings ?? []
    }

    if (!sessionDataCopy.openings || sessionDataCopy.openings.length === 0) {
      console.warn('Aucune ouverture disponible pour réinitialiser.')
      return
    }
    const lastOpeningIndex = sessionDataCopy.openings.length - 1
    const lastOpening = sessionDataCopy.openings[lastOpeningIndex]

    if (lastOpening.moves.length > 0) {
      lastOpening.moves.pop()
    } else {
      console.warn('Aucun mouvement à supprimer dans le dernier opening.')
    }

    setSessionData(sessionDataCopy)
    handleNextOpening()
  }

  const handleNextOpening = () => {
    setGame(new Chess(fen ?? 'start'))
    setCp(0)
    setHint(0)
    setOpeningName('')
    setNewFen(fen ?? 'start')
    setNewMoves(moves ?? [])
    setMoveHistory([])
    setSquareStyles({})
    setPieceSquare('')
    setHistory([])
    game.clear()
  }

  const [lastComputerMove, setLastComputerMove] = useState('')
  const isCalculatingMove = useRef(false)

  useEffect(() => {
    const isComputerTurn = (newMoves.length % 2 === 1 && color === 'white') || (newMoves.length % 2 === 0 && color === 'black')

    const makeComputerMove = async () => {
      if (isCalculatingMove.current) return // Si un coup est en cours, on ne relance pas
      isCalculatingMove.current = true      // Active le verrou

      try {
        const moveData = await computerPlay(newFen, color, newMoves)
        console.log('move data')
        console.log(moveData, color, newFen, newMoves)

        if (moveData && moveData.uci2 !== lastComputerMove) { // Utilise l'état `lastComputerMove`
          const move = game.move({
            from: moveData.uci2.slice(0, 2),
            to: moveData.uci2.slice(2, 4),
            promotion: 'q'
          })

          if (move) {
            setNewFen(game.fen())
            setOpeningName(moveData.name?.name)
            setHistory(game.history({ verbose: true }))
            setMoveHistory([
              ...moveHistory,
              {
                freq: moveData.freq,
                uci: moveData.uci2,
                cp: moveData.cp,
                total_games: moveData.total_games,
                name: moveData.name
              }
            ])
            setNewMoves([...newMoves, moveData.uci2])
            setCp(moveData.cp)
            setLastComputerMove(moveData.uci2) // Mettre à jour le dernier coup de l'ordinateur
          }
        }
      } catch (error) {
        console.error('Error in computer move:', error)
        if (isSessionActive) {
          handleSessionEndOpening('')
        } else {
          restartGame()
        }
      } finally {
        isCalculatingMove.current = false // Libère le verrou une fois le calcul terminé
      }
    }

    if (isComputerTurn && !isCalculatingMove.current) {
      void makeComputerMove()
    }
  }, [newMoves])

  const restartGame = () => {
    setTimeout(() => {
      setGame(new Chess(fen ?? 'start'))
      setCp(0)
      setHint(0)
      setOpeningName('')
      setNewFen(fen ?? 'start')
      setNewMoves(moves ?? [])
      setMoveHistory([])
      setSquareStyles({})
      setPieceSquare('')
      setHistory([])
    }, 1500)
    game.clear()

    toast.info('Restart opening', {
      position: 'top-center',
      autoClose: 1500,
      hideProgressBar: true,
      closeOnClick: true,
      pauseOnHover: false,
      draggable: true
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
      if (sourceSquare === targetSquare) return
      const response = await validateTopMove(color, newFen, `${sourceSquare}${targetSquare}`, newMoves)
      if (response.error === 'end_opening') {
        restartGame()
      }
      if (!response.valid) {
        if (isSessionActive) {
          handleSessionEndOpening(response.move)
        }
        setHint(hint + 1)
        if (hint + 1 >= 3 && !isSessionActive) {
          setSquareStyles({
            [response.move.slice(0, 2)]: { backgroundColor: 'blue' }
          })
          setHint(0)
        }
        return
      }
      const move = game.move({
        from: sourceSquare,
        to: targetSquare,
        promotion: 'q'
      })

      if (move === null) {
        console.log(`Invalid move from ${sourceSquare} to ${targetSquare}`)
        return false
      }
      setNewMoves([...newMoves, `${sourceSquare}${targetSquare}`])
      setNewFen(game.fen())
      setOpeningName(response.name?.name)
      setMoveHistory([...moveHistory, {
        uci: response.move,
        cp: response.cp,
        name: response.name?.name
      }])
      setHistory(game.history({ verbose: true }))
      setCp(response.cp)
      setHint(0)
      handleSessionCorrectMove(response.move)
      return true
    } catch (error) {
      console.error('Error processing move:', error)
      if (isSessionActive) {
        handleSessionEndOpening('')
      } else {
        restartGame()
      }
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

  return (
    <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'flex-start' }}>
      <div style={styles.containerMoves}>
        <MovesHistory moves={moveHistory}/>
      </div>
      <div style={styles.containerChessboard}>
        <h2 style={{ maxWidth: '700px' }}>{openingName ? openingName : 'Start'}</h2>
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
          {isSessionActive ? (
            <>
              <button style={styles.btn} onClick={handleNextOpening}>Next Opening</button>
              <button style={styles.btn} onClick={handleResetOpening}>Reset</button>
            </>

          ) : (
            <button style={styles.btn} onClick={restartGame}>Restart</button>
          )}
        </div>

      </div>

      <div style={styles.containerSession}>
        {isSessionActive ? (
          <Session setSessionData={setSessionData} moves={moveHistory} sessionData={sessionData}/>
        ) : (
          <SessionForm onStartSession={handleStartSession}/>
        )}
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
  },
  containerSession: {
    padding: '60px 10px'
  }
}

export default WithMoveValidation
