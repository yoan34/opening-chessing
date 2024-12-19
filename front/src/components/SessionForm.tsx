import React, { CSSProperties, useState } from 'react'

type OpeningFormProps = {
  onStartSession: (openingLength: number, stopAfterMoves: number) => void;
};

function SessionForm ({ onStartSession }: OpeningFormProps) {
  const [openingLength, setOpeningLength] = useState(10)
  const [stopAfterMoves, setStopAfterMoves] = useState(3)

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    onStartSession(openingLength, stopAfterMoves)
  }

  return (
    <form onSubmit={handleSubmit} style={styles.form}>
      <label>
        Nombre d'ouverture de la session:
        <select
          value={openingLength}
          onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setOpeningLength(Number(e.target.value))}
        >
          <option value={5}>5</option>
          <option value={10}>10</option>
          <option value={20}>20</option>
          <option value={30}>30</option>
        </select>
      </label>
      <label>
        Nombre de coups pour arrêter l'ouverture :
        <select
          value={stopAfterMoves}
          onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setStopAfterMoves(Number(e.target.value))}
        >
          <option value={2}>2</option>
          <option value={3}>3</option>
          <option value={4}>4</option>
          <option value={5}>5</option>
          <option value={6}>6</option>
          <option value={7}>7</option>
          <option value={8}>8</option>
          <option value={9}>9</option>
          <option value={10}>10</option>
        </select>
      </label>
      <button style={styles.btn} type="submit">Start Session</button>
    </form>
  )
}

const styles: { [key: string]: CSSProperties } = {
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px'
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
}

export default SessionForm
