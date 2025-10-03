// server.js (Conteúdo Modificado)
import express from 'express';
import dotenv from 'dotenv';
import axios from 'axios';
import cors from 'cors'; 
import mongoose from 'mongoose'; // <-- NOVO: Importa Mongoose

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json()); // ESSENCIAL para receber o corpo da requisição

const port = process.env.PORT || 3001;
const apiKey = process.env.OPENWEATHER_API_KEY;
const mongoUri = process.env.MONGO_URI; // <-- O URI do Atlas

// --- CONEXÃO COM O MONGO ---
if (mongoUri) {
    mongoose.connect(mongoUri)
        .then(() => console.log('[Servidor DB] Conexão com MongoDB Atlas estabelecida com sucesso.'))
        .catch(err => console.error('[Servidor DB] ERRO ao conectar com MongoDB:', err.message));
} else {
    console.error('[Servidor DB] Variável MONGO_URI não está definida.');
}

// --- DEFINIÇÃO DOS SCHEMAS (Modelos de Dados) ---

// Schema de Manutencao (Subdocumento)
const ManutencaoSchema = new mongoose.Schema({
    // Usamos um ID personalizado para compatibilidade com o frontend
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
    turboAtivado: { type: Boolean, default: false }, // Carro Esportivo
    capacidadeCarga: { type: Number, min: 1 },        // Caminhão
    cargaAtual: { type: Number, default: 0 },          // Caminhão
    historicoManutencao: [ManutencaoSchema], // Array de subdocumentos
    createdAt: { type: Date, default: Date.now },
}, { 
    // Garante que o ID retornado seja 'id' em vez de '_id' para o frontend
    toJSON: { virtuals: true, transform: (doc, ret) => { delete ret._id; delete ret.__v; return ret; } } 
});
VeiculoSchema.virtual('id').get(function() { return this._id.toHexString(); }); // Mapeia _id para id

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
    const { tipoVeiculo, modelo, cor, capacidadeCarga } = req.body;
    
    try {
        const dados = {
            tipoVeiculo, modelo, cor,
            velocidade: 0,
            ...(tipoVeiculo === 'Caminhao' && { capacidadeCarga: parseFloat(capacidadeCarga), cargaAtual: 0 }),
            ...(tipoVeiculo === 'CarroEsportivo' && { turboAtivado: false, velocidade: 0 }),
        };
        const novoVeiculo = new Veiculo(dados);
        await novoVeiculo.save();
        res.status(201).json(novoVeiculo); 
    } catch (error) {
        console.error('[Servidor DB] Erro ao adicionar veículo:', error);
        res.status(400).json({ error: 'Dados do veículo inválidos.', details: error.message });
    }
});

// PATCH /api/veiculos/:id (Atualizar estado: ligar, acelerar, carga)
app.patch('/api/veiculos/:id', async (req, res) => {
    // O corpo da requisição { ligado: true } ou { velocidade: 50.5 }
    const { estado } = req.body; 
    try {
        const veiculoAtualizado = await Veiculo.findByIdAndUpdate(
            req.params.id, 
            { $set: estado }, 
            { new: true, runValidators: true } // Retorna o doc atualizado
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
        res.status(204).send(); 
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
        await veiculo.save();
        
        // Retorna o veículo completo para manter o frontend simples (apenas recarrega)
        res.status(201).json(veiculo); 

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

        // Remove o subdocumento pelo ID (usando .pull() do Mongoose)
        veiculo.historicoManutencao.pull({ id: req.params.manutencaoId });
        await veiculo.save();
        
        res.status(204).send(); 
    } catch (error) {
        res.status(500).json({ error: 'Falha ao remover manutenção.' });
    }
});

// --- Rota da OpenWeatherMap (Mantida) ---
// ... (mantenha a rota /api/previsao/:cidade) ...

// --- Tratamento de Erros e Inicialização ---
app.use((req, res, next) => { res.status(404).json({ error: 'Rota não encontrada.' }); });
app.use((err, req, res, next) => { console.error('[Servidor] Erro não tratado:', err.stack); res.status(500).json({ error: 'Ocorreu um erro inesperado no servidor.' }); });

app.listen(port, () => {
    console.log(`Servidor backend rodando em http://localhost:${port}`);
});

// ===== GERENCIAMENTO DA GARAGEM E PERSISTÊNCIA (AGORA VIA API) =====
let garagemVeiculos = [];
// As funções salvarGaragem e o STORAGE_KEY DEVEM SER REMOVIDOS.

/** Carrega a garagem do Servidor Backend. */
async function carregarGaragem() {
    try {
        const response = await fetch('/api/veiculos'); // GET /api/veiculos
        if (!response.ok) { throw new Error('Falha ao buscar veículos no servidor.'); }

        const dadosDoServidor = await response.json();

        // Converte os objetos JSON recebidos do servidor de volta para instâncias de classe
        garagemVeiculos = dadosDoServidor
            .map(obj => {
                // Adapta IDs Mongoose (_id) e Datas para o formato esperado pelo fromPlainObject
                obj.historicoManutencao = (obj.historicoManutencao || []).map(m => ({
                    id: m.id || m._id, // Garante que o ID do subdocumento é usado
                    data: new Date(m.data).toISOString(),
                    tipo: m.tipo, custo: m.custo, descricao: m.descricao
                }));
                // Veiculo.fromPlainObject() já lida com os campos específicos de cada tipo
                return Veiculo.fromPlainObject(obj);
            })
            .filter(v => v !== null);

    } catch (e) {
        console.error("Erro ao carregar garagem do backend:", e);
        garagemVeiculos = []; // Limpa em caso de erro
    }
    atualizarListaGaragemUI();
    verificarAgendamentosProximos();
}

/** Encontra veículo por ID. */
function encontrarVeiculoPorId(id) { return garagemVeiculos.find(v => v.id === id); }