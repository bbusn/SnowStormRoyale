import express, { Response } from 'express';
import { Server, Socket } from 'socket.io';
import http from 'http';
import helmet from 'helmet';
import sequelize from './config/db';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import errorMiddleware from './middleware/error';
import { deleteOldLogs, createLog } from './services/log';
import { corsOptions } from './constants/cors';
import { NODE_ENV, PORT } from './constants/env';
import { dateWithZeros } from './utils/formatDate'


/* __________________ Connect and Synchronize database __________________ */
sequelize.authenticate()
    .then(() => {
        console.log(`\x1b[0mDatabase connected...\x1b[0m`)
    })
    .catch(err => {
        throw new Error(`Error connecting to database : ${err}`);
    });
    
sequelize.sync({ force: false })
    .then(() => {
        createLog({ status: 'info', source: 'process', message: 'Server started at ' + dateWithZeros(new Date()) });
        deleteOldLogs();

        /* _______________________ Jobs _______________________ */
        setInterval(deleteOldLogs, 1000 * 60 * 30);
    }).catch(err => {
        throw new Error(`Error syncing database : ${err}`);
    });


const app = express()

const httpServer = http.createServer(app);
const io = new Server(httpServer, { cors: corsOptions, serveClient: false });

io.on('connect', (socket: Socket) => {
    console.log('Connected : ' + socket.id);
}) 


/* ___ Security ___ */
if (NODE_ENV == 'production') {
    app.set('trust proxy', true);
}

app.disable("x-powered-by");
app.use(helmet());
app.use(cors(corsOptions));
app.use(express.static('public'));

/* ___ Parsers ___ */
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

[`exit`, `SIGINT`, `SIGUSR1`, `SIGUSR2`, `uncaughtException`, `SIGTERM`].forEach((eventType) => {
    process.on(eventType, async () => {
        await createLog({ status: 'info', source: 'process', message: `Server stopped at ${dateWithZeros(new Date())} : ${eventType}`});
        process.exitCode = 1;
    });
})

/* ___ Error Middleware ___ */
app.use(errorMiddleware);

/* __________________ Http Server __________________ */
httpServer.listen(PORT, () => {
    console.clear();
    console.log(`\x1b[90m_________________________ SERVER __________________________________\x1b[0m`);
    console.log("\x1b[90m..................................................................\x1b[0m");
    console.log(`\x1b[90m- Server is running on port ${PORT} on ${NODE_ENV} environnement \x1b[0m`);
    console.log("\x1b[90m..................................................................\x1b[0m");
    console.log(`\x1b[90m___________________________________________________________________\x1b[0m`);
})