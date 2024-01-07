const express = require('express');
const multer = require('multer');
const fs = require('fs');
const exifParser = require('exif-parser');

const upload = multer({ dest: 'uploads/' }); // files will be saved to 'uploads' folder
const router = express.Router();

// POST endpoint for file uploads
router.post('/upload', upload.array('photos'), (req, res) => {
    const imageInfoArray = [];

    req.files.forEach(file => {
        const buffer = fs.readFileSync(file.path);
        let metadata = null;

        try {
            const parser = exifParser.create(buffer);
            metadata = parser.parse();
        } catch (error) {
            console.error('Error parsing EXIF data:', error);
        }

        imageInfoArray.push({
            path: file.path,
            metadata: metadata
        });
    });

    imageInfoArray.forEach(item => {
      console.log('Path:', item.path);
      console.log('Metadata:', item.metadata);
      //console.log('Tags:', item.metadata.tags);
      // log other properties as needed
    }); // Output the array

    res.status(200).json({ message: 'Files uploaded successfully', data: imageInfoArray });
});

module.exports = router;