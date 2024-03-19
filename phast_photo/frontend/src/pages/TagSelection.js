import React, { useState, useEffect } from 'react';
import './TagSelection.css';

function TagSelection() {
  const [tags, setTags] = useState({});
  const [selectedTags, setSelectedTags] = useState([]);
  const [photoPaths, setPhotoPaths] = useState([]);
  const [folderName, setFolderName] = useState('');

  const handleFileInputChange = async (event) => {
    const files = event.target.files || event.dataTransfer.files; // Accept files from input or drop
    if (files.length === 0) {
      return; // Do nothing if no files are selected
    }
  
    const formData = new FormData();
    Array.from(files).forEach(file => {
      formData.append('photos', file);
    });
  
    try {
      const response = await fetch('http://localhost:4000/upload', { 
        method: 'POST',
        body: formData,
      });
  
      if (!response.ok) {
        throw new Error('File upload failed');
      }
  
      const result = await response.json();
      console.log('Upload successful', result);
      fetchTags(); // Refresh tags after upload
      fetchPhotos(); // Refresh photo paths after upload
    } catch (error) {
      console.error('Upload error', error);
    }
  };

  const handleToggleUpload = () => {
    const fileInput = document.getElementById('file-input');
    if (fileInput) {
      fileInput.click();
    }
  };

  const handleClearPhotos = async () => {
    try {
      const response = await fetch('http://localhost:4000/upload', { 
        method: 'POST',
        body: new FormData(),
      });
  
      if (!response.ok) {
        throw new Error('File clear failed');
      }
  
      const result = await response.json();
      console.log('clear successful', result);
      fetchTags(); // Refresh tags after upload
      fetchPhotos(); // Refresh photo paths after upload
    } catch (error) {
      console.error('Upload error', error);
    }
  };

  const fetchTags = async () => {
    try {
      const response = await fetch('http://localhost:4000/getTags');
      if (response.ok) {
        const data = await response.json();
        const processedTags = { ...data.tags };
        if (processedTags.GptGeneratedTags && processedTags.GptGeneratedTags.length) {
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

  // const handleTagChange = (event) => {
  //   const tag = event.target.value;
  //   const isChecked = event.target.checked;
  
  //   if (isChecked) {
  //     setSelectedTags(prevSelectedTags => [...prevSelectedTags, tag]);
  //   } else {
  //     setSelectedTags(prevSelectedTags => prevSelectedTags.filter(t => t !== tag));
  //   }
  // };
  const handleTagChange = (event) => {
    const tag = event.target.value;
    const isChecked = event.target.checked;
    console.log("Checkbox clicked: ", tag, isChecked); 

    setSelectedTags((prevSelectedTags) => {
      if (isChecked) {
        return [...prevSelectedTags, tag];
      } else {
        return prevSelectedTags.filter((selectedTag) => selectedTag !== tag);
      }
      
    });
  };
  
  useEffect(() => {
    const filteredPhotos = photoPaths.filter((path) =>
      path.tags && selectedTags.every((tag) => path.tags.includes(tag))
    );
    // change filteredPhotos to be a function call that takes in our selected tags,
    // queries the database for photos with those tags, and returns said photos
    setPhotoPaths(filteredPhotos);
    selectedTags.forEach(function(element){console.log(element)});

  }, [selectedTags, photoPaths]);

////////////////////////////////////// new ver ^^^




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
        body: JSON.stringify({ selectedTags, folderName }), // Include folderName in the request body
      });

      if (response.ok) {
        response.blob().then(blob => {
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `${folderName}.zip`; // Use folderName as the zip file name
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

  const handleDragOver = (event) => {
    event.preventDefault(); // Prevent default behavior to enable drop
  };

  const handleDragEnter = (event) => {
    event.preventDefault(); // Prevent default behavior to enable drop
  };

  const handleDrop = (event) => {
    event.preventDefault(); // Prevent default behavior to enable drop
    handleFileInputChange(event); // Pass the dropped files to handleFileInputChange
  };

  return (
    <div className="app-container">
    <div className="toolbar">
      <div className="button-container">
        <input id="file-input" type="file" onChange={handleFileInputChange} style={{ display: 'none' }} multiple />
        <button onClick={handleToggleUpload} className="toolbar-button">Upload Photos</button>
        <button onClick={handleClearPhotos} className="toolbar-button">Clear Photos</button>
      </div>
      <div className="logo-container">
        <img src="/logo192.png" alt="Logo" className="logo"/>
      </div>
    </div>
    {photoPaths.length > 0 ? (
      <>
      <div className="main-container">
        <div className="tag-selection-container">
          <h1>Select Tags</h1>
          <div className="tag-groups-container">
            {Object.entries(tags).map(([key, values]) => {
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
        </div>
          <div className="thumbnail-container" onDragOver={handleDragOver} onDragEnter={handleDragEnter} onDrop={handleDrop}>
            {photoPaths.map((photoPath, index) => (
                <img key={index} src={`http://localhost:4000${photoPath.filePath}`} alt={`${index}`} />
              ))
            }
          </div>
        </div>
          <footer className="download-footer">
            <button onClick={handleDownload} className="download-button">
              Download Photos
            </button>
            <input 
              type="text" 
              value={folderName} 
              onChange={(e) => setFolderName(e.target.value)} 
              placeholder="Enter folder name"
              style={{ padding: '5px' }} // Add some styling
            />
          </footer>
        </>
      ) : (
        // This is also clickable now.
        <label htmlFor="file-input" className="upload-placeholder">
          No photos uploaded. Click the "Upload Photos" button or drag and drop photos here to get started.
        </label>
        )}
    </div>
  );
}

export default TagSelection;
