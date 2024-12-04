import { Router } from 'express';
import { getLatestLogsHandler, getLogsHandler } from '../controllers/log';

const logsRoutes = Router();

// Prefix: /log
logsRoutes.get('/', getLogsHandler)
logsRoutes.get('/latest', getLatestLogsHandler)

export default logsRoutes;