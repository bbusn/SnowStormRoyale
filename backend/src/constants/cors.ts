import { FRONTEND_PORT, FRONTEND_URL } from "./env";

export const corsOptions = {
    origin: `${FRONTEND_URL}:${FRONTEND_PORT}`,
    credentials: true,
};