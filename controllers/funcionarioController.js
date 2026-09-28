import Funcionario from '../models/Funcionario.js';

// Exibe a tela PÚBLICA (para quem clica no login)
export const getCadastrarFuncionarioPublico = (req, res) => {
    res.render('cadastrar-funcionario-publico');
};

// Processa o cadastro público e redireciona para a tela de Login
export const postSalvarFuncionarioPublico = async (req, res) => {
    try {
        const { 
            inputNomeFunc, 
            inputSobrenomeFunc, 
            inputCPFFunc, 
            inputDataNascFunc, 
            inputTelefoneFunc, 
            inputCargoFunc, 
            inputSalarioFunc, 
            inputEmailFunc, 
            inputSenha 
        } = req.body;

        const novoFuncionario = new Funcionario({
            cpf: inputCPFFunc,
            nome: inputNomeFunc,
            sobrenome: inputSobrenomeFunc,
            dataNasc: inputDataNascFunc,
            telefone: inputTelefoneFunc,
            cargo: inputCargoFunc,
            salario: Number(inputSalarioFunc) || 0,
            email: inputEmailFunc,
            senha: inputSenha,
            foto_perfil: req.file ? req.file.filename : 'default.png'
        });

        await novoFuncionario.save();
        res.redirect('/login');
    } catch (error) {
        console.error('Erro no cadastro público de funcionário:', error);
        res.status(500).send('Erro ao cadastrar funcionário. Verifique se o CPF já está em uso.');
    }
};

// Exibe a tela INTERNA (dentro do painel com menu)
export const getCadastrarFuncionario = (req, res) => {
    res.render('cadastrar-funcionario', { funcionario: null });
};

export const getListarFuncionarios = async (req, res) => {
    try {
        const funcionarios = await Funcionario.find();
        res.render('visualizar-funcionario', { funcionarios });
    } catch (error) {
        res.status(500).send('Erro ao carregar funcionários.');
    }
};

export const getEditarFuncionario = async (req, res) => {
    try {
        const funcionario = await Funcionario.findOne({ cpf: req.params.cpf });
        if (funcionario) res.render('cadastrar-funcionario', { funcionario });
        else res.redirect('/funcionarios/visualizar');
    } catch (error) {
        res.redirect('/funcionarios/visualizar');
    }
};

export const getDeletarFuncionario = async (req, res) => {
    try {
        await Funcionario.findOneAndDelete({ cpf: req.params.cpf });
        res.redirect('/funcionarios/visualizar');
    } catch (error) {
        res.redirect('/funcionarios/visualizar');
    }
};

export const postSalvarFuncionario = async (req, res) => {
    try {
        const { cpfOriginal, inputNomeFunc, inputSobrenomeFunc, inputCPFFunc, inputDataNascFunc, inputTelefoneFunc, inputCargoFunc, inputSalarioFunc, inputEmailFunc, inputSenha } = req.body;

        if (cpfOriginal) {
            const dados = {
                cpf: inputCPFFunc, nome: inputNomeFunc, sobrenome: inputSobrenomeFunc,
                dataNasc: inputDataNascFunc, telefone: inputTelefoneFunc, cargo: inputCargoFunc,
                salario: Number(inputSalarioFunc) || 0, email: inputEmailFunc, senha: inputSenha
            };
            if (req.file) dados.foto_perfil = req.file.filename;

            await Funcionario.findOneAndUpdate({ cpf: cpfOriginal }, dados);
        } else {
            const novoFuncionario = new Funcionario({
                cpf: inputCPFFunc, nome: inputNomeFunc, sobrenome: inputSobrenomeFunc,
                dataNasc: inputDataNascFunc, telefone: inputTelefoneFunc, cargo: inputCargoFunc,
                salario: Number(inputSalarioFunc) || 0, email: inputEmailFunc, senha: inputSenha,
                foto_perfil: req.file ? req.file.filename : 'default.png'
            });
            await novoFuncionario.save();
        }

        res.redirect('/funcionarios/visualizar');
    } catch (error) {
        res.status(500).send('Erro ao salvar funcionário.');
    }
};