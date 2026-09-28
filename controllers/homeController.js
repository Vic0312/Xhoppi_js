import Produto from '../models/Produto.js';
import fs from 'fs';
import path from 'path';
import __dirname from '../utils/pathUtils.js';

export const getHome = async (req, res) => {
    try {
        const homeHtmlPath = path.join(__dirname, 'views', 'home.html');
        let html = fs.readFileSync(homeHtmlPath, 'utf-8');

        // Busca produtos no MongoDB e aplica amostragem aleatória (Agregação MongoDB)
        const produtosExibicao = await Produto.aggregate([{ $sample: { size: 10 } }]);

        let produtosCardsHtml = '';
        if (produtosExibicao.length === 0) {
            produtosCardsHtml = '<p style="padding: 20px;">Nenhum produto cadastrado.</p>';
        } else {
            produtosCardsHtml = produtosExibicao.map((p) => {
                const valorFormatado = parseFloat(p.valor).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
                return `
                    <a href="#" class="produto-item-grid">
                        <section>
                            <img src="/imgprod/${p.foto_prod}" alt="${p.nome}">
                            <p>${p.nome}</p>
                            <section class="produto-item-info">
                                <p id="valor">${valorFormatado}</p>
                                <p id="disponiveis">${p.quantidade} disponíveis</p>
                            </section>
                        </section>
                    </a>`;
            }).join('');
        }

        const regExpSubstituicao = /<section class="conteudo-home-descobertas-produto">[\s\S]*?<\/section>\s*<\/section>/;
        const novoBlocoDescobertas = `<section class="conteudo-home-descobertas-produto">\n${produtosCardsHtml}\n            </section>\n        </section>`;

        res.send(html.replace(regExpSubstituicao, novoBlocoDescobertas));
    } catch (error) {
        res.status(500).send('Erro ao carregar a página inicial.');
    }
};