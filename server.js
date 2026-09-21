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

// Configuração do Multer com destinos separados para Cliente, Funcionário e Produto
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        let pastaDestino = path.join(__dirname, 'assets', 'img');

        // Define a pasta correta com base no endpoint/rota acessada
        if (req.originalUrl.includes('/cliente')) {
            pastaDestino = path.join(__dirname, 'assets', 'imgcliente');
        } else if (req.originalUrl.includes('/funcionario')) {
            pastaDestino = path.join(__dirname, 'assets', 'imgfunc');
        } else if (req.originalUrl.includes('/produto')) {
            pastaDestino = path.join(__dirname, 'assets', 'imgprod');
        }

        // Garante a criação automática do diretório caso ainda não exista
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

// Servir arquivos estáticos (CSS, imagens, fontes) da pasta 'assets'
app.use(express.static(path.join(__dirname, 'assets')));

// Rate Limiting (Controle de Limite de Requisições)
const limiter = rateLimit({
    windowMs: 10 * 60 * 1000,
    max: 100,
    message: "Muitas requisições enviadas. Tente novamente mais tarde."
});
app.use(limiter);

// Registro de Logs no arquivo 'acess.log'
const logFile = fs.createWriteStream(path.join(__dirname, 'acess.log'), { flags: 'a' });
app.use(morgan('combined', { stream: logFile }));

// Segurança do Cabeçalho HTTP
app.use(
    helmet({
        contentSecurityPolicy: false
    })
);

// Auxiliares para Manipulação dos Arquivos JSON
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

// Caminhos dos arquivos de dados em JSON
const clientesPath = path.join(__dirname, 'clientes.json');
const funcionariosPath = path.join(__dirname, 'funcionarios.json');
const produtosPath = path.join(__dirname, 'produtos.json');

// --- ROTAS DE NAVEGAÇÃO (GET) ---

// Tela de Login
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'login.html'));
});

app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'login.html'));
});

// Home
app.get('/home', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'home.html'));
});

// Telas de Cadastro
app.get('/clientes/cadastrar', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'cadastrar-cliente.html'));
});

app.get('/funcionario/cadastrar', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'cadastrar-funcionario.html'));
});

app.get('/produto/cadastrar', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'cadastrar-produto.html'));
});

// Visualizar dados cadastrados (Retorno JSON)
app.get('/clientes', (req, res) => {
    const clientes = lerJson(clientesPath);
    res.json(clientes);
});

// --- ROTAS DE PROCESSAMENTO (POST) ---

// Validação de Login exclusivo de Funcionários
app.post('/login', (req, res) => {
    const { user, senha } = req.body;
    const funcionarios = lerJson(funcionariosPath);

    // Procura funcionário cadastrado conferindo Email ou CPF
    const funcionarioEncontrado = funcionarios.find(
        (f) => (f.email === user || f.cpf === user) && f.senha === senha
    );

    if (funcionarioEncontrado) {
        res.redirect('/home');
    } else {
        res.send('<h1>Funcionário ou senha inválidos!</h1><a href="/login">Tentar novamente</a>');
    }
});

// Cadastro de Cliente (Salva a foto em /assets/imgcliente)
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

// Cadastro de Funcionário (Salva a foto em /assets/imgfunc)
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

// Cadastro de Produto (Salva a foto em /assets/imgprod)
app.post('/produto/cadastrar', upload.single('inputFoto'), (req, res) => {
    const {
        inputNomeProd,
        inputFabricanteProd,
        inputDescricaoProd,
        inputValorProd,
        inputQtdProd
    } = req.body;

    const produtos = lerJson(produtosPath);

    // Geração do ID incremental
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