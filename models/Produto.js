import mongoose from 'mongoose';

const produtoSchema = new mongoose.Schema({
    nome: { type: String, required: true },
    fabricante: { type: String },
    descricao: { type: String },
    valor: { type: Number, required: true },
    quantidade: { type: Number, required: true },
    foto_prod: { type: String, default: 'default.png' }
}, { timestamps: true });

const ProdutoModel = mongoose.model('Produto', produtoSchema);

export default class Produto {
    constructor(nome, fabricante, descricao, valor, quantidade, foto_prod = 'default.png') {
        this.nome = nome;
        this.fabricante = fabricante;
        this.descricao = descricao;
        this.valor = valor;
        this.quantidade = quantidade;
        this.foto_prod = foto_prod;
    }

    static async salvar(dados) {
        const novoProduto = new ProdutoModel(dados);
        return await novoProduto.save();
    }

    static async buscarTodos() {
        return await ProdutoModel.find();
    }

    static async buscarPorId(id) {
        return await ProdutoModel.findById(id);
    }

    static async atualizar(id, dados) {
        return await ProdutoModel.findByIdAndUpdate(id, dados, { new: true });
    }

    static async deletar(id) {
        return await ProdutoModel.findByIdAndDelete(id);
    }
}