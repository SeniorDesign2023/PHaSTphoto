const express = require('express');
const multer = require('multer');
const exifParser = require('exif-parser');
const Photo = require('../models/photo');
const fs = require('fs');
const archiver = require('archiver');
const path = require('path');

const storage = multer.diskStorage({
    destination: 'temp/',
    filename: (req, file, cb) => {
        cb(null, file.originalname);
    }
});

const upload = multer({ storage: storage }); 
const router = express.Router();

router.post('/upload', upload.array('photos'), async (req, res) => {
    try {
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
                filePath: `/temp/${file.originalname}`, 
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
        const photos = await Photo.find({});
        
        const tags = [];

        photos.forEach((photo) => {
            const metadata = photo.metadata;
            if (metadata.tags) {
                for (const tag in metadata.tags) {
                    const pair = [tag, metadata.tags[tag]];
                    if (!tags.some(([key, value]) => key.toString() == tag.toString() && value.toString() == metadata.tags[tag].toString())) {
                        tags.push(pair);
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

router.post('/downloadPhotos', async (req, res) => {
    try {
        const selectedTags = req.body.selectedTags;

        const tagQueries = selectedTags.map(tag => {
            const [key, value] = tag.split(':');
            return { [`metadata.tags.${key}`]: value };
        });

        const query = { $and: tagQueries };

        const photos = await Photo.find(query);

        const archive = archiver('zip', {
            zlib: { level: 9 }
        });

        archive.on('error', function(err) {
            throw err;
        });

        archive.on('end', function() {
            console.log('Archive wrote %d bytes', archive.pointer());
        });

        res.setHeader('Content-Type', 'application/zip');
        res.setHeader('Content-Disposition', 'attachment; filename=selected_photos.zip');

        archive.pipe(res);

        photos.forEach(photo => {
            const filePath = path.join(__dirname, '..', photo.filePath);
            archive.file(filePath, { name: path.basename(filePath) });
        });

        archive.finalize();
    } catch (error) {
        console.error('Error creating and sending zip file:', error);
        res.status(500).json({ message: 'Error creating and sending zip file', error: error });
    }
});



module.exports = router;
