import { ErrorRequestHandler } from "express";
import { NODE_ENV } from "../constants/env";
import { BAD_REQUEST, INTERNAL_SERVER_ERROR } from "../constants/http"
import AppError from "../classes/AppError";
import { INTERNAL_SERVER } from "../constants/messages";
import { createLog } from "../services/log";

const errorMiddleware: ErrorRequestHandler = (error, req, res, next) => { 
    if (NODE_ENV == 'developpement') console.log(error); 

    if (error.name === 'SequelizeValidationError') {
        res.status(BAD_REQUEST).json({ message: error.errors.map((e: { message: any; }) => e.message).join(', '), status: 'error' });
        return
    }

    if (error instanceof AppError) {
        if (error.statusCode === INTERNAL_SERVER_ERROR) createLog({ status: 'error', message: error.message, source: 'errorMiddleware' });
        res.status(error.statusCode).json({ message: error.message, status: 'error' }); 
        return
    }

    createLog({ status: 'error', message: error.message, source: 'errorMiddleware' });
    
    res.status(INTERNAL_SERVER_ERROR).json({ message: INTERNAL_SERVER, status: 'error' });
    return 
}

export default errorMiddleware;