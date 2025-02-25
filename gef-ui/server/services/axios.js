const { default: axios } = require('axios');
require('dotenv').config();

const { PORTAL_API_URL, PORTAL_API_KEY } = process.env;
const VERSION = 'v1';

module.exports = axios.create({
  baseURL: `${PORTAL_API_URL}/${VERSION}`,
  timeout: 15 * 1000, // timeout after max 15 seconds
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
    'x-api-key': PORTAL_API_KEY,
  },
});
