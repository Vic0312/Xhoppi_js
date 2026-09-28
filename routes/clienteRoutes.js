import express from 'express';
import { upload } from '../middlewares/middlewares.js';
import {
    getCadastrarCliente,
    getListarClientes,
    getEditarCliente,
    getDeletarCliente,
    postSalvarCliente
} from '../controllers/clienteController.js';

const router = express.Router();

router.get('/clientes/cadastrar', getCadastrarCliente);
router.get('/clientes/visualizar', getListarClientes);
router.get('/cliente/editar/:cpf', getEditarCliente);
router.get('/cliente/deletar/:cpf', getDeletarCliente);
router.post('/cliente/salvar', upload.single('inputFoto'), postSalvarCliente);

export default router;