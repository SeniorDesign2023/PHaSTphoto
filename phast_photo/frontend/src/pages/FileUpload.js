import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import './FileUpload.css';
import { toast, ToastContainer } from 'react-toastify'; // Fixed import
import 'react-toastify/dist/ReactToastify.css';

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
    accept: { 'image/*': ['.jpeg', '.jpg'] }
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
      const response = await fetch('http://localhost:4000/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('File upload failed');
      }

      const result = await response.json();
      console.log('Upload successful', result);
      onNext();
    } catch (error) {
      console.error('Upload error', error);
    }
  };

  const handleNext = () => {
    uploadFiles();
  };

  const handleDeleteStoredPhotos = async () => {
    try {
      const response = await fetch('http://localhost:4000/deleteStoredPhotos', {
        method: 'POST'
      });

      if (!response.ok) {
        throw new Error('Failed to delete stored photos');
      }

      const data = await response.json();

      toast(data.message);

      setFiles([]);
    } catch (error) {
      console.error('Error deleting stored photos', error);
      // Handle error
    }
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
      <div className="button-container">
        <button onClick={handleNext} className="next-button" disabled={files.length === 0}>Tag Photos</button>
        <button onClick={handleDeleteStoredPhotos} className="delete-button">Delete Stored Photos</button>
      </div>
      <ToastContainer />
    </div>
  );
}

export default FileUpload;
