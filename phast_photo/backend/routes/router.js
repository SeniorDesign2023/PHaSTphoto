const express = require('express')
const multer = require('multer');
const upload = multer({ dest: 'uploads/' }); // files will be saved to 'uploads' folder

const router = express.Router()

// POST endpoint for file uploads
router.post('/upload', upload.array('photos'), (req, res) => {
    // req.files contains the uploaded files
    console.log(req.files);
  
    // Process files or save metadata to database, then
    res.status(200).json({ message: 'Files uploaded successfully' });
  }); 
  

module.exports = router