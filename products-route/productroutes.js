const express = require('express');
const router = express.Router();
const dbClient = require('../dbHandler')

function getAllProducts(tableName,limit,offset){
    const data = dbClient.readAllRecords(tableName,limit,offset)
    return data;

}

router.get('/:tableName', async (req, res) => {
    const { tableName } = req.params;
    const limit = parseInt(req.query.limit) || 100;
    const offset = parseInt(req.query.offset) || 0;
    try {
        const data = await getAllProducts(tableName,limit,offset);
        if (data.length === 0) {
            return res.status(404).json({ message: `No data found for table: ${tableName}` });
        }
        res.json(data);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ message: error.message });
    }
});


router.post('/:tableName', async (req, res) => {
    const { tableName } = req.params;
    const data = req.query.payload ? JSON.parse(req.query.payload) : req.body;

    try {
        const newRecord = await dbClient.createRecord(tableName, data);
        res.status(201).json({
            message: 'Record created successfully',
            record: newRecord,
        });
    } catch (error) {
        console.error('Error creating record:', error);
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
