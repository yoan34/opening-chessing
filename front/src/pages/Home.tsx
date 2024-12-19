import React from 'react'
import { Link } from 'react-router-dom'

const Home: React.FC = () => {
  return (
    <div>
      <h1>Accueil</h1>
      <p>Bienvenue sur l'application d'ouvertures d'échecs.</p>
      <nav>
        <Link to="/play">Play</Link> | <Link to="/openings">Openings</Link>
      </nav>
    </div>
  )
}

export default Home
