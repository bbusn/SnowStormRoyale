import assert from 'node:assert'
import { HttpStatusCode } from '../constants/http'
import AppError from '../classes/AppError'

type AppAssert = (
    condition: any,
    httpStatusCode: HttpStatusCode,
    message: string,
) => asserts condition;

const appAssert: AppAssert = (condition, httpStatusCode, message) => 
    assert(condition, new AppError(httpStatusCode, message));

export default appAssert;