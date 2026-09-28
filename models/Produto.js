import mongoose from 'mongoose';

const produtoSchema = new mongoose.Schema({
    nome: { type: String, required: true },
    fabricante: { type: String },
    descricao: { type: String },
    valor: { type: Number, required: true },
    quantidade: { type: Number, required: true },
    foto_prod: { type: String, default: 'default.png' }
}, { timestamps: true });

export default mongoose.model('Produto', produtoSchema);