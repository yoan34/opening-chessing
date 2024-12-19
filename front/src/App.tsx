import TabNavigation from '@/components/TabNavigation'
import TopOpening from '@/pages/topOpening'
import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Openings from '@/pages/Openings'
import Play from '@/pages/Play'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

const App: React.FC = () => {
  return (
    <Router>
      <ToastContainer />
      <div>
        <TabNavigation />
        <Routes>
          <Route path="/" element={<Openings/>}/>
          <Route path="/play" element={<Play/>}/>
          <Route path="/top_opening_white" element={<TopOpening/>}/>
        </Routes>
      </div>
    </Router>
  )
}

export default App
