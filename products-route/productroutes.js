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

module.exports = router;
