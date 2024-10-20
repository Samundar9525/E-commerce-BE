const { Pool } = require('pg');

// PostgreSQL Pool setup
const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'amazon',
    password: 'admin',
    port: 5432,
});
pool.connect()

/**
 * Creates a new record in the specified table.
 * @param {string} tableName - The name of the table.
 * @param {object} data - The data to insert as key-value pairs.
 * @returns {Promise<object>} - The created record.
 */
async function createRecord(tableName, data) {
    const columns = Object.keys(data).join(', ');
    const values = Object.values(data);
    console.log(columns,values  );
    const placeholders = values.map((_, index) => `$${index + 1}`).join(', ');

    const query = `INSERT INTO ${tableName} (${columns}) VALUES (${placeholders}) RETURNING *`;
    
    try {
        const result = await pool.query(query, values);
        return result.rows[0];
    } catch (err) {
        console.error(`Error inserting data into ${tableName}:`, err);
        throw err;
    }
}

/**
 * Retrieves all records from the specified table.
 * @param {string} tableName - The name of the table.
 * @returns {Promise<Array<object>>} - An array of records.
 */
async function readAllRecords(tableName, limit, offset) {
    const query = `SELECT * FROM ${tableName} LIMIT $1 OFFSET $2`;
    const values = [limit, offset];
    const result = await pool.query(query,values);
    return result.rows;
}

/**
 * Retrieves a single record by ID from the specified table.
 * @param {string} tableName - The name of the table.
 * @param {number} id - The ID of the record to retrieve.
 * @returns {Promise<object>} - The retrieved record.
 */
async function getRecordById(tableName, id) {
    const query = `SELECT * FROM ${tableName} WHERE id = $1`;
    const result = await pool.query(query, [id]);
    if (result.rows.length === 0) {
        throw new Error('Record not found');
    }
    return result.rows[0];
}

/**
 * Updates a record by ID in the specified table.
 * @param {string} tableName - The name of the table.
 * @param {number} id - The ID of the record to update.
 * @param {object} data - The updated data as key-value pairs.
 * @returns {Promise<object>} - The updated record.
 */
async function updateRecordById(tableName, id, data) {
    const updates = Object.keys(data).map((key, index) => `${key} = $${index + 1}`).join(', ');
    const values = Object.values(data);
    values.push(id); // Add id as the last value

    const query = `UPDATE ${tableName} SET ${updates} WHERE id = $${values.length} RETURNING *`;
    const result = await pool.query(query, values);
    if (result.rows.length === 0) {
        throw new Error('Record not found');
    }
    return result.rows[0];
}

/**
 * Deletes a record by ID from the specified table.
 * @param {string} tableName - The name of the table.
 * @param {number} id - The ID of the record to delete.
 * @returns {Promise<void>}
 */
async function deleteRecordById(tableName, id) {
    const query = `DELETE FROM ${tableName} WHERE id = $1 RETURNING *`;
    const result = await pool.query(query, [id]);
    if (result.rows.length === 0) {
        throw new Error('Record not found');
    }
}

// Exporting the functions for use in other files
module.exports = {
    createRecord,
    readAllRecords,
    getRecordById,
    updateRecordById,
    deleteRecordById,
    pool,
};
