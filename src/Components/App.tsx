import '../App.css'
import Homepage from './Pages/Homepage'
import { Routes, Route } from 'react-router-dom';
import NewPart from './Pages/NewPart';
import Operations from './Pages/Operations';

function App() {

  return (
    <Routes>
      <Route path="/" element={<Homepage />} />
      <Route path="/newpart" element={<NewPart />} />
      <Route path="/operations" element={<Operations />} />
    </Routes>

  )
}

export default App
