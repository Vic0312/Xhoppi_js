import express from 'express';
import { upload } from '../middlewares/middlewares.js';
import {
    getCadastrarProduto,
    getListarProdutos,
    getEditarProduto,
    getDeletarProduto,
    postSalvarProduto
} from '../controllers/produtoController.js';

const router = express.Router();

router.get('/produto/cadastrar', getCadastrarProduto);
router.get('/produtos', getListarProdutos);
router.get('/produto/editar/:id', getEditarProduto);
router.get('/produto/deletar/:id', getDeletarProduto);
router.post('/produto/salvar', upload.single('inputFoto'), postSalvarProduto);

export default router;