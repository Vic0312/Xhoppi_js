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

// Configuração do motor de visualização EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Configuração do Multer com destinos separados
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

// Middlewares Globais
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'assets')));

// Limite de requisições
const limiter = rateLimit({
    windowMs: 10 * 60 * 1000,
    max: 100,
    message: "Muitas requisições enviadas. Tente novamente mais tarde."
});
app.use(limiter);

// Log de acessos
const logFile = fs.createWriteStream(path.join(__dirname, 'acess.log'), { flags: 'a' });
app.use(morgan('combined', { stream: logFile }));

// Segurança HTTP
app.use(
    helmet({
        contentSecurityPolicy: false
    })
);

// Auxiliares JSON
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

// --- ROTAS DE NAVEGAÇÃO E LISTAGEM (GET) ---

app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'views', 'login.html')));
app.get('/login', (req, res) => res.sendFile(path.join(__dirname, 'views', 'login.html')));
app.get('/recuperar-senha', (req, res) => res.sendFile(path.join(__dirname, 'views', 'recuperar-senha.html')));

app.get('/home', (req, res) => {
    const homeHtmlPath = path.join(__dirname, 'views', 'home.html');
    let html = fs.readFileSync(homeHtmlPath, 'utf-8');

    const produtos = lerJson(produtosPath);
    const produtosEmbaralhados = [...produtos].sort(() => 0.5 - Math.random());
    const produtosExibicao = produtosEmbaralhados.slice(0, 10);

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
});

// Formulários (Renderização via EJS para suportar preenchimento na edição)
app.get('/clientes/cadastrar', (req, res) => res.render('cadastrar-cliente', { cliente: null }));
app.get('/funcionario/cadastrar', (req, res) => res.render('cadastrar-funcionario', { funcionario: null }));
app.get('/produto/cadastrar', (req, res) => res.render('cadastrar-produto', { produto: null }));

// Listagens em Tabela
app.get('/produtos', (req, res) => res.render('ver-produto', { produtos: lerJson(produtosPath) }));
app.get('/clientes/visualizar', (req, res) => res.render('visualizar-cliente', { clientes: lerJson(clientesPath) }));
app.get('/funcionarios/visualizar', (req, res) => res.render('visualizar-funcionario', { funcionarios: lerJson(funcionariosPath) }));

// --- ROTAS DE EDITAÇÃO E EXCLUSÃO (GET) ---

// Produto
app.get('/produto/editar/:id', (req, res) => {
    const id = Number(req.params.id);
    const produto = lerJson(produtosPath).find(p => p.id_prod === id);
    if (produto) res.render('cadastrar-produto', { produto });
    else res.redirect('/produtos');
});

app.get('/produto/deletar/:id', (req, res) => {
    const id = Number(req.params.id);
    let produtos = lerJson(produtosPath).filter(p => p.id_prod !== id);
    escreverJson(produtosPath, produtos);
    res.redirect('/produtos');
});

// Cliente
app.get('/cliente/editar/:cpf', (req, res) => {
    const cpf = req.params.cpf;
    const cliente = lerJson(clientesPath).find(c => c.cpf === cpf);
    if (cliente) res.render('cadastrar-cliente', { cliente });
    else res.redirect('/clientes/visualizar');
});

app.get('/cliente/deletar/:cpf', (req, res) => {
    const cpf = req.params.cpf;
    let clientes = lerJson(clientesPath).filter(c => c.cpf !== cpf);
    escreverJson(clientesPath, clientes);
    res.redirect('/clientes/visualizar');
});

// Funcionário
app.get('/funcionario/editar/:cpf', (req, res) => {
    const cpf = req.params.cpf;
    const funcionario = lerJson(funcionariosPath).find(f => f.cpf === cpf);
    if (funcionario) res.render('cadastrar-funcionario', { funcionario });
    else res.redirect('/funcionarios/visualizar');
});

app.get('/funcionario/deletar/:cpf', (req, res) => {
    const cpf = req.params.cpf;
    let funcionarios = lerJson(funcionariosPath).filter(f => f.cpf !== cpf);
    escreverJson(funcionariosPath, funcionarios);
    res.redirect('/funcionarios/visualizar');
});

// --- ROTAS DE SALVAMENTO (POST) ---

app.post('/recuperar-senha', (req, res) => {
    const { inputEmailLog } = req.body;
    res.send(`<h1>Instruções enviadas para ${inputEmailLog}!</h1><a href="/login">Voltar ao Login</a>`);
});

app.post('/login', (req, res) => {
    const { user, senha } = req.body;
    const funcionarios = lerJson(funcionariosPath);
    const ok = funcionarios.find(f => (f.email === user || f.cpf === user) && f.senha === senha);
    if (ok) res.redirect('/home');
    else res.send('<h1>Funcionário ou senha inválidos!</h1><a href="/login">Tentar novamente</a>');
});

// Salvar/Editar Produto
app.post('/produto/salvar', upload.single('inputFoto'), (req, res) => {
    const { id_prod, inputNomeProd, inputFabricanteProd, inputDescricaoProd, inputValorProd, inputQtdProd } = req.body;
    let produtos = lerJson(produtosPath);

    if (id_prod) {
        const idx = produtos.findIndex(p => p.id_prod === Number(id_prod));
        if (idx !== -1) {
            produtos[idx].nome = inputNomeProd;
            produtos[idx].fabricante = inputFabricanteProd;
            produtos[idx].descricao = inputDescricaoProd;
            produtos[idx].valor = inputValorProd;
            produtos[idx].quantidade = Number(inputQtdProd);
            if (req.file) produtos[idx].foto_prod = req.file.filename;
        }
    } else {
        const maiorId = produtos.reduce((max, p) => (p.id_prod > max ? p.id_prod : max), 0);
        produtos.push({
            id_prod: maiorId + 1,
            nome: inputNomeProd,
            fabricante: inputFabricanteProd,
            descricao: inputDescricaoProd,
            valor: inputValorProd,
            quantidade: Number(inputQtdProd),
            foto_prod: req.file ? req.file.filename : 'default.png'
        });
    }

    escreverJson(produtosPath, produtos);
    res.redirect('/produtos');
});

// Salvar/Editar Cliente
app.post('/cliente/salvar', upload.single('inputFoto'), (req, res) => {
    const { cpfOriginal, nome, sobrenome, cpf, dataNascimento, telefone, email, senha } = req.body;
    let clientes = lerJson(clientesPath);

    if (cpfOriginal) {
        const idx = clientes.findIndex(c => c.cpf === cpfOriginal);
        if (idx !== -1) {
            clientes[idx].cpf = cpf;
            clientes[idx].nome = nome;
            clientes[idx].sobrenome = sobrenome;
            clientes[idx].dataNasc = dataNascimento;
            clientes[idx].telefone = telefone;
            clientes[idx].email = email;
            clientes[idx].senha = senha;
            if (req.file) clientes[idx].foto_perfil = req.file.filename;
        }
    } else {
        clientes.push({
            cpf,
            nome,
            sobrenome,
            dataNasc: dataNascimento,
            telefone,
            email,
            senha,
            foto_perfil: req.file ? req.file.filename : 'default.png'
        });
    }

    escreverJson(clientesPath, clientes);
    res.redirect('/clientes/visualizar');
});

// Salvar/Editar Funcionário
app.post('/funcionario/salvar', upload.single('inputFoto'), (req, res) => {
    const { cpfOriginal, inputNomeFunc, inputSobrenomeFunc, inputCPFFunc, inputDataNascFunc, inputTelefoneFunc, inputCargoFunc, inputSalarioFunc, inputEmailFunc, inputSenha } = req.body;
    let funcionarios = lerJson(funcionariosPath);

    if (cpfOriginal) {
        const idx = funcionarios.findIndex(f => f.cpf === cpfOriginal);
        if (idx !== -1) {
            funcionarios[idx].cpf = inputCPFFunc;
            funcionarios[idx].nome = inputNomeFunc;
            funcionarios[idx].sobrenome = inputSobrenomeFunc;
            funcionarios[idx].dataNasc = inputDataNascFunc;
            funcionarios[idx].telefone = inputTelefoneFunc;
            funcionarios[idx].cargo = inputCargoFunc;
            funcionarios[idx].salario = inputSalarioFunc;
            funcionarios[idx].email = inputEmailFunc;
            funcionarios[idx].senha = inputSenha;
            if (req.file) funcionarios[idx].foto_perfil = req.file.filename;
        }
    } else {
        funcionarios.push({
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
        });
    }

    escreverJson(funcionariosPath, funcionarios);
    res.redirect('/funcionarios/visualizar');
});

app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
});