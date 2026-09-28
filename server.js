import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import __dirname from './utils/pathUtils.js';

// Importação dos Middlewares[cite: 16]
import {
    staticMiddleware,
    urlencodedMiddleware,
    jsonMiddleware,
    securityMiddleware,
    compressionMiddleware,
    rateLimitMiddleware,
    morganMiddleware
} from './middlewares/middlewares.js';

// Importação das Rotas
import authRoutes from './routes/authRoutes.js';
import homeRoutes from './routes/homeRoutes.js';
import produtoRoutes from './routes/produtoRoutes.js';
import clienteRoutes from './routes/clienteRoutes.js';
import funcionarioRoutes from './routes/funcionarioRoutes.js';

// Carrega variáveis de ambiente[cite: 16]
dotenv.config();

// Conecta ao MongoDB
connectDB();

const app = express();
const port = process.env.PORT || 3000;

// Configuração EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Registra Middlewares Globais
app.use(staticMiddleware);
app.use(urlencodedMiddleware);
app.use(jsonMiddleware);
app.use(securityMiddleware);
app.use(compressionMiddleware);
app.use(rateLimitMiddleware);
app.use(morganMiddleware);

// Registra as Rotas
app.use('/', authRoutes);
app.use('/', homeRoutes);
app.use('/', produtoRoutes);
app.use('/', clienteRoutes);
app.use('/', funcionarioRoutes);

// Inicializa o Servidor
app.listen(port, () => {
    console.log(`Servidor ativo rodando na porta ${port}`);
});