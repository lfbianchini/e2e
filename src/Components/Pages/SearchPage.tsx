import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './SearchPage.css';

const SearchPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [count, setCount] = useState(0);
  const [files, setFiles] = useState<File[]>([]);

  interface File {
    id: string;
    uniqueId: string;
    name: string;
    partNumber: string;
    rev: string;
    numberOfOperations: number;
    timestamp: number;
  }

  // Fetch files in /parts on component mount
  useEffect(() => {
    const fetchFiles = async () => {
      try {
        const result = await window.electron.ipcRenderer.invoke('fetch-job-details-for-search', '');

        if (result.success) {
          const parsedFiles = result.jobData.map((file: any) => parseFile(file));
          setFiles(parsedFiles);
        } else {
          console.error('Error fetching files:', result.error);
        }
      } catch (err) {
        console.error('Fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchFiles();
  }, []);

  // Function to parse each file
  const parseFile = (file: any) => {
    const parsedFile = {
      id: count.toString(), // Convert count to string for the id
      uniqueId: file.uniqueId,
      name: file.name,
      partNumber: file.partNumber || 'N/A',
      rev: file.rev || 'N/A',
      numberOfOperations: file.operations ? file.operations.length : 0, // Adjust to count operations
      timestamp: file.timestamp || Date.now(),
    };
    setCount((prevCount) => prevCount + 1); // Use a function to set the new count
    return parsedFile; // Return the parsed file
  };

  // Handle row click to navigate to operations page
  const handleRowClick = (uniqueId: string) => {
    navigate(`/operations/${uniqueId}`);
  };

  // Navigate to home page
  const handleHomeClick = () => {
    navigate('/'); // Replace with your home route
  };

  if (loading) {
    return <div>Loading...</div>; // Show a loading indicator
  }

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
      <h1 style={{ fontSize: '24px', marginBottom: '20px' }}>Search Files</h1>

      <table style={{ width: '100%', borderCollapse: 'collapse', backgroundColor:'#1a1a1a' }}>
        <thead>
          <tr style={{ backgroundColor: '#1a1a1a', color: '#fff' }}>
            <th style={{ padding: '10px', border: '1px solid #1a1a1a' }}>Part Number</th>
            <th style={{ padding: '10px', border: '1px solid #1a1a1a' }}>Revision</th>
            <th style={{ padding: '10px', border: '1px solid #1a1a1a' }}>Number of Operations</th>
            <th style={{ padding: '10px', border: '1px solid #1a1a1a' }}>Creation Timestamp</th>
          </tr>
        </thead>
        <tbody>
          {files.map((file, index) => (
            <tr
              key={file.id}
              onClick={() => handleRowClick(file.uniqueId)} // Navigate on click
              style={{
                borderBottom: '1px solid #ccc',
                cursor: 'pointer',
                backgroundColor: index % 2 === 0 ? '#33333' : '#222222', // Alternating row colors
                transition: 'background-color 0.3s ease', // Smooth transition for hover effect
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#1a1a1a')} // Darker on hover
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = index % 2 === 0 ? '#333333' : '#222222')} // Revert on leave
            >
              <td style={{ padding: '10px' }}>{file.partNumber}</td>
              <td style={{ padding: '10px' }}>{file.rev}</td>
              <td style={{ padding: '10px' }}>{file.numberOfOperations}</td>
              <td style={{ padding: '10px' }}>{new Date(file.timestamp).toLocaleString()}</td> {/* Format timestamp */}
            </tr>
          ))}
        </tbody>
      </table>

      <button 
        onClick={handleHomeClick} 
        className="home-button" // Add the class name
      >
        Home
      </button>
    </div>
  );
};

export default SearchPage;
