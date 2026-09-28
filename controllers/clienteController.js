import Cliente from '../models/Cliente.js';

export const getCadastrarCliente = (req, res) => {
    res.render('cadastrar-cliente', { cliente: null });
};

export const getListarClientes = async (req, res) => {
    try {
        const clientes = await Cliente.find();
        res.render('visualizar-cliente', { clientes });
    } catch (error) {
        res.status(500).send('Erro ao carregar clientes.');
    }
};

export const getEditarCliente = async (req, res) => {
    try {
        const cliente = await Cliente.findOne({ cpf: req.params.cpf });
        if (cliente) res.render('cadastrar-cliente', { cliente });
        else res.redirect('/clientes/visualizar');
    } catch (error) {
        res.redirect('/clientes/visualizar');
    }
};

export const getDeletarCliente = async (req, res) => {
    try {
        await Cliente.findOneAndDelete({ cpf: req.params.cpf });
        res.redirect('/clientes/visualizar');
    } catch (error) {
        res.redirect('/clientes/visualizar');
    }
};

export const postSalvarCliente = async (req, res) => {
    try {
        const { cpfOriginal, nome, sobrenome, cpf, dataNascimento, telefone, email, senha } = req.body;

        if (cpfOriginal) {
            const dados = { cpf, nome, sobrenome, dataNasc: dataNascimento, telefone, email, senha };
            if (req.file) dados.foto_perfil = req.file.filename;

            await Cliente.findOneAndUpdate({ cpf: cpfOriginal }, dados);
        } else {
            const novoCliente = new Cliente({
                cpf, nome, sobrenome, dataNasc: dataNascimento, telefone, email, senha,
                foto_perfil: req.file ? req.file.filename : 'default.png'
            });
            await novoCliente.save();
        }

        res.redirect('/clientes/visualizar');
    } catch (error) {
        res.status(500).send('Erro ao salvar cliente.');
    }
};