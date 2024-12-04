import { Op } from "sequelize";
import Log from "../models/Log";
import appAssert from '../utils/appAssert'
import { LOG_STATUS_MUST_BE_VALUES, MISSING_FIELDS } from "../constants/messages";
import { BAD_REQUEST } from "../constants/http";

type CreateLogParams = {
    status: string,
    message: string,
    source: string,
}

export const createLog = async ({ status, source, message }: CreateLogParams) => {
    appAssert(status && source && message, BAD_REQUEST, MISSING_FIELDS);

    appAssert(['success', 'error', 'warning', 'info'].includes(status), BAD_REQUEST, LOG_STATUS_MUST_BE_VALUES);

    await Log.create({
        status,
        message,
        source,
    });
}

export const getLogs = async () => {
    return await Log.findAll({
        order: [['createdAt', 'DESC']],
    });
}

export const getLatestLogs = async () => {
    return await Log.findAll({
        order: [['createdAt', 'DESC']],
        limit: 10,
    });
}

export const deleteOldLogs = async () => {
    const logs = await Log.findAll({
        order: [['createdAt', 'DESC']],
        offset: 2000,
    });

    if (!logs.length) {
        return;
    }

    await Log.destroy({
        where: {
            id: {
                [Op.in]: logs.map(log => log.id),
            },
        },
    });

    createLog({ status: 'success', message: 'Logs stored before 2 thousands latest deleted, checking again in 30m', source: 'deleteOldLogs' });
}