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

export default mongoose.model('Cliente', clienteSchema);