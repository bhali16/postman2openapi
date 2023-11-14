const express = require('express');
const multer = require('multer');
const postmanToOpenApi = require('postman-to-openapi');
const path = require('path');
const fs = require('fs');
const cors = require('cors');

const app = express();
const upload = multer({ dest: 'uploads/' });

app.use(express.static('public'));
app.use(cors()); // Allowing all CORS requests - adjust according to your requirements

// Function to generate a unique filename
const generateUniqueFileName = (filename) => {

    const uniqueSuffix = Date.now();
    return `openapi_${uniqueSuffix}_${filename}`;
};

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.post('/convert', upload.single('postmanCollection'), async (req, res) => {
    if (!req.file) {
        return res.status(400).send('No file uploaded');
    }

    const tempFilePath = req.file.path;
    const filename = req.file.originalname;
    const uniqueFileName = generateUniqueFileName(filename);
    const finalFilePath = path.join(__dirname, 'uploads/', `${uniqueFileName}`);
    // uniqueFileName = uniqueFileName.split('.')[0];
    const outputFile = path.join(__dirname, 'converted_files/', `${uniqueFileName}.yml`);

    try {
        // Rename the uploaded file with a unique name
        fs.rename(tempFilePath, finalFilePath, async (err) => {
            if (err) {
                return res.status(500).send('Error saving the file');
            }
            try {
                const result = await postmanToOpenApi(finalFilePath, outputFile, { defaultTag: 'General' });
                res.send(result);
            } catch (err) {
                res.status(500).send(err.message);
            }
        });
    } catch (err) {
        res.status(500).send('Conversion process error');
    }
});



app.listen(3000, () => {
    console.log('Server running on port 3000');
});
