import mongoose from 'mongoose';

const funcionarioSchema = new mongoose.Schema({
    cpf: { type: String, required: true, unique: true },
    nome: { type: String, required: true },
    sobrenome: { type: String, required: true },
    dataNasc: { type: String, required: true },
    telefone: { type: String },
    cargo: { type: String },
    salario: { type: Number },
    email: { type: String, required: true },
    senha: { type: String, required: true },
    foto_perfil: { type: String, default: 'default.png' }
}, { timestamps: true });

const FuncionarioModel = mongoose.model('Funcionario', funcionarioSchema);

export default class Funcionario {
    constructor(cpf, nome, sobrenome, dataNasc, telefone, cargo, salario, email, senha, foto_perfil = 'default.png') {
        this.cpf = cpf;
        this.nome = nome;
        this.sobrenome = sobrenome;
        this.dataNasc = dataNasc;
        this.telefone = telefone;
        this.cargo = cargo;
        this.salario = salario;
        this.email = email;
        this.senha = senha;
        this.foto_perfil = foto_perfil;
    }

    
    static async salvar(dados) {
        const novoFuncionario = new FuncionarioModel(dados);
        return await novoFuncionario.save();
    }

    static async buscarTodos() {
        return await FuncionarioModel.find();
    }

    static async buscarPorCpf(cpf) {
        return await FuncionarioModel.findOne({ cpf });
    }

    static async atualizar(cpf, dados) {
        return await FuncionarioModel.findOneAndUpdate({ cpf }, dados, { new: true });
    }

    static async deletar(cpf) {
        return await FuncionarioModel.findOneAndDelete({ cpf });
    }
}