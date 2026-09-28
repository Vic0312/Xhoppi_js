import express from 'express';
import __dirname from '../utils/pathUtils.js';
import path from 'path';
import fs from 'fs';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import morgan from 'morgan';
import multer from 'multer';

// Configuration Multer para Fotos
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        let pastaDestino = path.join(__dirname, 'assets', 'img');

        if (req.originalUrl.includes('/cliente')) {
            pastaDestino = path.join(__dirname, 'assets', 'imgcliente');
        } else if (req.originalUrl.includes('/funcionario')) {
            pastaDestino = path.join(__dirname, 'assets', 'imgfunc');
        } else if (req.originalUrl.includes('/produto')) {
            pastaDestino = path.join(__dirname, 'assets', 'imgprod');
        }

        if (!fs.existsSync(pastaDestino)) {
            fs.mkdirSync(pastaDestino, { recursive: true });
        }

        cb(null, pastaDestino);
    },
    filename: (req, file, cb) => {
        const sufixoUnico = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, sufixoUnico + path.extname(file.originalname));
    }
});

export const upload = multer({ storage: storage });


const staticMiddleware = express.static(path.join(__dirname, 'assets'));
const urlencodedMiddleware = express.urlencoded({ extended: true });
const jsonMiddleware = express.json();
const securityMiddleware = helmet({ contentSecurityPolicy: false });
const compressionMiddleware = compression();

const rateLimitMiddleware = rateLimit({
    windowMs: 10 * 60 * 1000,
    max: 100,
    message: 'Muitas requisições, tente novamente em 10 minutos.'
});

const logFile = fs.createWriteStream(path.join(__dirname, 'access.log'), { flags: 'a' });
const morganMiddleware = morgan('combined', { stream: logFile });

export {
    staticMiddleware,
    urlencodedMiddleware,
    jsonMiddleware,
    securityMiddleware,
    compressionMiddleware,
    rateLimitMiddleware,
    morganMiddleware
};