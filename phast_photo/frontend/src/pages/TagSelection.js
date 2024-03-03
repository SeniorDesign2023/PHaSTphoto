import React, { useState, useEffect } from 'react';
import './TagSelection.css';

function TagSelection() {
  const [tags, setTags] = useState({});
  const [selectedTags, setSelectedTags] = useState([]);

  const fetchTags = async () => {
    try {
      const response = await fetch('http://localhost:4000/getTags');
      if (response.ok) {
        const data = await response.json();
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
    const tag = event.target.value;

    setSelectedTags((prevSelectedTags) => {
      if (prevSelectedTags.includes(tag)) {
        return prevSelectedTags.filter((selectedTag) => selectedTag !== tag);
      } else {
        return [...prevSelectedTags, tag];
      }
    });
  };

  const handleDownload = async () => {
    if (selectedTags.length === 0) {
      alert("Please select at least one tag before downloading.");
      return;
    }

    try {
      const response = await fetch('http://localhost:4000/downloadPhotos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ selectedTags }),
      });

      if (response.ok) {
        response.blob().then(blob => {
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = "selected_photos.zip";
          document.body.appendChild(a); 
          a.click();
          a.remove(); 
          window.URL.revokeObjectURL(url);
        });
      } else {
        console.error('Error initiating download:', response.statusText);
      }
    } catch (error) {
      console.error('Error initiating download:', error);
    }
  };


 return (
    <div className="tag-selection-container">
      <h1>Select Tags</h1>
      <div className="tag-groups-container">
        {Object.entries(tags).map(([key, values]) => (
          <div key={key} className="tag-group">
            <h2>{key}</h2>
            <div className="checkboxes-container">
              {values.map(value => (
                <div key={`${key}:${value}`} className="checkbox-label">
                  <input
                    type="checkbox"
                    id={`${key}:${value}`}
                    value={`${key}:${value}`}
                    checked={selectedTags.includes(`${key}:${value}`)}
                    onChange={handleTagChange}
                  />
                  <label htmlFor={`${key}:${value}`}>{value}</label>
                </div>
              ))}
            </div>
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