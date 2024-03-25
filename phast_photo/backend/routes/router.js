const moment = require('moment');
const express = require('express');
const multer = require('multer');
const exifParser = require('exif-parser');
const Photo = require('../models/photo');
const fs = require('fs');
const archiver = require('archiver');
const path = require('path');
const router = express.Router();
const axios = require('axios');
const api_key = process.env.OPENAI_API_KEY;
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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

function encodeImage(imagePath) {
    let imageBase64 = fs.readFileSync(imagePath, { encoding: 'base64' });
    return imageBase64;
}

async function getTagsFromOpenAI(imagePath) {
    let imageBase64 = encodeImage(imagePath);
    let headers = {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${api_key}`
    };

    let payload = {
        "model": "gpt-4-vision-preview",
        "messages": [
            {
                "role": "user",
                "content": [
                    {
                        "type": "text",
                        "text": "Tag this image from this list of tags, giving nothing but these tags in the output: sunset, nature, beach, cityscape, landscape, portrait, wildlife, street, architecture, food, flowers, mountains, sea, forest, urban, art, sky, people, person, animals, holiday, garden, river, lake, underwater, animal."
                    },
                    {
                        "type": "image_url",
                        "image_url": {
                            "url": `data:image/jpeg;base64,${imageBase64}`
                        }
                    }
                ]
            }
        ],
        "max_tokens": 300
    };


    try {
        const response = await axios.post("https://api.openai.com/v1/chat/completions", payload, { headers: headers });
        const tags = response.data.choices[0].message.content;
        return tags; 
    } catch (error) {
        console.error('Error fetching tags from OpenAI:', error);
        if (error.response) {
            console.error('Error response data:', error.response.data);
        }
        return [];
    }
}

router.post('/upload', clearTempMiddleware, (req, res) => {
    const aiTagsEnabled = req.query.aiTagsEnabled === "true";

    upload.array('photos')(req, res, async (err) => {
        if (err) {
            return res.status(500).json({ message: 'Error uploading files', error: err });
        }
        await Photo.deleteMany({});
        const imageInfoArray = [];

        for (const file of req.files) {
            let metadata = null;

            try {
                const buffer = fs.readFileSync(file.path);
                const parser = exifParser.create(buffer);
                metadata = parser.parse();
                alterAndCleanMetadata(metadata);

                if (aiTagsEnabled && api_key) { 
                    const openAITagsString = await getTagsFromOpenAI(file.path);
                    const openAITagsArray = openAITagsString.split(', ').map(tag => tag.trim());
                    metadata.tags['GptGeneratedTags'] = openAITagsArray;
                }
                
                const newPhoto = new Photo({
                    filePath: `/temp/${file.originalname}`,
                    metadata: metadata
                });

                await newPhoto.save();
                imageInfoArray.push(newPhoto);

            } catch (error) {
                console.error('Error processing file:', error);
            }
        }

        res.status(200).json({ message: 'Files uploaded and saved to database successfully', data: imageInfoArray });
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
            delete metadata.tags[key];  
            break;
        case 'ApertureValue':
            metadata.tags['Aperture'] = value;
            delete metadata.tags[key];
            break;
        case 'LensModel':
            metadata.tags['Lens Model'] = value;
            delete metadata.tags[key];
            break;
        case 'LensMake':
            metadata.tags['Lens Make'] = value;
            delete metadata.tags[key];
            break;
            case 'GPSLatitude':
                case 'GPSLongitude':
                    metadata.tags[key] = value;
                    
                    if (metadata.tags['GPSLatitude'] !== undefined && metadata.tags['GPSLongitude'] !== undefined) {
                        const continent = getContinent(parseFloat(metadata.tags['GPSLatitude']), parseFloat(metadata.tags['GPSLongitude']));
                        metadata.tags['Continent'] = continent;
        
                        delete metadata.tags['GPSLatitude'];
                        delete metadata.tags['GPSLongitude'];
                    }
                    break;
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

function getContinent(latitude, longitude) {
    if (latitude > 12 && latitude < 55 && longitude > -24 && longitude < 74) {
        return 'Europe';
    } else if (latitude > -35 && latitude < 34 && longitude > -18 && longitude < 51) {
        return 'Africa';
    } else if (latitude > 5 && latitude < 71 && longitude > 19 && longitude < 169) {
        return 'Asia';
    } else if (latitude > -55 && latitude < 12 && longitude > -82 && longitude < -34) {
        return 'South America';
    } else if (latitude > 24 && latitude < 72 && longitude > -169 && longitude < -52) {
        return 'North America';
    } else if (latitude > -90 && latitude < -55 && longitude > -180 && longitude < 180) {
        return 'Antarctica';
    } else if (latitude > -10 && latitude < -55 && longitude > 110 && longitude < 180) {
        return 'Australia';
    } else {
        return 'Unknown';
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
        'FocalLengthIn35mmFormat', 'FNumber', 'GPSAltitude', 'GPSDestBearingRef', 'YCbCrPositioning',
        'ExifImageWidth', 'ExifImageHeight', 'ImageUniqueID', 'Orientation', 'HostComputer',
        'GPSAltitudeRef', 'GPSTimeStamp', 'GPSDateStamp', 'SubSecTime', 'TileWidth',
        'TileLength', 'RecommendedExposureIndex', 'GPSDOP', 'InteropIndex'
    ];

    return ignoredTags.includes(key);
}
router.post('/photoSieve', async (req, res) => {
    try {
        const selectedTags = req.body.selectedTags;

        const tagQueries = selectedTags.map(tag => {
            const [key, value] = tag.split(':');
            if (key === 'GptGeneratedTags') {
                // Use $in to match any of the tags in the array
                return { [`metadata.tags.${key}`]: { $in: [value] } };
            } else {
                const parsedValue = isNaN(Number(value)) ? value : Number(value);
                return { [`metadata.tags.${key}`]: parsedValue };
            }
        });

        const query = { $and: tagQueries };

        const photos = await Photo.find(query);

       

        
        var validDisplay=photos.map(photo => {
            const fileName=path.parse(photo.filePath).base;
            return{
                fileName,
                filePath: `/getPhotos/${fileName}`};
            
          });

        res.json({photoData: validDisplay});

    } catch (error) {
        console.error('Error updating display:', error);
    }
});
router.post('/downloadPhotos', async (req, res) => {
    try {
        const selectedTags = req.body.selectedTags;
        const folderName = req.body.folderName; // Add this line to get the folder name from the request body

        const tagQueries = selectedTags.map(tag => {
            const [key, value] = tag.split(':');
            if (key === 'GptGeneratedTags') {
                // Use $in to match any of the tags in the array
                return { [`metadata.tags.${key}`]: { $in: [value] } };
            } else {
                const parsedValue = isNaN(Number(value)) ? value : Number(value);
                return { [`metadata.tags.${key}`]: parsedValue };
            }
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
        res.setHeader('Content-Disposition', `attachment; filename=${folderName}.zip`); // Use folderName variable here

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

router.use('/getPhotos', express.static(path.join(__dirname, '..', 'temp')));

router.get('/listPhotoPaths', (req, res) => {
    const directoryPath = path.join(__dirname, '..', 'temp');
  
    fs.readdir(directoryPath, (err, files) => {
      if (err) {
        console.error('Error getting files:', err);
        res.status(500).send('Error getting files');
      } else {
        const photoData = files.map(filename => ({
          filename,
          filePath: `/getPhotos/${filename}`
        }));
        //console.log(photoData[0].filePath);
        res.json({ photoData });
      }
    });
});





module.exports = router;