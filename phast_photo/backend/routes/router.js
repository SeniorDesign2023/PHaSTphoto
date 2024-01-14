const express = require('express');
const multer = require('multer');
const exifParser = require('exif-parser');
const Photo = require('../models/photo');
const fs = require('fs'); // Add this line to require the fs module
const Archiver = require('archiver');

const storage = multer.diskStorage({
    destination: 'temp/',
    filename: (req, file, cb) => {
        cb(null, file.originalname);
    }
});

const upload = multer({ storage: storage }); 
const router = express.Router();

// POST endpoint for file uploads
router.post('/upload', upload.array('photos'), async (req, res) => {
    try {
        // Clear all existing documents from the collection
        await Photo.deleteMany({});

        const imageInfoArray = [];

        for (const file of req.files) {
            const buffer = fs.readFileSync(file.path);
            let metadata = null;

            try {
                const parser = exifParser.create(buffer);
                metadata = parser.parse();
            } catch (error) {
                console.error('Error parsing EXIF data:', error);
            }

            const newPhoto = new Photo({
                filePath: '/temp/' + file.originalname,
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

router.get('/getTags', async (req, res) => {
    try {
        // Retrieve all photos from the database
        const photos = await Photo.find({});
        
        // Extract tags from the photos
        const tags = [];

        photos.forEach((photo) => {
            const metadata = photo.metadata;
            if (metadata.tags) {
                // Iterate through the keys (tags) in metadata.tags
                for (const tag in metadata.tags) {
                    const pair = [tag, metadata.tags[tag]];
                    // Check if the pair already exists in the tags array
                    if (!tags.some(([key, value]) => key.toString() == tag.toString() && value.toString() == metadata.tags[tag].toString())) {
                        tags.push(pair);
                        console.log(pair)
                    }
                }
            }
        });
        res.status(200).json({ tags });
    } catch (err) {
        console.error('Error fetching tags:', err);
        res.status(500).json({ message: 'Error fetching tags', error: err });
    }
});







module.exports = router;