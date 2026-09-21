import express from 'express';
import path from 'path';
import fs from 'fs';
import morgan from 'morgan';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import multer from 'multer';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = 3000;

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        let pastaDestino = path.join(__dirname, 'assets', 'img');

        if (req.originalUrl.includes('/cliente')) {
            pastaDestino = path.join(__dirname, 'assets', 'imgcliente');
        } else if (req.originalUrl.includes('/funcionario')) {
            pastaDestino = path.join(__dirname, 'assets', 'imgfunc');
        } else if (req.originalUrl.includes('/produto')) {
            pastaDestino = path.join(__dirname, 'assets', 'imgprod');
        }

        if (!fs.existsSync(pastaDestino)) {
            fs.mkdirSync(pastaDestino, { recursive: true });
        }

        cb(null, pastaDestino);
    },
    filename: (req, file, cb) => {
        const sufixoUnico = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, sufixoUnico + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(express.static(path.join(__dirname, 'assets')));

const limiter = rateLimit({
    windowMs: 10 * 60 * 1000,
    max: 100,
    message: "Muitas requisições enviadas. Tente novamente mais tarde."
});
app.use(limiter);

const logFile = fs.createWriteStream(path.join(__dirname, 'acess.log'), { flags: 'a' });
app.use(morgan('combined', { stream: logFile }));

app.use(
    helmet({
        contentSecurityPolicy: false
    })
);

const lerJson = (caminho) => {
    if (!fs.existsSync(caminho)) {
        fs.writeFileSync(caminho, JSON.stringify([]));
        return [];
    }
    const conteudo = fs.readFileSync(caminho, 'utf-8');
    return conteudo ? JSON.parse(conteudo) : [];
};

const escreverJson = (caminho, dados) => {
    fs.writeFileSync(caminho, JSON.stringify(dados, null, 2), 'utf-8');
};

const clientesPath = path.join(__dirname, 'clientes.json');
const funcionariosPath = path.join(__dirname, 'funcionarios.json');
const produtosPath = path.join(__dirname, 'produtos.json');


app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'login.html'));
});

app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'login.html'));
});

app.get('/home', (req, res) => {
    const homeHtmlPath = path.join(__dirname, 'views', 'home.html');
    let html = fs.readFileSync(homeHtmlPath, 'utf-8');

    const produtos = lerJson(produtosPath);

    const produtosEmbaralhados = [...produtos].sort(() => 0.5 - Math.random());

    const produtosExibicao = produtosEmbaralhados.slice(0, 10);

    let produtosCardsHtml = '';

    if (produtosExibicao.length === 0) {
        produtosCardsHtml = '<p style="padding: 20px; font-weight: bold;">Nenhum produto cadastrado no momento.</p>';
    } else {
        produtosCardsHtml = produtosExibicao.map((p) => {
            const valorFormatado = parseFloat(p.valor).toLocaleString('pt-BR', {
                style: 'currency',
                currency: 'BRL'
            });

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
                </a>
            `;
        }).join('');
    }

    const regExpSubstituicao = /<section class="conteudo-home-descobertas-produto">[\s\S]*?<\/section>\s*<\/section>/;
    const novoBlocoDescobertas = `<section class="conteudo-home-descobertas-produto">\n${produtosCardsHtml}\n            </section>\n        </section>`;

    html = html.replace(regExpSubstituicao, novoBlocoDescobertas);

    res.send(html);
});


app.get('/clientes/cadastrar', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'cadastrar-cliente.html'));
});

app.get('/funcionario/cadastrar', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'cadastrar-funcionario.html'));
});

app.get('/produto/cadastrar', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'cadastrar-produto.html'));
});


app.get('/clientes', (req, res) => {
    const clientes = lerJson(clientesPath);
    res.json(clientes);
});


app.post('/login', (req, res) => {
    const { user, senha } = req.body;
    const funcionarios = lerJson(funcionariosPath);

    const funcionarioEncontrado = funcionarios.find(
        (f) => (f.email === user || f.cpf === user) && f.senha === senha
    );

    if (funcionarioEncontrado) {
        res.redirect('/home');
    } else {
        res.send('<h1>Funcionário ou senha inválidos!</h1><a href="/login">Tentar novamente</a>');
    }
});

app.post('/clientes', upload.single('inputFoto'), (req, res) => {
    const { nome, sobrenome, cpf, dataNascimento, telefone, email, senha } = req.body;
    const clientes = lerJson(clientesPath);

    const novoCliente = {
        cpf,
        nome,
        sobrenome,
        dataNasc: dataNascimento,
        telefone,
        email,
        senha,
        foto_perfil: req.file ? req.file.filename : 'default.png'
    };

    clientes.push(novoCliente);
    escreverJson(clientesPath, clientes);

    res.redirect('/home');
});

app.post('/funcionario/cadastrar', upload.single('inputFoto'), (req, res) => {
    const {
        inputNomeFunc,
        inputSobrenomeFunc,
        inputCPFFunc,
        inputDataNascFunc,
        inputTelefoneFunc,
        inputCargoFunc,
        inputSalarioFunc,
        inputEmailFunc,
        inputSenha
    } = req.body;

    const funcionarios = lerJson(funcionariosPath);

    const novoFuncionario = {
        cpf: inputCPFFunc,
        nome: inputNomeFunc,
        sobrenome: inputSobrenomeFunc,
        dataNasc: inputDataNascFunc,
        telefone: inputTelefoneFunc,
        cargo: inputCargoFunc,
        salario: inputSalarioFunc,
        email: inputEmailFunc,
        senha: inputSenha,
        foto_perfil: req.file ? req.file.filename : 'default.png'
    };

    funcionarios.push(novoFuncionario);
    escreverJson(funcionariosPath, funcionarios);

    res.redirect('/home');
});

app.post('/produto/cadastrar', upload.single('inputFoto'), (req, res) => {
    const {
        inputNomeProd,
        inputFabricanteProd,
        inputDescricaoProd,
        inputValorProd,
        inputQtdProd
    } = req.body;

    const produtos = lerJson(produtosPath);

    const maiorId = produtos.reduce((max, p) => (p.id_prod > max ? p.id_prod : max), 0);

    const novoProduto = {
        id_prod: maiorId + 1,
        nome: inputNomeProd,
        fabricante: inputFabricanteProd,
        descricao: inputDescricaoProd,
        valor: inputValorProd,
        quantidade: Number(inputQtdProd),
        foto_prod: req.file ? req.file.filename : 'default.png'
    };

    produtos.push(novoProduto);
    escreverJson(produtosPath, produtos);

    res.redirect('/home');
});


app.listen(port, () => {
    console.log(`Servidor ativo rodando em http://localhost:${port}`);
});