import { SessionData } from '@/pages/Play'

export const validateTopMove = async (color: string, fen: string, play: string, moves: string[]) => {
  try {
    const response = await fetch('http://localhost:8000/valide_top_move', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        play,
        color,
        fen,
        moves
      })
    })

    if (!response.ok) {
      console.log(`Invalid move from ${play}`)
      return false
    }

    const data = await response.json()
    console.log(data)
    return data
  } catch (error) {
    console.error('Error validating move:', error)
    return false
  }
}

export const computerPlay = async (fen: string, color: string, moves: string[]) => {
  try {
    const response = await fetch('http://localhost:8000/computer_play', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        moves,
        color,
        fen
      })
    })

    if (!response.ok) {
      console.log(`Invalid move from ${moves}`)
      return false
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.error('Error validating move:', error)
    return false
  }
}

export const topOpeningWhite = async () => {
  try {
    const response = await fetch('http://localhost:8000/top_opening_white', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    })

    if (!response.ok) {
      console.log('error')
      return false
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.error('Error validating move:', error)
    return false
  }
}


export const saveSession = async (sessionData: SessionData) => {
  console.log('sessionData')
  console.log(sessionData)
  try {
    const response = await fetch('http://localhost:8000/save_session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(sessionData) // Sérialisation des données de session
    })

    if (!response.ok) {
      console.error(`Failed to save session: ${response.statusText}`)
      return false
    }

    const data = await response.json()
    console.log('Session saved successfully:', data)
    return data // Retourner la réponse si nécessaire
  } catch (error) {
    console.error('Error saving session:', error)
    return false
  }
}
