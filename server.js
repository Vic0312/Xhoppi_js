import express from 'express'
import path from 'path'
import fs from 'fs';
import morgan from 'morgan';
import helmet from 'helmet'; 
import rateLimit from 'express-rate-limit';

import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express()
const port = 3000

app.use(express.urlencoded({extended: true}))

app.use(express.static(path.join(__dirname, 'assets')))

const limiter = rateLimit({
    windowMs: 10 * 60 * 1000,
    max: 5,
    message: "Cai fora!! To esperto!! :("
})

app.use(limiter);

const logFile = fs.createWriteStream(path.join(__dirname, 'acess.log'), {flags:'a'});
app.use(morgan('combined', { stream: logFile}));

app.use(helmet());

app.get('/', (req, res) => {
    const filePath = path.join(__dirname, 'view', 'login.html');
    res.sendFile(filePath);
})

app.get('/home', (req, res) => {
    const filePath = path.join(__dirname, 'view', 'home.html');
    res.sendFile(filePath);
})

app.post('/login', (req, res) => {
    const { user, senha } = req.body;

    const usuariosPath = path.join(__dirname, 'usuarios.json');

    // Aqui lê o arquivo JSON
    fs.readFile(usuariosPath, 'utf-8', (err, data) => {
        if (err) {
            return res.send('Erro ao ler o arquivo de credenciais.');
        }

        const usuarios = JSON.parse(data);

        const usuarioEncontrado = usuarios.find(u => u.user === user && u.senha === senha);

        if (usuarioEncontrado) {
            res.redirect('/home');
        } else {
            res.send('<h1>Usuário ou senha inválidos!</h1>');
        }
    });
});

app.listen(port, () => {
    console.log(`Servidor ativo rodando na porta ${port}`);
})