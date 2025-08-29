import axios from 'axios'; // NOVO: Importamos o axios para fazer requisições
// backend/server.js
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import Veiculo from './models/Veiculo.js'; // Importando nosso modelo!

// Carrega as variáveis de ambiente do arquivo .env
dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

// === Middlewares ===
app.use(cors()); // Permite que o frontend acesse este backend
app.use(express.json()); // Permite que o servidor entenda JSON nas requisições

// === Conexão com o MongoDB Atlas ===
const mongoURI = process.env.MONGO_URI_CRUD;

if (!mongoURI) {
    console.error("ERRO: A variável de ambiente MONGO_URI_CRUD não foi definida no seu arquivo .env.");
    process.exit(1); // Encerra o processo se a URI não estiver configurada
}

mongoose.connect(mongoURI)
    .then(() => console.log("[Servidor] Conexão com o MongoDB Atlas estabelecida com sucesso!"))
    .catch(err => {
        console.error("[Servidor] Erro ao conectar com o MongoDB Atlas:", err);
        process.exit(1);
    });

// === Rotas da API ===

/**
 * [READ] Endpoint GET /api/veiculos
 * Retorna a lista de todos os veículos do banco de dados, ordenados pelos mais recentes.
 */
app.get('/api/veiculos', async (req, res) => {
    try {
        const todosOsVeiculos = await Veiculo.find().sort({ createdAt: -1 });
        console.log('[Servidor] Buscando todos os veículos do DB.');
        res.status(200).json(todosOsVeiculos);

    } catch (error) {
        console.error("[Servidor] Erro ao buscar veículos:", error);
        res.status(500).json({ error: 'Erro interno ao buscar veículos.' });
    }
});

/**
 * [CREATE] Endpoint POST /api/veiculos
 * Cria um novo veículo no banco de dados.
 */
app.post('/api/veiculos', async (req, res) => {
    try {
        const novoVeiculoData = req.body;
        const veiculoCriado = await Veiculo.create(novoVeiculoData);

        console.log('[Servidor] Veículo criado com sucesso:', veiculoCriado);
        res.status(201).json(veiculoCriado); // Retorna o veículo criado com o _id do DB

    } catch (error) {
        console.error("[Servidor] Erro ao criar veículo:", error);
        // Tratamento de erros de validação e duplicidade do Mongoose
        if (error.code === 11000) { // Erro de placa duplicada (unique)
            return res.status(409).json({ error: `Veículo com a placa '${error.keyValue.placa}' já existe.` });
        }
        if (error.name === 'ValidationError') { // Erros de campos obrigatórios, min/max, etc.
             const messages = Object.values(error.errors).map(val => val.message);
             return res.status(400).json({ error: messages.join(' ') });
        }
        res.status(500).json({ error: 'Erro interno ao criar veículo.' });
    }
});


// === Inicialização do Servidor ===
app.listen(port, () => {
    console.log(`[Servidor] Servidor rodando em http://localhost:${port}`);
});