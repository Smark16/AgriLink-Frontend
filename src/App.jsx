import './App.css'
import Show from './components/Routes/Show'
import { BrowserRouter as Router } from 'react-router-dom'
import { AuthProvider } from './components/Context/AuthContext'
function App() {
  return (
    <>
   <Router>
    <AuthProvider>
    <Show/>
    </AuthProvider>
   </Router>
    </>
  )
}

export default App
