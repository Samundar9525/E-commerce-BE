const express = require('express');
const router = express.Router();
const dbClient = require('../dbHandler');
const multer = require('multer');
const fs = require('fs');
const { google } = require('googleapis');
const path = require('path');


const CLIENT_ID = "271825981459-trta5dnqurunmk2iarh8lp0a87chhoma.apps.googleusercontent.com";
const CLIENT_SECRET = "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";
const REDIRECT_URI = 'http://localhost:4200';

const oauth2Client = new google.auth.OAuth2(
    CLIENT_ID,
    CLIENT_SECRET,
    REDIRECT_URI
);

const SCOPES = ['https://www.googleapis.com/auth/drive.file'];

const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
});
if (fs.existsSync('token.json')) {
    const token = fs.readFileSync('token.json');
    oauth2Client.setCredentials(JSON.parse(token));
}
const drive = google.drive({ version: 'v3', auth: oauth2Client });

console.log('Authorize this app by visiting this url:', authUrl);

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
      cb(null, file.originalname);
    },
  });

// Initialize multer
const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 },
  });

router.post('/upload', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
          }
      
        const filePath = req.file.path;
        const fileMetadata = {
            name: req.file.originalname,
        };
        const media = {
            mimeType: req.file.mimetype,
            body: fs.createReadStream(filePath),
        };

        const response = await drive.files.create({
            resource: fileMetadata,
            media: media,
            fields: 'id',
        });

        const fileId = response.data.id;
        await drive.permissions.create({
            fileId: fileId,
            requestBody: {
                role: 'reader',
                type: 'anyone',
            },
        });
        const fileUrl = `https://drive.google.com/uc?id=${fileId}`;
        fs.unlinkSync(filePath);
        res.json({
            message: 'File uploaded successfully!',
            fileUrl: fileUrl,
        });
    } catch (error) {
        console.error('Error uploading file:', error);
        res.status(500).json({ error: 'Error uploading file' });
    }
});



router.post('/products', async (req, res) => {
    const { name, rate, discount, sold, instock, returned, image, category } = req.body;
    if (!name || !rate || !image || !category) {
        return res.status(400).json({ error: 'Missing required fields: name, rate, image, or category' });
    }
    const productData = {
        name,
        rate,
        discount: discount || 0,
        sold: sold || 0,
        instock: instock || 0,
        returned: returned || 0,
        image,
        producttype:category||'Shoes',
    };

    try {
        const newProduct = await dbClient.createRecord('products', productData);
        res.status(201).json(newProduct);
    } catch (error) {
        console.error('Error inserting product:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Delete product API
router.delete('/deleteProducts/:id', async (req, res) => {
    const productId = req.params.id;
    try {
        const product = await dbClient.getRecordById('products', productId);
        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }
        await dbClient.deleteRecordById('products', productId);
        res.status(200).json({ message: 'Product deleted successfully' });
    } catch (error) {
        console.error('Error deleting product:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// API route to get all products
router.get('/products', async (req, res) => {
    const limit = parseInt(req.query.limit) || 100;
    const offset = parseInt(req.query.offset) || 0;
    try {
        const result = await dbClient.readAllRecords('products',limit,offset);
        if (result.length === 0) {
            return res.status(404).json({ message: `No data found for table: ${tableName}` });
        }
        res.status(200).json(result);
    } catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});



module.exports = router;
