import xss from "xss";
import catchErrors from '../utils/catchErrors'
import { getLatestLogs, getLogs } from '../services/log';
import { OK } from "../constants/http";
import { GOT_LOGS, GOT_LATEST_LOGS } from "../constants/messages";

export const getLogsHandler = catchErrors(
    async (req, res) => {
        const logs = await getLogs();

        return res.status(OK).json({ message: GOT_LOGS, status: 'success', logs });
    }
)

export const getLatestLogsHandler = catchErrors(
    async (req, res) => {
        const logs = await getLatestLogs();

        return res.status(OK).json({ message: GOT_LATEST_LOGS, status: 'success', logs });
    }
)