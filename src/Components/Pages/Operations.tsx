import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

interface Operation {
    id: number;
    dropdownValue: string;
    description: string;
}

function Operations() {
    const navigate = useNavigate();
    const location = useLocation();
    const { partNumber, description, rev } = location.state || {};

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

    return (
        <div>
            <h1>Operations</h1>

            <p>Part Number: {partNumber}</p>

            <button className="home-button" onClick={addOperation}>Add Operation</button>

            {operations.map(op => (
                <div key={op.id}>
                    <h3>Op {op.id}</h3>
                    <select
                        value={op.dropdownValue}
                        onChange={(e) => handleOperationChange(op.id, 'dropdownValue', e.target.value)}
                    >
                        <option value="">Select an option</option>
                        <option value="option1">3 Axis Mill</option>
                        <option value="option2">5 Axis Mill</option>
                        <option value="option3">CNC Lathe</option>
                        <option value="option1">Wire EDM</option>
                        <option value="option2">EDM Drill</option>
                        <option value="option3">Mill/Turn</option>
                        <option value="option1">Grinding</option>
                        <option value="option2">Deburr/Finish</option>
                        <option value="option3">Assembly</option>
                    </select>
                    <input
                        type="text"
                        placeholder="Description"
                        value={op.description}
                        onChange={(e) => handleOperationChange(op.id, 'description', e.target.value)}
                    />
                </div>
            ))}

            <button className="home-button" onClick={handleBack}>Back</button>
        </div>
    );
}

export default Operations;
