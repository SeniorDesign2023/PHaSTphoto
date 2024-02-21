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

function clearTempDirectory(directory) {
    if (fs.existsSync(directory)) {
        fs.readdirSync(directory).forEach((file) => {
            const curPath = path.join(directory, file);
            if (fs.lstatSync(curPath).isDirectory()) {
                clearTempDirectory(curPath);
            } else {
                fs.unlinkSync(curPath);
            }
        });
    }
}

const clearTempMiddleware = (req, res, next) => {
    clearTempDirectory(path.join(__dirname, '..', 'temp'));
    next();
};

router.post('/upload', clearTempMiddleware, (req, res) => {
    upload.array('photos')(req, res, async (err) => {
        if (err) {
            return res.status(500).json({ message: 'Error uploading files', error: err });
        }

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
            console.error('Error processing files:', err);
            res.status(500).json({ message: 'Error processing files', error: err });
        }
    });
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
            const parsedValue = isNaN(Number(value)) ? value : Number(value);
            return { [`metadata.tags.${key}`]: parsedValue };
        });
        

        const query = { $and: tagQueries };

        const photos = await Photo.find(query);

        if (photos.length === 0) {
            return res.status(404).json({ message: 'No photos found with the selected tags' });
        }

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

router.post('/deleteStoredPhotos', async (req, res) => {
    try {
        await Photo.deleteMany({});
        res.status(200).json({ message: 'Stored photos deleted successfully'});
    } catch (error) {
        console.error('Error deleting stored photos', error);
        res.status(500).json({ message: 'Error creating and sending zip file', error: error });
    }
});

module.exports = router;
