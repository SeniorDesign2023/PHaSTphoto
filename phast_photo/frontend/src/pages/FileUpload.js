import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import './FileUpload.css';;

function FileUpload({ onNext }) {
  const [files, setFiles] = useState([]);

  const onDrop = useCallback(acceptedFiles => {
    setFiles(acceptedFiles.map(file => Object.assign(file, {
      preview: URL.createObjectURL(file)
    })));
  }, []);

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    multiple: true,
    accept: 'image/jpeg'
  });

  const filesList = files.map(file => (
    <li key={file.path}>
      {file.path} - {file.size} bytes
    </li>
  ));

  const uploadFiles = async () => {
    const formData = new FormData();
    files.forEach(file => {
      formData.append('photos', file);
    });

    try {
      const response = await fetch('http://localhost:4000/upload', { // Change to your backend URL
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('File upload failed');
      }

      // Handle success
      const result = await response.json();
      console.log('Upload successful', result);
      onNext(); // Proceed to next step
    } catch (error) {
      console.error('Upload error', error);
    }
  };

  const handleNext = () => {
    uploadFiles();
  };

  return (
    <div className="file-upload-container">
      <h1 className="title">PHaST Photo</h1>
      <div {...getRootProps({ className: 'dropzone' })}>
        <input {...getInputProps({ accept: 'image/jpeg' })} />
        <div className="dropzone-content">
          <p>Drag 'n' drop JPEG files here, or click to select files</p>
        </div>
      </div>
      {files.length > 0 && (
        <div>
          <strong>Files:</strong>
          <ul>{filesList}</ul>
        </div>
      )}
      <div className="next-button-container">
        <button onClick={handleNext} className="next-button" disabled={files.length === 0}>Tag Photos</button>
      </div>
    </div>
  );
}

export default FileUpload;