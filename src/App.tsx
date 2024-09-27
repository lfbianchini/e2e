import './App.css';
import Homepage from './Components/Pages/Homepage';
import { Routes, Route } from 'react-router-dom';
import NewPart from './Components/Pages/NewPart';
import Operations from './Components/Pages/Operations';
import JobHomePage from './Components/Pages/JobHomePage';
import SearchPage from './Components/Pages/SearchPage';
import { HashRouter as Router } from 'react-router-dom';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="" element={<Homepage />} />
        <Route path="/newpart" element={<NewPart />} />
        <Route path="/operations" element={<Operations />} />
        <Route path="/operations/:uniqueId" element={<JobHomePage />} />
        <Route path="/search" element={<SearchPage />} />
      </Routes>
    </Router>
  );
}

export default App;
