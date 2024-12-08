const dotenv = require('dotenv');
dotenv.config();

const getEnv = function(key, defaultValue) {
    const value = process.env[key] || defaultValue;

    if (value === undefined) {
        throw new Error('Environnement key ' + key + ' is missing');
    }

    return value;
}

const NODE_ENV = getEnv('NODE_ENV', 'developpement');
const PORT = getEnv('PORT', '4004');

const FRONTEND_URL = getEnv('FRONTEND_URL', 'http://127.0.0.1');
const FRONTEND_PORT = getEnv('FRONTEND_PORT', '5173');

module.exports = {
    NODE_ENV: NODE_ENV,
    PORT: PORT,
    FRONTEND_URL: FRONTEND_URL,
    FRONTEND_PORT: FRONTEND_PORT
};
