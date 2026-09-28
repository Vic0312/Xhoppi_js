import Produto from '../models/Produto.js';

export const getCadastrarProduto = (req, res) => {
    res.render('cadastrar-produto', { produto: null });
};

export const getListarProdutos = async (req, res) => {
    try {
        const produtos = await Produto.find();
        res.render('ver-produto', { produtos });
    } catch (error) {
        res.status(500).send('Erro ao listar produtos.');
    }
};

export const getEditarProduto = async (req, res) => {
    try {
        const produto = await Produto.findById(req.params.id);
        if (produto) res.render('cadastrar-produto', { produto });
        else res.redirect('/produtos');
    } catch (error) {
        res.redirect('/produtos');
    }
};

export const getDeletarProduto = async (req, res) => {
    try {
        await Produto.findByIdAndDelete(req.params.id);
        res.redirect('/produtos');
    } catch (error) {
        res.redirect('/produtos');
    }
};

export const postSalvarProduto = async (req, res) => {
    try {
        const { id_prod, inputNomeProd, inputFabricanteProd, inputDescricaoProd, inputValorProd, inputQtdProd } = req.body;

        if (id_prod) {
            // Atualizar existente
            const dadosAtualizados = {
                nome: inputNomeProd,
                fabricante: inputFabricanteProd,
                descricao: inputDescricaoProd,
                valor: Number(inputValorProd),
                quantidade: Number(inputQtdProd)
            };
            if (req.file) dadosAtualizados.foto_prod = req.file.filename;

            await Produto.findByIdAndUpdate(id_prod, dadosAtualizados);
        } else {
            // Novo cadastro
            const novoProduto = new Produto({
                nome: inputNomeProd,
                fabricante: inputFabricanteProd,
                descricao: inputDescricaoProd,
                valor: Number(inputValorProd),
                quantidade: Number(inputQtdProd),
                foto_prod: req.file ? req.file.filename : 'default.png'
            });
            await novoProduto.save();
        }

        res.redirect('/produtos');
    } catch (error) {
        res.status(500).send('Erro ao salvar produto.');
    }
};