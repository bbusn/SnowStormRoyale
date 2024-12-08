const { FRONTEND_URL, FRONTEND_PORT } = require('./env');

const CORS_OPTIONS = {
    origin: `${FRONTEND_URL}:${FRONTEND_PORT}`,
    credentials: true,
};

module.exports = CORS_OPTIONS;
    