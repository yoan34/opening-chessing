import React, { CSSProperties, useState } from 'react'

type SessionMove = {
  uci: string
  score: number
}
type OpeningData = {
  id: number
  score: number
  moves: SessionMove[]
}

type SessionData = {
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

type MoveHistoryProps = {
  freq?: number
  uci: string
  cp: number
  total_games?: number
  name?: { name: string }
}
type MovesHistoryProps = {
  moves: MoveHistoryProps[];
  sessionData: SessionData | null;
  setSessionData: React.Dispatch<React.SetStateAction<SessionData | null>>;
}

function Session ({ moves, setSessionData, sessionData }: MovesHistoryProps) {

  return (
    <div style={styles.container}>
      <h3>Session de {sessionData?.NumberOfOpening} ouvertures de {sessionData?.maxMoves} coups max</h3>
      {sessionData?.openings.map((opening, index) => {
        return (
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <div>({index+1})</div>
            <div style={styles.containerOpening}>
              {opening.moves.map((move, index) => {
                return (
                  <div style={move.score ? styles.move : styles.badMove}>{move.score}</div>
                )
              })}
            </div>
          </div>

        )
      })}
    </div>
  )
}

const styles: { [key: string]: CSSProperties } = {
  container: {
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    gap: '5px'
  },
  move: {
    padding: '4px',
    backgroundColor: 'green',
    width: '24px',
    height: '14px',
    fontSize: '12px',
    textAlign: 'center',
    borderRadius: '10px',
    color: 'white'
  },
  badMove: {
    padding: '4px',
    backgroundColor: 'red',
    width: '24px',
    height: '14px',
    fontSize: '12px',
    textAlign: 'center',
    borderRadius: '10px',
    color: 'white'
  },
  containerOpening: {
    display: 'flex',
    flexDirection: 'row',
    gap: '5px'
  }
}

export default Session
