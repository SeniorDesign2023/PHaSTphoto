import React, { useState, useEffect } from 'react';
import './TagSelection.css';

function TagSelection() {
  const [tags, setTags] = useState({});
  const [selectedTags, setSelectedTags] = useState([]);
  const [photoPaths, setPhotoPaths] = useState([]);

  const fetchTags = async () => {
    try {
      const response = await fetch('http://localhost:4000/getTags');
      if (response.ok) {
        const data = await response.json();
        
        // Process the data to split GptGeneratedTags into individual tags and remove duplicates
        const processedTags = { ...data.tags };
        if (processedTags.GptGeneratedTags && processedTags.GptGeneratedTags.length) {
          // Create a set to remove duplicates, then convert it back to an array
          processedTags.GptGeneratedTags = [...new Set(processedTags.GptGeneratedTags.flat().flatMap(tag => tag.split(',')))];
        }
  
        setTags(processedTags);
      } else {
        console.error('Error fetching tags:', response.statusText);
      }
    } catch (error) {
      console.error('Error fetching tags:', error);
    }
  };

  useEffect(() => {
    fetchTags();
    fetchPhotos();
  }, []);

  const handleTagChange = (event) => {
    const tag = event.target.value;
    const isChecked = event.target.checked;
  
    if (isChecked) {
      // Add the tag to the selectedTags array if it's checked
      setSelectedTags(prevSelectedTags => [...prevSelectedTags, tag]);
    } else {
      // Remove the tag from the selectedTags array if it's unchecked
      setSelectedTags(prevSelectedTags => prevSelectedTags.filter(t => t !== tag));
    }
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

  const fetchPhotos = async () => {
    try {
      const response = await fetch('http://localhost:4000/listPhotoPaths');
      if (response.ok) {
        const data = await response.json();
        setPhotoPaths(data.photoData);
      } else {
        console.error('Error fetching photos:', response.statusText);
      }
    } catch (error) {
      console.error('Error fetching photos:', error);
    }
  };

  return (
    <div className="tag-selection-container">
      <h1>Select Tags</h1>
      <div className="tag-groups-container">
        {Object.entries(tags).map(([key, values]) => {
          // If values is not an array, make it an array
          if (!Array.isArray(values)) {
            values = [values];
          }
          return (
            <div key={key} className="tag-group">
              <h2>{key}</h2>
              <div className="checkboxes-container">
                {values.map((value, index) => (
                  <div key={`${key}:${index}`} className="checkbox-label">
                    <input
                      type="checkbox"
                      id={`${key}:${index}`}
                      name={key}
                      value={`${key}:${value.trim()}`}
                      checked={selectedTags.includes(`${key}:${value.trim()}`)}
                      onChange={handleTagChange}
                    />
                    <label htmlFor={`${key}:${index}`}>{value.trim()}</label>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
      <div className="thumbnail-container">
        {photoPaths.map((photoPath, index) => (
          <img key={index} src={`http://localhost:4000${photoPath.filePath}`} alt={`${index}`} />
        ))}
      </div>
      <button onClick={handleDownload} className="download-button">
        Download Photos
      </button>
    </div>
  );
}

export default TagSelection;