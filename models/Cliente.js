import mongoose from 'mongoose';

const clienteSchema = new mongoose.Schema({
    cpf: { type: String, required: true, unique: true },
    nome: { type: String, required: true },
    sobrenome: { type: String, required: true },
    dataNasc: { type: String, required: true },
    telefone: { type: String },
    email: { type: String, required: true },
    senha: { type: String, required: true },
    foto_perfil: { type: String, default: 'default.png' }
}, { timestamps: true });

const ClienteModel = mongoose.model('Cliente', clienteSchema);

export default class Cliente {
    constructor(cpf, nome, sobrenome, dataNasc, telefone, email, senha, foto_perfil = 'default.png') {
        this.cpf = cpf;
        this.nome = nome;
        this.sobrenome = sobrenome;
        this.dataNasc = dataNasc;
        this.telefone = telefone;
        this.email = email;
        this.senha = senha;
        this.foto_perfil = foto_perfil;
    }

    static async salvar(dados) {
        const novoCliente = new ClienteModel(dados);
        return await novoCliente.save();
    }

    static async buscarTodos() {
        return await ClienteModel.find();
    }

    static async buscarPorCpf(cpf) {
        return await ClienteModel.findOne({ cpf });
    }

    static async atualizar(cpf, dados) {
        return await ClienteModel.findOneAndUpdate({ cpf }, dados, { new: true });
    }

    static async deletar(cpf) {
        return await ClienteModel.findOneAndDelete({ cpf });
    }
}