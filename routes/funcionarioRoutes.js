import express from 'express';
import { upload } from '../middlewares/middlewares.js';
import {
    getCadastrarFuncionarioPublico,
    postSalvarFuncionarioPublico,
    getCadastrarFuncionario,
    getListarFuncionarios,
    getEditarFuncionario,
    getDeletarFuncionario,
    postSalvarFuncionario
} from '../controllers/funcionarioController.js';

const router = express.Router();

router.get('/funcionario/cadastrar-publico', getCadastrarFuncionarioPublico);
router.post('/funcionario/cadastrar-publico', upload.single('inputFoto'), postSalvarFuncionarioPublico);

router.get('/funcionario/cadastrar', getCadastrarFuncionario);
router.post('/funcionario/salvar', upload.single('inputFoto'), postSalvarFuncionario);
router.get('/funcionarios/visualizar', getListarFuncionarios);
router.get('/funcionario/editar/:cpf', getEditarFuncionario);
router.get('/funcionario/deletar/:cpf', getDeletarFuncionario);

export default router;