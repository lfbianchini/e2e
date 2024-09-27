import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const JobHomePage = () => {
  const { uniqueId } = useParams();
  const navigate = useNavigate();
  const uploadInProgress = useRef(false);
  type JobData = {
    uniqueId: string;
    partNumber: string;
    description: string;
    rev: string;
    date: string;
    operations: Operation[];
};

  const jobData = useRef<JobData>({
    uniqueId: '',
    partNumber: '',
    description: '',
    rev: '',
    date: '',
    operations: []
  }); // Store the job data in a ref
  const [selectedOperation, setSelectedOperation] = useState('');

  interface ImageWithDescription {
    image: string;
    description: string;
  }

  interface Operation {
    id: number;
    dropdownValue: string;
    description: string;
    images: ImageWithDescription[]; // Each image now has a description field
  }

  const [operations, setOperations] = useState<Operation[]>([]);
  const [editMode, setEditMode] = useState(false);
  const [editedImage, setEditedImage] = useState<string | null>(null);

  useEffect(() => {
    // Fetch job details from the backend
    const fetchJobDetails = async () => {
      console.log('Fetching job details for:', uniqueId);
      const result = await window.electron.ipcRenderer.invoke('fetch-job-details', uniqueId);
      console.log('Result:', result);
      
      if (result.success) {
        jobData.current = result.jobData;
        setOperations(jobData.current.operations || []); // Assuming jobData contains an array of operations
        console.log('Job details fetched successfully:', jobData.current);
        console.log('Operations:', operations);
      } else {
        console.error(result.error);
      }
    };

    fetchJobDetails();
  }, [uniqueId]);

  useEffect(() => {
    // Update jobData whenever operations change
    jobData.current.operations = operations;
  }, [operations]);

  const handleOperationChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedOperation(event.target.value);
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (uploadInProgress.current) return; // Prevent further uploads if one is in progress
    uploadInProgress.current = true;
  
    const files = event.target.files;
    if (!files || !selectedOperation) return;
  
    const file = files[0];
    if (file) {
      console.log('Uploading image:', file.name);
      const reader = new FileReader();
      reader.onload = async (e) => {
        if (e.target && e.target.result) {
          const newImage = e.target.result as string;
  
          const isDuplicate = operations.some(op =>
            op.id.toString() === selectedOperation &&
            Array.isArray(op.images) &&
            op.images.some(img => img.image === newImage)
          );
  
          if (!isDuplicate) {
            // Update the operations state
            const updatedOperations = operations.map(op => {
              if (op.id.toString() === selectedOperation) {
                const updatedImages = [...(op.images || []), { image: newImage, description: '' }];
                return { ...op, images: updatedImages };
              }
              return op;
            });
  
            setOperations(updatedOperations);
  
            // Save the complete operations structure, use the updated operations
            const updatedJobData = {
              ...jobData.current,
              operations: updatedOperations // Preserve the rest of jobData
            };
            const result = await window.electron.ipcRenderer.invoke('save-operations', { uniqueId, jobData: updatedJobData });
            if (result.success) {
              console.log('Image saved successfully:', result.filePath);
            } else {
              console.error('Failed to save image:', result.error);
            }
          } else {
            console.warn('Duplicate image upload attempt detected.');
          }
        }
        uploadInProgress.current = false; // Reset the flag after processing
      };
  
      reader.readAsDataURL(file);
      event.target.value = ''; // Reset input value
    }
  };
  
  

  const handleEditImage = (image: string) => {
    setEditedImage(image);
    setEditMode(true);
  };

  const handleSaveEdit = () => {
    setEditMode(false);
    setEditedImage(null);
  };

  const handleDescriptionChange = async (index: number, description: string) => {
    // Update the description of an image in the selected operation
    const updatedOperations = operations.map(op => {
      if (op.id.toString() === selectedOperation) {
        const updatedImages = [...op.images];
        updatedImages[index].description = description;
        return { ...op, images: updatedImages };
      }
      return op;
    });

    setOperations(updatedOperations);
    const result = await window.electron.ipcRenderer.invoke('save-operations', { uniqueId, jobData: updatedOperations });
    if (result.success) {
      console.log('Operations saved successfully:', result.filePath);
    } else {
      console.error('Failed to save operations:', result.error);
    }
  };

  const handleHomeClick = () => {
    navigate('/'); // Replace with your home route
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
      <h1 style={{ fontSize: '24px', marginBottom: '20px' }}>Part: {jobData.current.partNumber}</h1>

      <div style={{ marginBottom: '20px', border: '1px solid #ccc', padding: '15px', borderRadius: '4px' }}>
        <h2 style={{ fontSize: '18px', marginBottom: '10px' }}>Select Operation</h2>
        <select 
          value={selectedOperation} 
          onChange={handleOperationChange}
          style={{ width: '100%', padding: '8px', fontSize: '16px' }}
        >
          <option value="">Select an operation</option>
          {operations.map((op) => (
            <option key={op.id} value={op.id.toString()}>{op.dropdownValue}</option>
          ))}
        </select>
      </div>

      {selectedOperation && (
        <div style={{ marginBottom: '20px', border: '1px solid #ccc', padding: '15px', borderRadius: '4px' }}>
          <h2 style={{ fontSize: '18px', marginBottom: '10px' }}>Images for Operation: {selectedOperation}</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
            {operations.find(op => op.id.toString() === selectedOperation)?.images?.map((imgWithDesc, index) => (
              <div key={index} style={{ position: 'relative' }}>
                <img src={imgWithDesc.image || ''} alt={`Operation ${selectedOperation} - Image ${index + 1}`} style={{ width: '100%', height: 'auto' }} />
                <button 
                  onClick={() => handleEditImage(imgWithDesc.image)} 
                  style={{ position: 'absolute', top: '5px', right: '5px', padding: '5px 10px' }}
                >
                  Edit
                </button>
                <input
                  type="text"
                  placeholder="Add description"
                  value={imgWithDesc.description}
                  onChange={(e) => handleDescriptionChange(index, e.target.value)}
                  style={{ marginTop: '10px', width: '100%', padding: '5px' }}
                />
              </div>
            )) || <p>No images available for this operation.</p>}
          </div>
          <input type="file" onChange={handleImageUpload} style={{ marginTop: '10px' }} />
        </div>
      )}

      {editMode && (
        <div style={{ marginTop: '20px', border: '1px solid #ccc', padding: '15px', borderRadius: '4px' }}>
          <h2 style={{ fontSize: '18px', marginBottom: '10px' }}>Edit Image</h2>
          <img src={editedImage || ''} alt="Editing" style={{ width: '100%', height: 'auto', marginBottom: '10px' }} />
          <button onClick={handleSaveEdit} style={{ padding: '5px 10px' }}>
            Save Changes
          </button>
        </div>
      )}

      <button 
        onClick={handleHomeClick} 
        className="home-button" // Add the class name
      >
        Home
      </button>
    </div>

    
  );
};

export default JobHomePage;
