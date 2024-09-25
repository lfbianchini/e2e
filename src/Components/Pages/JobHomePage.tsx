import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

// Mock data - replace with actual data fetching logic
const mockOperations = [
  { id: 1, name: '3 Axis Mill', description: 'Milling operation' },
  { id: 2, name: 'CNC Lathe', description: 'Lathe operation' },
];

const JobHomePage = () => {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const [selectedOperation, setSelectedOperation] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [editMode, setEditMode] = useState(false);
  const [editedImage, setEditedImage] = useState<string | null>(null);

  useEffect(() => {
    // Fetch job details and images
    // This is where you'd normally fetch data from your backend
  }, [jobId]);

  const handleOperationChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedOperation(event.target.value);
    // Fetch images for the selected operation
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;
    const file = files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target && e.target.result) {
          setImages([...images, e.target.result as string]);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleEditImage = (image: string) => {
    setEditedImage(image);
    setEditMode(true);
  };

  const handleSaveEdit = () => {
    // Save the edited image
    setEditMode(false);
    setEditedImage(null);
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
      <h1 style={{ fontSize: '24px', marginBottom: '20px' }}>Job: {jobId}</h1>
      
      <div style={{ marginBottom: '20px', border: '1px solid #ccc', padding: '15px', borderRadius: '4px' }}>
        <h2 style={{ fontSize: '18px', marginBottom: '10px' }}>Select Operation</h2>
        <select 
          value={selectedOperation} 
          onChange={handleOperationChange}
          style={{ width: '100%', padding: '8px', fontSize: '16px' }}
        >
          <option value="">Select an operation</option>
          {mockOperations.map((op) => (
            <option key={op.id} value={op.id.toString()}>{op.name}</option>
          ))}
        </select>
      </div>

      {selectedOperation && (
        <div style={{ marginBottom: '20px', border: '1px solid #ccc', padding: '15px', borderRadius: '4px' }}>
          <h2 style={{ fontSize: '18px', marginBottom: '10px' }}>Images for Operation: {selectedOperation}</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
            {images.map((image, index) => (
              <div key={index} style={{ position: 'relative' }}>
                <img src={image} alt={`Operation ${selectedOperation} - Image ${index + 1}`} style={{ width: '100%', height: 'auto' }} />
                <button 
                  onClick={() => handleEditImage(image)} 
                  style={{ position: 'absolute', top: '5px', right: '5px', padding: '5px 10px' }}
                >
                  Edit
                </button>
              </div>
            ))}
          </div>
          <input type="file" onChange={handleImageUpload} style={{ marginTop: '10px' }} />
        </div>
      )}

      {editMode && (
        <div style={{ marginTop: '20px', border: '1px solid #ccc', padding: '15px', borderRadius: '4px' }}>
          <h2 style={{ fontSize: '18px', marginBottom: '10px' }}>Edit Image</h2>
          <img src={editedImage || ''} alt="Editing" style={{ width: '100%', height: 'auto', marginBottom: '10px' }} />
          {/* Add drawing/text editing tools here */}
          <button onClick={handleSaveEdit} style={{ padding: '5px 10px' }}>
            Save Changes
          </button>
        </div>
      )}
    </div>
  );
};

export default JobHomePage;