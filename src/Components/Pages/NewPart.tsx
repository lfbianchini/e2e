import { useLocation, useNavigate } from 'react-router-dom';
import './NewPart.css'
import { useEffect, useState } from 'react';

function NewPart() {
    const navigate = useNavigate();
    const location = useLocation();
    const [partNumber, setPartNumber] = useState('')
    const [description, setDescription] = useState('')
    const [rev, setRev] = useState('')
    const handleSubmit = () => {
        navigate('/operations', { state: { partNumber, description, rev } });
    }

    useEffect(() => {
        if (location.state) {
            setPartNumber(location.state.partNumber || '');
            setDescription(location.state.description || '');
            setRev(location.state.rev || '');
        }
    }, [location]);

    
    
    return (
        <div className="card">
            <h1 className="head">New Part Number</h1>
            <input type="text" placeholder="Part Number" value={partNumber ? partNumber:''} onChange={event => setPartNumber(event.target.value)}/>
            <input type="text" placeholder="Description" value={description ? description:''} onChange={event => setDescription(event.target.value)}/>
            <input type="text" placeholder="Rev" value={rev ? rev:''} onChange={event => setRev(event.target.value)}/>
            <div className="button-container">
                <button className="home-button" onClick={() => navigate('/')}>
                    Back
                </button>
                <button className="home-button" onClick={handleSubmit}>
                    Submit
                </button>
            </div>
        </div>
    )
}

export default NewPart