import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import Navbar from './components/navigation/Navbar'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
    <div className="h-vh">
      
      <Navbar />
    </div>
    </>
  )
}

export default App
