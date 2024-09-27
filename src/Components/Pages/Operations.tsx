import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import './Operations.css';

type Operation = {
    id: number;
    dropdownValue: string;
    description: string;
};

type OperationsData = {
    uniqueId: string;
    partNumber: string;
    description: string;
    rev: string;
    date: string;
    operations: Operation[];
};

export default function Operations() {
    const navigate = useNavigate();
    const location = useLocation();
    const { partNumber, description, rev, date } = location.state || {};

    const [operations, setOperations] = useState<Operation[]>([]);

    const addOperation = () => {
        const newOperation: Operation = {
            id: operations.length + 1, 
            dropdownValue: '',
            description: ''
        };
        setOperations([...operations, newOperation]);
    };

    const handleOperationChange = (id: number, field: keyof Operation, value: string) => {
        setOperations(operations.map(op => op.id === id ? { ...op, [field]: value } : op));
    };

    const handleBack = () => {
        navigate('/newpart', { state: { partNumber, description, rev } });
    };

    const handleSubmit = async () => {
        try {
            const uniqueId = uuidv4();
            const dataToSave: OperationsData = {
                uniqueId,
                partNumber,
                description,
                rev,
                date,
                operations
            };
    
            // Wrap both uniqueId and data in an object
            const result = await window.electron.ipcRenderer.invoke('save-operations', { uniqueId, jobData: dataToSave });
            if (result.success) {
                console.log('Operations saved successfully to:', result.filePath);
                navigate(`/operations/${uniqueId}`);
            } else {
                console.error('Failed to save operations:', result.error);
            }
        } catch (error) {
            console.error('Error saving operations:', error);
        }
    };
    

    return (
        <div className="operations-container">
            <div className="operations-sidebar">
                <h1>Operations</h1>
                <p>Part Number: {partNumber}</p>
                <div className="sidebar-buttons">
                    <button className="home-button" onClick={handleBack}>Back</button>
                    <button className="home-button submit-button" onClick={handleSubmit}>Submit</button>
                </div>
            </div>
            <div className="operations-content">
                <div className="operations-box">
                    <button className="home-button" onClick={addOperation}>Add Operation</button>
                    {operations.map(op => (
                        <div key={op.id} className="operation-item">
                            <h3>Op {op.id}</h3>
                            <select
                                value={op.dropdownValue}
                                onChange={(e) => handleOperationChange(op.id, 'dropdownValue', e.target.value)}
                            >
                                <option value="">Select an option</option>
                                <option value="3 Axis Mill">3 Axis Mill</option>
                                <option value="5 Axis Mill">5 Axis Mill</option>
                                <option value="CNC Lathe">CNC Lathe</option>
                                <option value="Wire EDM">Wire EDM</option>
                                <option value="EDM Drill">EDM Drill</option>
                                <option value="Mill/Turn">Mill/Turn</option>
                                <option value="Grinding">Grinding</option>
                                <option value="Deburr/Finish">Deburr/Finish</option>
                                <option value="Assembly">Assembly</option>
                            </select>
                            <input
                                type="text"
                                placeholder="Description"
                                value={op.description}
                                onChange={(e) => handleOperationChange(op.id, 'description', e.target.value)}
                            />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
