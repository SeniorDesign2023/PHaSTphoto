import React, { useState, useEffect } from 'react';
import './TagSelection.css';

function TagSelection() {
  const [tags, setTags] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]); // Use an array to store selected tags

  const fetchTags = async () => {
    try {
      const response = await fetch('http://localhost:4000/getTags'); // Replace with your API endpoint
      if (response.ok) {
        const data = await response.json();
        // Assuming data.tags is an object
        setTags(data.tags);
      } else {
        console.error('Error fetching tags:', response.statusText);
      }
    } catch (error) {
      console.error('Error fetching tags:', error);
    }
  };

  useEffect(() => {
    console.log(tags);
  }, [tags]);

  useEffect(() => {
    fetchTags();
  }, []);

  const handleTagChange = (event) => {
    const tag = event.target.value;

    // Toggle the selected tag in the array
    setSelectedTags((prevSelectedTags) => {
      if (prevSelectedTags.includes(tag)) {
        return prevSelectedTags.filter((selectedTag) => selectedTag !== tag);
      } else {
        return [...prevSelectedTags, tag];
      }
    });
  };

  const handleDownload = () => {
    // Add logic here to handle the download based on the selectedTags
    // You can make another API call to the backend to initiate the download
  };

  return (
    <div className="tag-selection-container">
      <h1>Select Tags</h1>
      <div className="checkboxes-container">
        {tags.map(([key, value]) => (
          <div key={`${key}:${value}`} className="checkbox-label">
            <input
              type="checkbox"
              id={`${key}:${value}`}
              value={`${key}:${value}`}
              checked={selectedTags.includes(`${key}:${value}`)}
              onChange={handleTagChange}
            />
            {key} : {value}
          </div>
        ))}
      </div>
      <button onClick={handleDownload} className="download-button">
        Download Photos
      </button>
    </div>
  );  
}

export default TagSelection;
