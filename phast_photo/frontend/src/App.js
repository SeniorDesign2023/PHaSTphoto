import React, { useState } from 'react';
import FileUpload from './pages/FileUpload';
import TagSelection from './pages/TagSelection';

function App() {
  const [currentPage, setCurrentPage] = useState('upload');

  const goToTagSelection = () => {
    setCurrentPage('tagSelection');
  };

  return (
    <div>
      {currentPage === 'upload' && <FileUpload onNext={goToTagSelection} />}
      {currentPage === 'tagSelection' && <TagSelection />}
    </div>
  );
}

export default App;