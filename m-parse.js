// Server Authentication
// Note: not a singleton, could be required twice by node.js
console.log('Using parsedb at ' + process.env.PARSE_DB_APP_URL)
const Parse = require('parse/node')
Parse.jsKey = process.env.PARSE_DB_APP_JSKEY
Parse.serverURL = process.env.PARSE_DB_APP_URL
Parse.initialize(process.env.PARSE_DB_APP_ID, process.env.PARSE_DB_APP_JSKEY);
Parse.masterKey = process.env.PARSE_DB_APP_MASTERKEY;
module.exports = Parse
