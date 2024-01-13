import React, { useState, useEffect } from 'react';
import './TagSelection.css';

function TagSelection() {
  const [tags, setTags] = useState([]);
  const [selectedTag, setSelectedTag] = useState('');

  const handleTagChange = (event) => {
    setSelectedTag(event.target.value);
  };

  const handleDownload = () => {
    fetch('http://localhost:4000/download') // Adjust this URL to match your server's configuration
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.blob();
        })
        .then(blob => {
            // Create a link element, use it to download the ZIP file, and then remove it
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'photos.zip';
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(url);
        })
        .catch(error => {
            console.error('Error downloading photos:', error);
        });
};

  return (
    <div className="tag-selection-container">
      <h1>Select Tags</h1>
      <div className="radio-buttons-container">
        {tags.map(tag => (
          <label key={tag}>
            <input 
              type="radio" 
              value={tag} 
              checked={selectedTag === tag} 
              onChange={handleTagChange} 
            />
            {tag}
          </label>
        ))}
      </div>
      <button onClick={handleDownload} className="download-button">
        Download Photos
      </button>
    </div>
  );
}

export default TagSelection;
