import { useNavigate } from 'react-router-dom';
import '/src/App.css'

function Homepage() {
  const navigate = useNavigate();
    return (
        <>
          <div className="card">
            <h1>Welcome.</h1>
            <button className="home-button" onClick={() => navigate('newpart')}>
              New Part Number
            </button>
            <button className="home-button">
              Existing Part Number
            </button>
          </div>
        </>
      )
}

export default Homepage