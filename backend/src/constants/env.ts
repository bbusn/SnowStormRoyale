import dotenv from 'dotenv'; 
dotenv.config();

const getEnv = (key: string, defaultValue?: string): string => {
    const value = process.env[key] || defaultValue;

    if (value === undefined) {
        throw new Error(`Environnement key ${key} is missing`);
    }

    return value
}

export const NODE_ENV = getEnv('NODE_ENV', 'developpement');
export const PORT = getEnv('PORT', '4004');

export const FRONTEND_URL = getEnv('FRONTEND_URL', 'http://127.0.0.1')
export const FRONTEND_PORT = getEnv('FRONTEND_PORT', '5173')
