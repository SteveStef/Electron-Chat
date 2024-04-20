const BsonDB = require('bsondb-api');
require('dotenv').config();

const db = new BsonDB(process.env.DATABASE_CONN);
module.exports = db;
