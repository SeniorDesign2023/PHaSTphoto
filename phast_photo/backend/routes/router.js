const express = require('express');
const multer = require('multer');
const Archiver = require('archiver');
const exifParser = require('exif-parser');
const Photo = require('../models/photo');

// Set up multer to store files in memory
const upload = multer({ storage: multer.memoryStorage() });
const router = express.Router();

// POST endpoint for file uploads
router.post('/upload', upload.array('photos'), async (req, res) => {
    try {
        // Clear all existing documents from the collection
        await Photo.deleteMany({});

        const imageInfoArray = [];

        for (const file of req.files) {
            let metadata = null;

            try {
                const parser = exifParser.create(file.buffer);
                metadata = parser.parse();
            } catch (error) {
                console.error('Error parsing EXIF data:', error);
            }

            const newPhoto = new Photo({
                photoData: file.buffer, // Store the photo data from the buffer
                metadata: metadata
            });

            try {
                const savedPhoto = await newPhoto.save();
                imageInfoArray.push(savedPhoto);
            } catch (err) {
                console.error('Error saving to database:', err);
                return res.status(500).json({ message: 'Error saving photo', error: err });
            }
        }

        res.status(200).json({ message: 'Files uploaded and saved to database successfully', data: imageInfoArray });
    } catch (err) {
        console.error('Error clearing the database:', err);
        res.status(500).json({ message: 'Error clearing the database', error: err });
    }
});

router.get('/download', async (req, res) => {
  try {
      const photos = await Photo.find({});

      res.writeHead(200, {
          'Content-Type': 'application/zip',
          'Content-Disposition': 'attachment; filename=photos.zip'
      });

      const zip = Archiver('zip', { zlib: { level: 9 } });
      zip.pipe(res);

      photos.forEach(photo => {
          // Assuming photoData is a buffer containing your image
          zip.append(photo.photoData, { name: 'photo_' + photo._id + '.jpg' });
      });

      zip.finalize();
  } catch (err) {
      console.error('Error creating ZIP:', err);
      res.status(500).json({ message: 'Error creating ZIP file', error: err });
  }
});

module.exports = router;