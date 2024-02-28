const moment= require('moment');
const express = require('express');
const multer = require('multer');
const exifParser = require('exif-parser');
const Photo = require('../models/photo');
const fs = require('fs');
const archiver = require('archiver');
const path = require('path');
const { exit } = require('process');
const tags = [];/////this came from router.get
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
        
        

        photos.forEach((photo) => {
            const metadata = photo.metadata;
            if (metadata.tags) {
                for (const tag in metadata.tags) {
                    const pair = [tag, metadata.tags[tag]];
                    if (!tags.some(([key, value]) => key.toString() == tag.toString() && value.toString() == metadata.tags[tag].toString())) {
                        //i am pretty sure this is where conditional overrides will go
                        //pass pair into conditional formatting fiunction
                        //pair=tagComp(pair);
                        if (!dumbTag(pair)){
                            //tags.push(pair);
                            alterTag(pair);//in the case of pushing from the function
                        }
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



module.exports = router;

function addUniqueTag(newTag) {
    // Check if the tag (both key and value) already exists in the tags array
    if (!tags.some(tag => tag[0] == newTag[0] && tag[1] == newTag[1])) {
        tags.push(newTag);
    }
}

function alterTag(pear) {
    // Define a helper function to add a tag if it doesn't exist
    

    switch (pear[0]) {
        case 'DateTimeOriginal':
            var date = moment.unix(pear[1]);
            var month = date.month() + 1;
            var day = date.date();
            var clock = date.hour();

            // Determine season and add it if unique
            if ((month > 3 || (month == 3 && day >= 21)) && (month < 6 || (month == 6 && day < 21))) {
                addUniqueTag(['Season', 'Spring']);
            } else if ((month > 6 || (month == 6 && day >= 21)) && (month < 9 || (month == 9 && day < 21))) {
                addUniqueTag(['Season', 'Summer']);
            } else if ((month > 9 || (month == 9 && day >= 21)) && (month < 12 || (month == 12 && day < 21))) {
                addUniqueTag(['Season', 'Fall']);
            } else {
                addUniqueTag(['Season', 'Winter']);
            }

            // Determine time of day and add it if unique
            if (clock < 4 || clock >= 22) {
                addUniqueTag(['Daytime', 'Night']);
            } else if (clock >= 4 && clock < 10) {
                addUniqueTag(['Daytime', 'Morning']);
            } else if (clock >= 10 && clock < 14) {
                addUniqueTag(['Daytime', 'Midday']);
            } else if (clock >= 14 && clock < 18) {
                addUniqueTag(['Daytime', 'Afternoon']);
            } else {
                addUniqueTag(['Daytime', 'Evening']);
            }
            break;
        //case 'Location'://create lola boundaries for continents. start with rectangles. maybe change to a better constraint pattern, potentially change to countries
        // case 'FocalLengthIn35mmFormat'://will
        //     addUniqueTag(['FocalLength', pear[1]]);
        //     break;
        case 'ApertureValue':
            addUniqueTag(['Aperture', pear[1]]);
            break;
            //make duplicates to output Aperture. one with ApertureValue, and one with FNumber
        // case 'FNumber':
        //     addUniqueTag(['Aperture', pear[1]]);
        //     break;
        case 'LensModel':
            addUniqueTag(['Lens Model', pear[1]]);
            break;
        case 'LensMake':
            addUniqueTag(['Lens Make', pear[1]]);
            break;
        //case '':



        default:
            // Add the original tag if it's unique
            addUniqueTag(pear);
    }
}

function dumbTag(pear){//function for cleaning out
    switch (pear[0]){

        case 'XResolution':
            return true;
        case 'YResolution':
            return true;
        case 'ResolutionUnit':
            return true;
        case 'undefined':
            return true;
        case 'ExposureProgram'://find out how this works and move to comparisons
            return true;
        case 'MeteringMode'://find out how this works and move to comparisons
            return true;
        case 'MaxApertureValue':
            return true;
        case 'LightSource':
            return true;
        case 'Flash':
            return true;
        case 'ColorSpace'://find out how this works and move to comparisons
            return true;
        case 'CustomRendered':
            return true;
        case 'WhiteBalance'://find out how this works and move to comparisons
            return true;
        case 'FocalPlaneYResolution':
            return true;
        case 'FocalPlaneXResolution':
            return true;
        case 'SensingMethod':
            return true;
        case 'FocalPlaneResolutionUnit':
            return true;
        case 'ExposureTime':
            return true;
        case 'ModifyDate':
            return true;
        case 'ExposureMode'://find out how this works and move to comparisons
            return true;
        case 'DigitalZoomRatio':
            return true;
        case 'SceneCaptureType':
            return true;
        case 'Contrast':
            return true;
        case 'Saturation':
            return true;
        case 'Sharpness':
            return true;
        case 'SerialNumber':
            return true;
        case 'CreateDate'://same as DateTimeOriginal
            return true;
        case 'GainControl':
            return true;
        case 'BrightnessValue':
            return true;
        case 'GPSSpeed':
            return true;
        case 'GPSSpeedref':
            return true;
        case 'ShutterSpeedValue':
            return true;
        case 'GPSVersionID':
            return true;
        case 'GPSImgDirection':
            return true;
        case 'GPSImgDirectionRef':
            return true;
        case 'GPSHPoistioningError':
            return true;
        case 'GPSDestBearing':
            return true;
        case 'SubSecTimeOriginal':
            return true;
        case 'SubSecTimeDigitized':
            return true;
        case 'SubjectArea':
            return true;
        case 'SensitivityType':
            return true;
        case 'GPSLongitudeRef'://negative value will be west
            return true;
        case 'GPSLatitudeRef'://negative value will be south
            return true;
        case 'S':
            return true;
        case 'LensInfo':
            return true;
        case 'LensSerialNumber':
            return true;
        case 'ExposureCompensation':
            return true;
        case 'SubjectDistanceRange':
            return true;
        case 'FocalLengthIn35mmFormat':
            return true;
        case 'FNumber':
            return true;
        // case '':
        //     return true;
        // case '':
        //     return true;
        // case '':
        //     return true;
        // case '':
        //     return true;
        // case '':
        //     return true;
        // case '':
        //     return true;
        // case '':
        //     return true;
        // case '':
        //     return true;
        // case '':
        //     return true;
        // case '':
        //     return true;
        // case '':
        //     return true;



        default:
            return false;
    }
}
function createSchemaString(taggz){
    temp='';
    num=0
    for(i=0; i<=taggz.length(); i++){
        temp.concat(tag[0], ': ', tag[1]);
        if(i<taggz.length()-1){
            temp.concat(', ')
        }
    }
    return temp;
}

//gonna need another function for gps stuff
//Maybe a GPS altitude tag for different landscapes?

//generate a uid for a session and save it as a cookie and then stor in the URL