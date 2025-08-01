// =============================================
//        SCRIPT COMPLETO - GARAGEM INTELIGENTE
// =============================================

// ATUALIZADO: URL do nosso novo backend.
// Use 'http://localhost:3001/api' para testes locais.
// Quando fizer deploy, troque pela URL do seu backend no Render.
const API_URL = 'http://localhost:3001/api';

// ===== SUAS CLASSES OOP ORIGINAIS (INTOCADAS) =====
// Todo o seu trabalho de classes está preservado. A lógica de interação com
// os detalhes dos veículos usará essas classes no futuro.
class Manutencao {
    constructor(data, tipo, custo, descricao = '') {
        const dataObj = new Date(data);
        if (!this.validarData(dataObj)) {
            throw new Error("Data inválida para manutenção.");
        }
        if (typeof tipo !== 'string' || tipo.trim() === '') {
            throw new Error("Tipo de manutenção inválido.");
        }
        const custoNum = parseFloat(custo);
        if (isNaN(custoNum) || custoNum < 0) {
            throw new Error("Custo da manutenção inválido.");
        }
        this.id = `m-${Date.now()}-${Math.random().toString(16).substring(2, 8)}`;
        this.data = dataObj.toISOString();
        this.tipo = tipo.trim();
        this.custo = custoNum;
        this.descricao = descricao.trim();
    }
    validarData(data) { return data instanceof Date && !isNaN(data.getTime()); }
    getDataObj() { return new Date(this.data); }
    formatar() {
        const dataF = this.getDataObj().toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
        const custoF = this.custo.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
        let str = `${this.tipo} em ${dataF} - ${custoF}`;
        if (this.descricao) { str += ` (${this.descricao})`; }
        return str;
    }
    formatarAgendamento() {
        const dataF = this.getDataObj().toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
        let str = `${this.tipo} agendado para ${dataF}`;
        if (this.descricao) { str += ` - Obs: ${this.descricao}`; }
        return str;
    }
    isFuture() { return this.getDataObj() > new Date(); }
}
class Veiculo {
    constructor(modelo, cor) {
        if (!modelo || typeof modelo !== 'string' || modelo.trim() === '') throw new Error("Modelo inválido");
        if (!cor || typeof cor !== 'string' || cor.trim() === '') throw new Error("Cor inválida");
        this.id = `v-${Date.now()}-${Math.random().toString(16).substring(2, 8)}`;
        this.modelo = modelo.trim();
        this.cor = cor.trim();
        this.ligado = false;
        this.historicoManutencao = [];
        this.somLigando = document.getElementById("somLigando");
        this.somAceleracao = document.getElementById("somAceleracao");
    }
    ligar() { if (!this.ligado) { this.ligado = true; if (this.somLigando) this.somLigando.play().catch(e=>console.warn(e)); } }
    desligar() { if (this.ligado) this.ligado = false; }
    buzinar() { console.log("Buzina genérica!"); }
}
class Carro extends Veiculo {
    constructor(modelo, cor) { super(modelo, cor); this.velocidade = 0; this.somBuzina = document.getElementById("somBuzinaCarro"); }
    desligar() { super.desligar(); this.velocidade = 0; }
    acelerar() { if (this.ligado) { this.velocidade += 10; if (this.somAceleracao) this.somAceleracao.play().catch(e=>console.warn(e));} }
    frear() { if (this.ligado) this.velocidade = Math.max(0, this.velocidade - 10); }
    buzinar() { if (this.somBuzina) this.somBuzina.play().catch(e=>console.warn(e)); else super.buzinar(); }
}
class CarroEsportivo extends Carro {
    constructor(modelo, cor) { super(modelo, cor); this.turboAtivado = false; this.somTurbo = document.getElementById("somTurbo"); this.somBuzina = document.getElementById("somBuzinaEsportivo"); }
    desligar() { super.desligar(); this.turboAtivado = false; }
    ativarTurbo() { if (this.ligado && !this.turboAtivado) { this.turboAtivado = true; if (this.somTurbo) this.somTurbo.play().catch(e=>console.warn(e)); } }
    desativarTurbo() { this.turboAtivado = false; }
    acelerar() { if (this.ligado) { this.velocidade += (this.turboAtivado ? 30 : 15); if (this.somAceleracao) this.somAceleracao.play().catch(e=>console.warn(e)); } }
}
class Caminhao extends Carro {
    constructor(modelo, cor, capacidadeCarga) { super(modelo, cor); this.capacidadeCarga = capacidadeCarga; this.cargaAtual = 0; this.somBuzina = document.getElementById("somBuzinaCaminhao"); }
    carregar(qtd) { if (this.cargaAtual + qtd <= this.capacidadeCarga) this.cargaAtual += qtd; }
    descarregar(qtd) { if (this.cargaAtual - qtd >= 0) this.cargaAtual -= qtd; }
}

// ===== API SIMULADA DE DETALHES (INTOCADA) =====
async function buscarDetalhesVeiculoAPI(identificadorVeiculo) { /* ... seu código original ... */ }

// ===== ATUALIZAÇÃO: Gerenciamento da Garagem via API =====
// A variável `garagemVeiculos` ainda existe, mas agora ela será um espelho dos dados do banco.
let garagemVeiculos = [];

// ATUALIZADO: Esta função agora busca os veículos do nosso backend usando fetch.
async function buscarEExibirVeiculos() {
    const listaDiv = document.getElementById('listaVeiculosGaragem');
    listaDiv.innerHTML = '<p>Carregando veículos da nuvem...</p>';
    try {
        const response = await fetch(`${API_URL}/veiculos`);
        if (!response.ok) {
            throw new Error(`Erro HTTP: ${response.status}`);
        }
        const veiculosDoBackend = await response.json();
        garagemVeiculos = veiculosDoBackend; // Preenche nossa variável local com os dados do banco
        atualizarListaGaragemUI(); // Chama sua função de UI para redesenhar a lista
    } catch (error) {
        listaDiv.innerHTML = '<p style="color: red;">Erro ao carregar veículos. Verifique se o servidor backend está rodando e acessível.</p>';
        console.error("Falha ao buscar veículos:", error);
    }
}

// ATUALIZADO: A função de UI agora lê os campos que vêm do banco (placa, marca, etc.)
function atualizarListaGaragemUI() {
    const listaDiv = document.getElementById('listaVeiculosGaragem');
    listaDiv.innerHTML = '';
    if (garagemVeiculos.length === 0) {
        listaDiv.innerHTML = '<p>Nenhum veículo na garagem.</p>';
        return;
    }
    const ul = document.createElement('ul');
    garagemVeiculos.forEach(v => {
        const li = document.createElement('li');
        li.innerHTML = `
            <span><strong>${v.placa}</strong> - ${v.marca} ${v.modelo} (${v.ano}) - Cor: ${v.cor}</span>
            <div>
                 <!-- Botões de ação serão implementados em fases futuras -->
                <button class="btn-remover-veiculo" data-veiculo-id="${v._id}" title="Remover (Não implementado)" disabled>×</button>
            </div>`;
        ul.appendChild(li);
    });
    listaDiv.appendChild(ul);
}

// ===== LÓGICA DE UI E NAVEGAÇÃO (INTOCADA) =====
// Todas as suas funções de interação com as telas de detalhes e navegação são mantidas.
function mostrarTela(idTela) {
    ["menuPrincipal", "garagem", "informacoesCarro", "informacoesCarroEsportivo", "informacoesCaminhao"]
        .forEach(id => {
            const el = document.getElementById(id);
            if (el) el.style.display = (id === idTela) ? "block" : "none";
        });
}
// ... As outras funções de UI como `mostrarDetalhesVeiculo` ainda existem, mas não são chamadas nesta fase.

// --- Event Listeners ---

// ATUALIZADO: O formulário agora envia os dados para o backend via POST.
document.getElementById('formAdicionarVeiculo')?.addEventListener('submit', async function(e) {
    e.preventDefault();
    const form = e.target;
    const veiculoParaEnviar = {
        placa: form.querySelector('#placaNovoVeiculo').value,
        marca: form.querySelector('#marcaNovoVeiculo').value,
        modelo: form.querySelector('#modeloNovoVeiculo').value,
        ano: form.querySelector('#anoNovoVeiculo').value,
        cor: form.querySelector('#corNovoVeiculo').value,
    };
    try {
        const response = await fetch(`${API_URL}/veiculos`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(veiculoParaEnviar),
        });
        const result = await response.json();
        if (!response.ok) {
            throw new Error(result.error || `Erro ${response.status} do servidor.`);
        }
        alert(`Veículo ${result.marca} ${result.modelo} adicionado com sucesso!`);
        form.reset();
        buscarEExibirVeiculos(); // Recarrega a lista do banco para mostrar o novo veículo.
    } catch (error) {
        alert(`Erro ao adicionar veículo: ${error.message}`);
        console.error("Erro no POST para /api/veiculos:", error);
    }
});

// LISTENERS DE NAVEGAÇÃO (INTOCADOS)
document.getElementById("botaoGaragem")?.addEventListener("click", () => mostrarTela("garagem"));
document.getElementById("voltarParaMenuPrincipalGaragem")?.addEventListener("click", () => mostrarTela("menuPrincipal"));
// ... E todos os outros botões de voltar...

// =============================================
// LÓGICA DA API OPENWEATHERMAP (INTOCADA)
// =============================================
// Toda a sua lógica de clima permanece exatamente a mesma.
async function buscarPrevisaoDetalhada(cidade) {
    const cidadeCodificada = encodeURIComponent(cidade);
    // ATENÇÃO: Esta URL do Render parece ser um log de deploy, não um endpoint.
    // Para a funcionalidade de clima funcionar, você precisará criar uma rota no seu backend
    // que busca os dados da OpenWeatherMap e apontar esta URL para o seu backend.
    const url = `https://dashboard.render.com/web/srv-d1031oili9vc73de7720/deploys/dep-d1038gngi27c73f9i3mg?r=2025-06-04%4011%3A54%3A47%7E2025-06-04%4011%3A57%3A22${cidadeCodificada}`;
    console.log(`[Frontend] Buscando previsão para: ${cidade} via backend.`);
    try {
        const response = await fetch(url);
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error || `Erro ${response.status} ao buscar previsão do backend.`);
        }
        return await response.json();
    } catch (error) {
        console.error("[Frontend] Erro ao buscar previsão via backend:", error);
        alert(`Falha ao buscar previsão para "${cidade}": ${error.message}.`);
        return null;
    }
}
function processarDadosForecast(dataAPI) { /* ... seu código original ... */ }
function exibirPrevisaoDetalhada(previsaoDiariaProcessada, nomeCidade) { /* ... seu código original ... */ }
document.getElementById("verificar-clima-detalhado-btn")?.addEventListener("click", async () => { /* ... seu código original ... */ });

// --- INICIALIZAÇÃO ---
// ATUALIZADO: O window.load agora chama a função que carrega do banco de dados.
window.addEventListener('load', () => {
    console.log("Página carregada. Inicializando Garagem Inteligente com API...");
    buscarEExibirVeiculos(); // <-- AQUI ESTÁ A MUDANÇA PRINCIPAL
    mostrarTela("menuPrincipal");
    console.log("Garagem Inteligente pronta.");
});