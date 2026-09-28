import express from 'express';
import { getLogin, getRecuperarSenha, postLogin, postRecuperarSenha } from '../controllers/authController.js';

const router = express.Router();

router.get('/', getLogin);
router.get('/login', getLogin);
router.post('/login', postLogin);
router.get('/recuperar-senha', getRecuperarSenha);
router.post('/recuperar-senha', postRecuperarSenha);

export default router;