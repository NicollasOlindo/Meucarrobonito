// server.js (Conteúdo Finalizado)
import express from 'express';
import dotenv from 'dotenv';
import axios from 'axios';
import cors from 'cors'; 
import mongoose from 'mongoose'; 

// Carrega variáveis de ambiente
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json()); // ESSENCIAL para receber o corpo da requisição

const port = process.env.PORT || 3001;
const apiKey = process.env.OPENWEATHER_API_KEY;
const mongoUri = process.env.MONGO_URI; 

// --- CONEXÃO COM O MONGO ---
if (mongoUri) {
    mongoose.connect(mongoUri)
        .then(() => console.log('[Servidor DB] Conexão com MongoDB Atlas estabelecida com sucesso.'))
        .catch(err => console.error('[Servidor DB] ERRO FATAL ao conectar com MongoDB:', err.message));
} else {
    console.error('[Servidor DB] Variável MONGO_URI não está definida.');
}

// --- DEFINIÇÃO DOS SCHEMAS (Modelos de Dados) ---

// Schema de Manutencao (Subdocumento)
const ManutencaoSchema = new mongoose.Schema({
    id: { type: String, required: true, default: () => `m-${Date.now()}-${Math.random().toString(16).substring(2, 8)}` },
    data: { type: Date, required: true },
    tipo: { type: String, required: true },
    custo: { type: Number, required: true, min: 0 },
    descricao: { type: String },
});

// Schema de Veiculo (Documento Principal)
const VeiculoSchema = new mongoose.Schema({
    tipoVeiculo: { type: String, required: true, enum: ['Carro', 'CarroEsportivo', 'Caminhao'] },
    modelo: { type: String, required: true },
    cor: { type: String, required: true },
    ligado: { type: Boolean, default: false },
    velocidade: { type: Number, default: 0 },
    turboAtivado: { type: Boolean, default: false }, 
    capacidadeCarga: { type: Number, min: 1 },        
    cargaAtual: { type: Number, default: 0 },          
    historicoManutencao: [ManutencaoSchema], 
    createdAt: { type: Date, default: Date.now },
}, { 
    toJSON: { 
        virtuals: true, 
        transform: (doc, ret) => { 
            ret.id = ret._id.toHexString(); // Garante que o ID é copiado para 'id'
            delete ret._id; 
            delete ret.__v; 
            return ret; 
        } 
    } 
});

const Veiculo = mongoose.model('Veiculo', VeiculoSchema);


// ----- ENDPOINTS PARA GERENCIAMENTO DE VEÍCULOS (CRUD) -----

// GET /api/veiculos (Buscar todos)
app.get('/api/veiculos', async (req, res) => {
    try {
        const veiculos = await Veiculo.find({});
        res.json(veiculos); 
    } catch (error) {
        console.error('[Servidor DB] Erro ao buscar veículos:', error);
        res.status(500).json({ error: 'Falha ao carregar a garagem.' });
    }
});

// POST /api/veiculos (Criar novo veículo)
app.post('/api/veiculos', async (req, res) => {
    // Linha de debug para verificar o payload que o frontend está enviando
    console.log('[Servidor DB] Tentativa de adicionar veículo. Corpo recebido:', req.body);

    const { tipoVeiculo, modelo, cor, capacidadeCarga } = req.body;
    
    try {
        if (!tipoVeiculo || !modelo || !cor) throw new Error("Modelo, Cor e Tipo são obrigatórios.");

        const dados = {
            tipoVeiculo, modelo, cor,
            velocidade: 0,
            ligado: false, 
        };
        
        if (tipoVeiculo === 'Caminhao') {
            const cap = parseFloat(capacidadeCarga);
            if (isNaN(cap) || cap <= 0) throw new Error("Capacidade de carga inválida.");
            dados.capacidadeCarga = cap;
            dados.cargaAtual = 0;
        } else if (tipoVeiculo === 'CarroEsportivo') {
            dados.turboAtivado = false;
        }

        const novoVeiculo = new Veiculo(dados);
        const veiculoSalvo = await novoVeiculo.save();
        res.status(201).json(veiculoSalvo); // Retorna o objeto salvo em JSON
    } catch (error) {
        console.error('[Servidor DB] ERRO FATAL na rota POST /api/veiculos:', error.message);
        // Garante que uma resposta JSON válida seja enviada em caso de erro
        res.status(400).json({ error: 'Falha na validação ou salvamento do veículo.', details: error.message });
    }
});

// PATCH /api/veiculos/:id (Atualizar estado: ligar, acelerar, carga)
app.patch('/api/veiculos/:id', async (req, res) => {
    const { estado } = req.body; 
    try {
        const veiculoAtualizado = await Veiculo.findByIdAndUpdate(
            req.params.id, 
            { $set: estado }, 
            { new: true, runValidators: true } 
        );

        if (!veiculoAtualizado) return res.status(404).json({ error: 'Veículo não encontrado.' });
        res.json(veiculoAtualizado);

    } catch (error) {
        console.error('[Servidor DB] Erro ao atualizar veículo:', error);
        res.status(400).json({ error: 'Falha ao atualizar o veículo.', details: error.message });
    }
});

// DELETE /api/veiculos/:id (Remover veículo)
app.delete('/api/veiculos/:id', async (req, res) => {
    try {
        const veiculoRemovido = await Veiculo.findByIdAndDelete(req.params.id);
        if (!veiculoRemovido) return res.status(404).json({ error: 'Veículo não encontrado.' });
        res.status(204).send(); // Resposta 204 NÃO tem corpo JSON!
    } catch (error) {
        res.status(500).json({ error: 'Falha ao remover veículo.' });
    }
});


// POST /api/veiculos/:id/manutencao (Adicionar Agendamento/Histórico)
app.post('/api/veiculos/:id/manutencao', async (req, res) => {
    const { data, hora, tipoServico, custo, descricao } = req.body;
    
    try {
        const veiculo = await Veiculo.findById(req.params.id);
        if (!veiculo) return res.status(404).json({ error: 'Veículo não encontrado.' });

        const novaManutencao = {
            data: new Date(`${data}T${hora}`), 
            tipo: tipoServico,
            custo: parseFloat(custo),
            descricao: descricao || '',
        };

        veiculo.historicoManutencao.push(novaManutencao);
        const veiculoSalvo = await veiculo.save();
        
        // Retorna o veículo completo
        res.status(201).json(veiculoSalvo); 

    } catch (error) {
        console.error('[Servidor DB] Erro ao adicionar manutenção:', error);
        res.status(400).json({ error: 'Dados da manutenção inválidos.', details: error.message });
    }
});


// DELETE /api/veiculos/:veiculoId/manutencao/:manutencaoId (Remover Agendamento/Histórico)
app.delete('/api/veiculos/:veiculoId/manutencao/:manutencaoId', async (req, res) => {
    try {
        const veiculo = await Veiculo.findById(req.params.veiculoId);
        if (!veiculo) return res.status(404).json({ error: 'Veículo não encontrado.' });

        veiculo.historicoManutencao.pull({ id: req.params.manutencaoId });
        await veiculo.save();
        
        res.status(204).send(); // Resposta 204 NÃO tem corpo JSON!
    } catch (error) {
        res.status(500).json({ error: 'Falha ao remover manutenção.' });
    }
});

// --- Rota da OpenWeatherMap (Mantida) ---
app.get('/api/previsao/:cidade', async (req, res) => {
    const cidadeParam = req.params.cidade;

    if (!apiKey) {
        return res.status(500).json({ error: 'Configuração interna do servidor incompleta (API Key de Clima ausente).' });
    }
    if (!cidadeParam || cidadeParam.trim() === '') {
        return res.status(400).json({ error: 'Nome da cidade é obrigatório.' });
    }

    const cidade = cidadeParam.trim();
    const weatherAPIUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(cidade)}&appid=${apiKey}&units=metric&lang=pt_br`;

    try {
        const apiResponse = await axios.get(weatherAPIUrl);
        
        if (apiResponse.data && apiResponse.data.list) {
            res.json(apiResponse.data);
        } else {
            res.status(502).json({ error: 'Resposta inesperada do serviço de previsão do tempo.' }); 
        }
    } catch (error) {
        const status = error.response ? error.response.status : 500;
        let message = 'Erro ao buscar previsão do tempo no serviço externo.'; 
        if (error.response && error.response.data && error.response.data.message) {
            message = error.response.data.message;
        }
        res.status(status).json({ error: message, details: error.response ? error.response.data : 'Network Error' });
    }
});


// --- Tratamento de Erros e Inicialização ---
app.use((req, res, next) => { res.status(404).json({ error: 'Rota não encontrada.' }); });
app.use((err, req, res, next) => { console.error('[Servidor] Erro não tratado:', err.stack); res.status(500).json({ error: 'Ocorreu um erro inesperado no servidor.' }); });

app.listen(port, () => {
    console.log(`Servidor backend rodando em http://localhost:${port}`);
});