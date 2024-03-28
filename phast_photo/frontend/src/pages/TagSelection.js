import React, { useState, useEffect } from 'react';
import './TagSelection.css';

function TagSelection() {
  const [tags, setTags] = useState({});
  const [selectedTags, setSelectedTags] = useState([]);
  const [photoPaths, setPhotoPaths] = useState([]);
  const [folderName, setFolderName] = useState('');
  const [Uploaded, setUploaded] = useState(false);
  const [aiTagsEnabled, setAiTagsEnabled] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [queryType, setQueryType] = useState('AND');

  const handleToggleQueryType = () => {
    setQueryType(prevQueryType => {
      const newQueryType = prevQueryType === 'AND' ? 'OR' : 'AND';
      updateDisplay(); 
      return newQueryType;
    });
  };

  const handleFileInputChange = async (event) => {
    const files = event.target.files || event.dataTransfer.files; 
    if (files.length === 0) {
      return; 
    }
  
    const formData = new FormData();
    Array.from(files).forEach(file => {
      formData.append('photos', file);
    });

    formData.append('aiTagsEnabled', aiTagsEnabled.toString());
  
    try {
      const response = await fetch(`http://localhost:4000/upload?aiTagsEnabled=${aiTagsEnabled}`, { 
        method: 'POST',
        body: formData,
      });
  
      if (!response.ok) {
        throw new Error('File upload failed');
      }
  
      const result = await response.json();
      console.log('Upload successful', result);
      setUploaded(true);
      fetchTags(); 
      fetchPhotos(); 
    } catch (error) {
      console.error('Upload error', error);
    }
  };

  const handleToggleAiTags = () => {
    setAiTagsEnabled(prevState => !prevState);
  };
  

  const handleToggleUpload = () => {
    const fileInput = document.getElementById('file-input');
    if (fileInput) {
      fileInput.click();
      
    }
  };

  const handleClearPhotos = async () => {
    try {
      const formData = new FormData();
      formData.append('aiTagsEnabled', aiTagsEnabled.toString());
      const response = await fetch(`http://localhost:4000/upload?aiTagsEnabled=${aiTagsEnabled}`, { 
        method: 'POST',
        body: formData,
      });
  
      if (!response.ok) {
        throw new Error('File clear failed');
      }
  
      const result = await response.json();
      console.log('clear successful', result);
      fetchTags(); 
      fetchPhotos(); 
      setUploaded(false);
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


  const handleTagChange = (event) => {
    const tag = event.target.value;
    const isChecked = event.target.checked;

    setSelectedTags((prevSelectedTags) => {
      if (isChecked) {
        return [...prevSelectedTags, tag];
      } else {
        return prevSelectedTags.filter((selectedTag) => selectedTag !== tag);
      }
      
    });
  };
  
  useEffect(() => {
    if(selectedTags && selectedTags.length > 0) {
      updateDisplay();
    } else {
      fetchPhotos();
    }
  }, [selectedTags, queryType]);


  const updateDisplay = async () => {
    try {
      const newDisp = await fetch('http://localhost:4000/photoSieve',{
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ selectedTags, queryType}),
      });
      if (newDisp.ok) {
        const data = await newDisp.json();
        setPhotoPaths(data.photoData);
      } else {
        console.error('Error updating display:', newDisp.statusText);
      }
    } catch (error) {
      console.error('Error updating display:', error);
    }
  }


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
        body: JSON.stringify({ selectedTags, folderName, queryType }), 
      });

      if (response.ok) {
        response.blob().then(blob => {
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `${folderName}.zip`; 
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
        <input 
          id="file-input" 
          type="file" 
          onClick={(e) => { e.target.value = null }}
          onChange={handleFileInputChange} 
          style={{ display: 'none' }} 
          multiple 
        />
        <button onClick={handleToggleUpload} className="toolbar-button">Upload Photos</button>
        <button onClick={handleClearPhotos} className="toolbar-button">Clear Photos</button>
        <button className={`toggle-button ${aiTagsEnabled ? 'active' : ''}`} onClick={handleToggleAiTags}>Enable AI Tagging</button>
        {Uploaded ? (
        <button className="toggle-button" onClick={handleToggleQueryType}>Combine Tags With: {queryType}</button>
        ): null}
      </div>
      <div className="logo-container">
        <img src="/PHaST_Logo.png" alt="Logo" className="top-logo"/>
      </div>
    </div>
    {Uploaded ? (
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
          <div className="thumbnail-container" >
            {photoPaths.map((photoPath, index) => (
                <img key={index} 
                src={`http://localhost:4000${photoPath.filePath}`} 
                alt={`${index}`} 
                onClick={() => {
                  setSelectedImage(`http://localhost:4000${photoPath.filePath}`);
                  setIsModalOpen(true);
                }}
                />
              ))
            }
          </div>
          {isModalOpen && (
            <div className="modal" onClick={() => setIsModalOpen(false)}>
              <img className="modal-content" src={selectedImage} alt='modal-img'/>
            </div>
          )}
        </div>
          <footer className="download-footer">
            <button onClick={handleDownload} className="download-button">
              Download Photos
            </button>
            <input className='folder-name-input'
              type="text" 
              value={folderName} 
              onChange={(e) => setFolderName(e.target.value)} 
              placeholder="Enter folder name"
            />
          </footer>
        </>
      ) : (
        <div className="upload-placeholder">
          {/* <h1 className="title">Your Title Here</h1> */}
          <img src="/PHaST_Logo.png" alt="Main Logo" className="upload-logo"/>
          
          <label htmlFor="file-input" className="upload-box" onDragOver={handleDragOver} onDragEnter={handleDragEnter} 
          onDrop={handleDrop}>
            No photos uploaded. Click the "Upload Photos" button or drag and drop photos here to get started.
          </label>
        </div>
        )}
    </div>
  );
}

export default TagSelection;
