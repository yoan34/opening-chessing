import { computerPlay, topOpeningWhite } from '@/api'
import React, { CSSProperties, useEffect, useState } from 'react'
import { Chessboard } from 'react-chessboard'
import { Chess, Move } from 'chess.js'

type MoveOpening = {
  freq: number;
  uci: string;
};

type Opening = {
  count: number;
  cp: number;
  fen: string;
  moves: MoveOpening[];
  name: {
    eco: string;
    name: string;
  };
  plays: string;
  text: string;
  total_game_move: number;
};
const Openings = () => {
  const [openings, setOpenigns] = useState([])
  const [startIndex, setStartIndex] = useState(0); // Index de départ pour l'affichage
  const BLOCK_SIZE = 4
  useEffect(() => {
    const getOpeningWhite = async () => {
      try {
        const data = await topOpeningWhite()
        setOpenigns(data)
      } catch (error) {
        console.error('Error in computer move:', error)
      }
    }
    void getOpeningWhite()
  }, [])

  const correctSpecialMoves = (move: string): string => {
    if (move === 'e8h8') return 'e8g8'; // Petit roque noir
    if (move === 'e8a8') return 'e8c8'; // Grand roque noir
    if (move === 'e1h1') return 'e1g1'; // Petit roque blanc
    if (move === 'e1a1') return 'e1c1'; // Grand roque blanc
    return move; // Sinon, retourne le mouvement tel quel
  };

  const generateChessboards = (plays: string, sentence: string) => {
    const moves = plays.split(',');
    const text = sentence.split(' ');

    const chess = new Chess();
    const boards: { fen: string; moves: string[]; texts: string[] }[] = [];

    for (let i = 0; i < moves.length; i += 2) {
      const currentMoves: string[] = [];
      const currentTexts: string[] = [];

      // Ajoute les deux coups suivants au plateau
      if (moves[i]) {
        const correctedMove = correctSpecialMoves(moves[i]);
        const moveResult = chess.move(correctedMove); // Tentative de mouvement
        if (moveResult) {
          currentMoves.push(correctedMove);
          currentTexts.push(text[i]);
        } else {
          console.error(`Invalid move: ${correctedMove}`);
        }
      }

      if (moves[i + 1]) {
        const correctedMove = correctSpecialMoves(moves[i + 1]);
        const moveResult = chess.move(correctedMove); // Tentative de mouvement
        if (moveResult) {
          currentMoves.push(correctedMove);
          currentTexts.push(text[i + 1]);
        } else {
          console.error(`Invalid move: ${correctedMove}`);
        }
      }

      // Sauvegarde la position FEN et les coups joués
      boards.push({ fen: chess.fen(), moves: currentMoves, texts: currentTexts });
    }

    return boards;
  };
  const handleLoadMore = () => {
    setStartIndex((prevIndex) => prevIndex + BLOCK_SIZE); // Passe au prochain bloc
  };
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {openings.slice(startIndex, startIndex + BLOCK_SIZE).map((opening: Opening, index) => {
        const positions = generateChessboards(opening.plays, opening.text);

        return (
          <div style={styles.container} key={`${opening.plays}-${index}`}>
            <h4 style={{ margin: '0' }}>{opening.name.name} (count={opening.count}) (CP={opening.cp})</h4>
            <div style={styles.columns}>
              {positions.map((item, posIndex) => (
                <div key={posIndex}>
                  <Chessboard
                    position={item.fen}
                    boardWidth={160}
                    boardOrientation="white"
                  />
                  <div style={{ color: '#25197d', fontWeight: 'bold' }}>{item.texts.join(' ')}</div>
                  <div>{item.moves.join(' ')}</div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
      {startIndex + BLOCK_SIZE < openings.length && (
        <button
          style={styles.button}
          onClick={handleLoadMore}
        >
          Charger les {BLOCK_SIZE} prochains
        </button>
      )}
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
    gap: '10px',
    justifyContent: 'flex-start',
  },
  column: {
    flex: 1,
    maxWidth: '400px'
  }
}

export default Openings
