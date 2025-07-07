import { useState } from 'react';
import './App.css';

function App() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [width, setWidth] = useState('');
  const [height, setHeight] = useState('');
  const [resizedImageUrl, setResizedImageUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
    setResizedImageUrl(null); // Reset image on new file selection
    setError(null);
  };

  const handleResize = async () => {
    if (!selectedFile) {
      setError('Please select an image first.');
      return;
    }
    if (!width || !height) {
      setError('Please enter both width and height.');
      return;
    }

    setLoading(true);
    setError(null);
    setResizedImageUrl(null);

    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('width', width);
    formData.append('height', height);

    try {
      const response = await fetch('http://localhost:3000/image/resize', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      setResizedImageUrl(url);
    } catch (e) {
      console.error('Error during image resize:', e);
      setError(`Failed to resize image: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (resizedImageUrl) {
      const link = document.createElement('a');
      link.href = resizedImageUrl;
      link.download = `resized_image_${width}x${height}.${selectedFile.name.split('.').pop()}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className="App">
      <h1>Image Resizer</h1>
      <div className="input-section">
        <input type="file" accept="image/jpeg, image/png" onChange={handleFileChange} />
        <input
          type="number"
          placeholder="Width"
          value={width}
          onChange={(e) => setWidth(e.target.value)}
        />
        <input
          type="number"
          placeholder="Height"
          value={height}
          onChange={(e) => setHeight(e.target.value)}
        />
        <button onClick={handleResize} disabled={loading}>
          {loading ? 'Resizing...' : 'Resize Image'}
        </button>
      </div>

      {error && <p className="error-message">{error}</p>}

      {resizedImageUrl && (
        <div className="result-section">
          <h2>Resized Image:</h2>
          <img src={resizedImageUrl} alt="Resized" />
          <button onClick={handleDownload}>Download Image</button>
        </div>
      )}
    </div>
  );
}

export default App;