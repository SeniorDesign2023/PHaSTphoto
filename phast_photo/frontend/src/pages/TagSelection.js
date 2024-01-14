import React, { useState, useEffect } from 'react';
import './TagSelection.css';

function TagSelection() {
  const [tags, setTags] = useState([]);
  const [selectedTag, setSelectedTag] = useState('');

  const fetchTags = async () => {
    try {
      const response = await fetch('http://localhost:4000/getTags'); // Replace with your API endpoint
      if (response.ok) {
        const data = await response.json();
        // Assuming data.tags is an array of strings
        setTags(data.tags);
      } else {
        console.error('Error fetching tags:', response.statusText);
      }
    } catch (error) {
      console.error('Error fetching tags:', error);
    }
  };

  useEffect(() => {
    fetchTags();
  }, []);

  const handleTagChange = (event) => {
    setSelectedTag(event.target.value);
  };

  const handleDownload = () => {
    // Add logic here to handle the download based on the selectedTag
    // You can make another API call to the backend to initiate the download
  };

  return (
    <div className="tag-selection-container">
      <h1>Select Tags</h1>
      <div className="radio-buttons-container">
        {tags.map(tag => (
          <label key={tag} className="radio-label">
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
