import { HttpStatusCode } from '../constants/http';

class AppError extends Error {
    public statusCode: HttpStatusCode;

    constructor(statusCode: HttpStatusCode, message: string) {
        super(message);
        this.statusCode = statusCode;
    }
}

export default AppError;