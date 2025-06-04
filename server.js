// server.js
import express from 'express';
import dotenv from 'dotenv';
import axios from 'axios';
import cors from 'cors'; // Importe o pacote cors

// Carrega variáveis de ambiente do arquivo .env
dotenv.config();

// Inicializa o aplicativo Express
const app = express();

// Configuração do CORS
// Permite requisições de qualquer origem. Para produção, restrinja para o seu domínio frontend.
// Ex: app.use(cors({ origin: 'https://seu-frontend.vercel.app' }));
app.use(cors());

// Porta para o servidor backend
// O Render.com vai definir process.env.PORT. Localmente, usará o PORT do .env ou 3001.
const port = process.env.PORT || 3001;
const apiKey = process.env.OPENWEATHER_API_KEY;

// Middleware para parsear JSON no corpo das requisições (útil para futuras rotas POST/PUT)
app.use(express.json());

// ----- ROTA DE TESTE (Opcional, mas útil) -----
app.get('/', (req, res) => {
    res.send('Servidor Backend da Garagem Inteligente está no ar! Use /api/previsao/:cidade para a previsão.');
});

// ----- NOSSO PRIMEIRO ENDPOINT: Previsão do Tempo -----
app.get('/api/previsao/:cidade', async (req, res) => {
    const cidadeParam = req.params.cidade;

    // Verifica se a API Key está configurada no servidor
    if (!apiKey) {
        console.error('[Servidor] ERRO CRÍTICO: Chave da API OpenWeatherMap (OPENWEATHER_API_KEY) não configurada no servidor.');
        return res.status(500).json({ error: 'Configuração interna do servidor incompleta (API Key ausente).' });
    }

    // Verifica se o parâmetro :cidade foi fornecido e não está vazio
    if (!cidadeParam || cidadeParam.trim() === '') {
        console.log('[Servidor] Requisição recebida sem nome da cidade.');
        return res.status(400).json({ error: 'Nome da cidade é obrigatório.' });
    }

    const cidade = cidadeParam.trim();
    const weatherAPIUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(cidade)}&appid=${apiKey}&units=metric&lang=pt_br`;

    console.log(`[Servidor] Recebida requisição para /api/previsao/${cidade}`);
    console.log(`[Servidor] URL da OpenWeatherMap: ${weatherAPIUrl.replace(apiKey, 'SUA_API_KEY_OCULTA')}`); // Não logar a chave em produção real

    try {
        console.log(`[Servidor] Buscando previsão para: ${cidade}`);
        const apiResponse = await axios.get(weatherAPIUrl);
        
        // Verifica se a API da OpenWeatherMap retornou dados e uma lista de previsões
        if (apiResponse.data && apiResponse.data.list) {
            console.log(`[Servidor] Dados recebidos da OpenWeatherMap para ${cidade}. Entradas na lista: ${apiResponse.data.list.length}`);
            res.json(apiResponse.data);
        } else {
            // Caso a API retorne um 200 OK mas com corpo inesperado (raro, mas possível)
            console.warn(`[Servidor] Resposta da OpenWeatherMap para ${cidade} não continha a lista de previsões esperada.`);
            res.status(502).json({ error: 'Resposta inesperada do serviço de previsão do tempo.' }); // 502 Bad Gateway
        }

    } catch (error) {
        if (error.response) {
            // O servidor da OpenWeatherMap respondeu com um status de erro (4xx, 5xx)
            console.error(`[Servidor] Erro da API OpenWeatherMap (status ${error.response.status}):`, error.response.data);
            const status = error.response.status;
            let message = 'Erro ao buscar previsão do tempo no serviço externo.'; // Mensagem padrão
            
            if (error.response.data && error.response.data.message) {
                message = error.response.data.message; // Mensagem de erro da OpenWeatherMap
                if (status === 401) message = "Chave da API inválida ou não autorizada.";
                if (status === 404) message = "Cidade não encontrada.";
                if (status === 429) message = "Limite de requisições da API excedido.";
            }
            res.status(status).json({ error: message, details: error.response.data });
        } else if (error.request) {
            // A requisição foi feita mas nenhuma resposta foi recebida (ex: problema de rede com a OpenWeatherMap)
            console.error('[Servidor] Nenhuma resposta recebida da API OpenWeatherMap:', error.message);
            res.status(504).json({ error: 'O serviço de previsão do tempo não respondeu (Gateway Timeout).' }); // 504 Gateway Timeout
        } else {
            // Algo aconteceu ao configurar a requisição que acionou um erro
            console.error('[Servidor] Erro ao configurar a requisição para OpenWeatherMap:', error.message);
            res.status(500).json({ error: 'Erro interno ao tentar buscar a previsão do tempo.' });
        }
    }
});

// Middleware para tratar rotas não encontradas (404) - DEVE SER O ÚLTIMO
app.use((req, res, next) => {
    res.status(404).json({ error: 'Rota não encontrada.' });
});

// Middleware de tratamento de erro genérico (opcional, mas bom para capturar outros erros)
app.use((err, req, res, next) => {
    console.error('[Servidor] Erro não tratado:', err.stack);
    res.status(500).json({ error: 'Ocorreu um erro inesperado no servidor.' });
});


// Inicia o servidor
app.listen(port, () => {
    if (!apiKey) {
        console.warn('\n!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!');
        console.warn('!!! ATENÇÃO: A variável de ambiente OPENWEATHER_API_KEY não está definida !!!');
        console.warn('!!! O endpoint de previsão do tempo NÃO FUNCIONARÁ corretamente.        !!!');
        console.warn('!!! Verifique seu arquivo .env ou as variáveis de ambiente no Render.com !!!');
        console.warn('!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!\n');
    }
    console.log(`Servidor backend rodando em http://localhost:${port}`);
    console.log(`Para testar, acesse: http://localhost:${port}/api/previsao/SUA_CIDADE`);
});