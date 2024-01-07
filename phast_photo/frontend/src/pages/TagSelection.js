import React, { useState, useEffect } from 'react';
import './TagSelection.css';


function TagSelection() {
  const [tags, setTags] = useState([]);
  const [selectedTag, setSelectedTag] = useState('');

  useEffect(() => {
    // Fetch tags from the backend
    // For example:
    // fetch('/api/tags')
    //   .then(response => response.json())
    //   .then(data => setTags(data));
  }, []);

  const handleTagChange = (event) => {
    setSelectedTag(event.target.value);
  };

  const handleDownload = () => {
    // Implement download logic based on selectedTag
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