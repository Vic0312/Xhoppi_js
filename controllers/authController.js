import Funcionario from '../models/Funcionario.js';
import path from 'path';
import __dirname from '../utils/pathUtils.js';

export const getLogin = (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'login.html'));
};

export const getRecuperarSenha = (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'recuperar-senha.html'));
};

export const postLogin = async (req, res) => {
    try {
        const { user, senha } = req.body;
        const funcionario = await Funcionario.findOne({
            $or: [{ email: user }, { cpf: user }],
            senha: senha
        });

        if (funcionario) {
            res.redirect('/home');
        } else {
            res.send('<h1>Funcionário ou senha inválidos!</h1><a href="/login">Tentar novamente</a>');
        }
    } catch (error) {
        res.status(500).send('Erro no servidor ao autenticar.');
    }
};

export const postRecuperarSenha = (req, res) => {
    const { inputEmailLog } = req.body;
    res.send(`<h1>Instruções enviadas para ${inputEmailLog}!</h1><a href="/login">Voltar ao Login</a>`);
};