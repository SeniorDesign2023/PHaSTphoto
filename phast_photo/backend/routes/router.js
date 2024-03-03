const moment = require('moment');
const express = require('express');
const multer = require('multer');
const exifParser = require('exif-parser');
const Photo = require('../models/photo');
const fs = require('fs');
const archiver = require('archiver');
const path = require('path');
const router = express.Router();

const storage = multer.diskStorage({
    destination: 'temp/',
    filename: (req, file, cb) => {
        cb(null, file.originalname);
    }
});

const upload = multer({ storage: storage });

function clearTempDirectory(directory) {
    if (fs.existsSync(directory)) {
        fs.readdirSync(directory).forEach((file) => {
            const curPath = path.join(directory, file);
            if (!fs.lstatSync(curPath).isDirectory()) {
                fs.unlinkSync(curPath);
            } else {
                clearTempDirectory(curPath);
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

                // Alter and clean metadata tags before saving
                alterAndCleanMetadata(metadata);

                const newPhoto = new Photo({
                    filePath: `/temp/${file.originalname}`,
                    metadata: metadata
                });

                try {
                    await newPhoto.save();
                    imageInfoArray.push(newPhoto);
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

function alterAndCleanMetadata(metadata) {
    Object.keys(metadata.tags).forEach(key => {
        let value = metadata.tags[key];
        if (!dumbTag({ key, value })) {
            alterTag(metadata, key, value);
        } else {
            delete metadata.tags[key];
        }
    });
}

function alterTag(metadata, key, value) {
    switch (key) {
        case 'DateTimeOriginal':
            alterDateTimeOriginal(metadata, value);
            delete metadata.tags[key];  // Remove the DateTimeOriginal after processing
            break;
        case 'ApertureValue':
            metadata.tags['Aperture'] = value;
            break;
        case 'LensModel':
            metadata.tags['Lens Model'] = value;
            break;
        case 'LensMake':
            metadata.tags['Lens Make'] = value;
            break;
        // Add more cases as necessary
        default:
            // Leave other tags as they are
            break;
    }
}

function alterDateTimeOriginal(metadata, value) {
    var date = moment.unix(value);
    var month = date.month() + 1;
    var day = date.date();
    var clock = date.hour();

    // Determine season
    let season = getSeason(month, day);
    metadata.tags['Season'] = season;

    // Determine time of day
    let daytime = getTimeOfDay(clock);
    metadata.tags['Daytime'] = daytime;
}

function getSeason(month, day) {
    if ((month > 3 || (month == 3 && day >= 21)) && (month < 6 || (month == 6 && day < 21))) {
        return 'Spring';
    } else if ((month > 6 || (month == 6 && day >= 21)) && (month < 9 || (month == 9 && day < 21))) {
        return 'Summer';
    } else if ((month > 9 || (month == 9 && day >= 21)) && (month < 12 || (month == 12 && day < 21))) {
        return 'Fall';
    } else {
        return 'Winter';
    }
}

function getTimeOfDay(clock) {
    if (clock < 4 || clock >= 22) {
        return 'Night';
    } else if (clock >= 4 && clock < 10) {
        return 'Morning';
    } else if (clock >= 10 && clock < 14) {
        return 'Midday';
    } else if (clock >= 14 && clock < 18) {
        return 'Afternoon';
    } else {
        return 'Evening';
    }
}

function dumbTag({ key, value }) {
    // Define tags to be ignored
    const ignoredTags = [
        'XResolution', 'YResolution', 'ResolutionUnit', 'undefined',
        'ExposureProgram', 'MeteringMode', 'MaxApertureValue', 'LightSource',
        'Flash', 'ColorSpace', 'CustomRendered', 'WhiteBalance',
        'FocalPlaneYResolution', 'FocalPlaneXResolution', 'SensingMethod',
        'FocalPlaneResolutionUnit', 'ExposureTime', 'ModifyDate',
        'ExposureMode', 'DigitalZoomRatio', 'SceneCaptureType', 'Contrast',
        'Saturation', 'Sharpness', 'SerialNumber', 'CreateDate', 'GainControl',
        'BrightnessValue', 'GPSSpeed', 'GPSSpeedRef', 'ShutterSpeedValue',
        'GPSVersionID', 'GPSImgDirection', 'GPSImgDirectionRef', 'GPSHPositioningError',
        'GPSDestBearing', 'SubSecTimeOriginal', 'SubSecTimeDigitized', 'SubjectArea',
        'SensitivityType', 'GPSLongitudeRef', 'GPSLatitudeRef', 'S', 'LensInfo',
        'LensSerialNumber', 'ExposureCompensation', 'SubjectDistanceRange',
        'FocalLengthIn35mmFormat', 'FNumber'
    ];

    return ignoredTags.includes(key);
}

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

router.get('/getTags', async (req, res) => {
    try {
        const photos = await Photo.find({});
        let allTags = {};

        photos.forEach(photo => {
            const metadata = photo.metadata;
            if (metadata && metadata.tags) {
                for (const [key, value] of Object.entries(metadata.tags)) {
                    if (!allTags[key]) {
                        allTags[key] = new Set();
                    }
                    allTags[key].add(value.toString());
                }
            }
        });

        // Convert each Set to an array
        let tagsArray = {};
        for (const key in allTags) {
            tagsArray[key] = Array.from(allTags[key]);
        }

        res.status(200).json({ tags: tagsArray });
    } catch (err) {
        console.error('Error fetching tags:', err);
        res.status(500).json({ message: 'Error fetching tags', error: err });
    }
});




module.exports = router;
