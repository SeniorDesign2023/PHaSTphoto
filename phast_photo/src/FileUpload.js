import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import './FileUpload.css';

function FileUpload({ onNext }) {
  const [files, setFiles] = useState([]);

  const onDrop = useCallback(acceptedFiles => {
    // Update the state with the new files
    setFiles(acceptedFiles.map(file => Object.assign(file, {
      preview: URL.createObjectURL(file)
    })));
  }, []);

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    multiple: true,
    accept: 'image/jpeg' // Accept only JPEG images
  });

  const filesList = files.map(file => (
    <li key={file.path}>
      {file.path} - {file.size} bytes
    </li>
  ));

  return (
    <div className="file-upload-container">
      <h1 className="title">PHaST Photo</h1>
      <div {...getRootProps({ className: 'dropzone' })}>
        {/* Add accept attribute here */}
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
        <button onClick={onNext} className="next-button" disabled={files.length === 0}>Tag Photos</button>
      </div>
    </div>
  );
}

export default FileUpload;
