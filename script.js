// =============================================
//        SCRIPT COMPLETO - GARAGEM INTELIGENTE
// =============================================

// ===== CLASSE MANUTENCAO =====
/**
 * Representa um registro de manutenção para um veículo.
 * @class Manutencao
 */
class Manutencao {
    /**
     * Cria uma instância de Manutencao.
     * @param {string|Date} data - A data e hora da manutenção.
     * @param {string} tipo - O tipo de serviço realizado.
     * @param {number|string} custo - O custo do serviço.
     * @param {string} [descricao=''] - Uma descrição opcional.
     * @throws {Error} Se data, tipo ou custo forem inválidos.
     */
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
    /** @private */
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
    static fromPlainObject(obj) {
        try {
            const m = new Manutencao(obj.data, obj.tipo, obj.custo, obj.descricao);
            m.id = obj.id || m.id;
            return m;
        } catch (e) { console.error("Erro ao recriar Manutencao:", e, obj); return null; }
    }
}

// ===== CLASSE VEICULO (BASE) =====
/**
 * Classe base para veículos.
 * @class Veiculo
 * @abstract
 */
class Veiculo {
    /**
     * @param {string} modelo
     * @param {string} cor
     */
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
    ligar() {
        if (!this.ligado) {
            this.ligado = true; console.log(`${this.constructor.name} ${this.modelo} ligado.`);
            if (this.somLigando) this.somLigando.play().catch(e => console.warn("Audio error (ligar):", e));
        }
    }
    desligar() {
        if (this.ligado) { this.ligado = false; console.log(`${this.constructor.name} ${this.modelo} desligado.`); }
    }
    buzinar() { console.log("Buzina genérica!"); }
    adicionarManutencao(manutencao) {
        if (!(manutencao instanceof Manutencao)) { return false; }
        this.historicoManutencao.push(manutencao);
        this.historicoManutencao.sort((a, b) => b.getDataObj() - a.getDataObj());
        return true;
    }
    removerManutencao(idManutencao) {
        const index = this.historicoManutencao.findIndex(m => m.id === idManutencao);
        if (index > -1) { this.historicoManutencao.splice(index, 1); return true; }
        return false;
    }
    getHistoricoFormatado(apenasPassado = true) {
        const agora = new Date();
        return this.historicoManutencao
            .filter(m => !apenasPassado || m.getDataObj() <= agora)
            .map(m => ({ id: m.id, texto: m.formatar() }));
    }
    getAgendamentosFuturosFormatado() {
        const agora = new Date();
        return this.historicoManutencao
            .filter(m => m.getDataObj() > agora)
            .map(m => ({ id: m.id, texto: m.formatarAgendamento() }));
    }
    toPlainObject() {
        return {
            id: this.id, tipoVeiculo: this.constructor.name, modelo: this.modelo, cor: this.cor,
            ligado: this.ligado,
            historicoManutencao: this.historicoManutencao.map(m => ({
                id: m.id, data: m.data, tipo: m.tipo, custo: m.custo, descricao: m.descricao
            })),
        };
    }
    static fromPlainObject(obj) {
        let veiculo;
        try {
            switch (obj.tipoVeiculo) {
                case 'Carro': veiculo = new Carro(obj.modelo, obj.cor); break;
                case 'CarroEsportivo':
                    veiculo = new CarroEsportivo(obj.modelo, obj.cor);
                    veiculo.turboAtivado = obj.turboAtivado || false;
                    break;
                case 'Caminhao':
                    const cap = Number(obj.capacidadeCarga);
                    veiculo = new Caminhao(obj.modelo, obj.cor, (isNaN(cap) || cap <= 0) ? 10000 : cap);
                    veiculo.cargaAtual = Number(obj.cargaAtual) || 0;
                    break;
                default: throw new Error(`Tipo desconhecido: ${obj.tipoVeiculo}`);
            }
            veiculo.id = obj.id || veiculo.id;
            veiculo.ligado = obj.ligado || false;
            if (veiculo.hasOwnProperty('velocidade')) veiculo.velocidade = Number(obj.velocidade) || 0;
            if (Array.isArray(obj.historicoManutencao)) {
                veiculo.historicoManutencao = obj.historicoManutencao
                    .map(mObj => Manutencao.fromPlainObject(mObj)).filter(m => m !== null);
                veiculo.historicoManutencao.sort((a, b) => b.getDataObj() - a.getDataObj());
            } else { veiculo.historicoManutencao = []; }
            return veiculo;
        } catch (e) { console.error(`Erro ao recriar Veiculo: ${obj.modelo || 'Modelo Desconhecido'} (Tipo: ${obj.tipoVeiculo})`, e, obj); return null; }
    }
}

// ===== CLASSE CARRO =====
/** @class Carro @extends Veiculo */
class Carro extends Veiculo {
    constructor(modelo, cor) {
        super(modelo, cor);
        this.velocidade = 0;
        this.somBuzina = document.getElementById("somBuzinaCarro");
    }
    desligar() { super.desligar(); this.velocidade = 0; }
    acelerar() {
        if (this.ligado) {
            this.velocidade += 10;
            if (this.somAceleracao) this.somAceleracao.play().catch(e => console.warn("Audio error (acelerar carro):", e));
        } else { alert("O carro precisa estar ligado para acelerar!"); }
    }
    frear() {
        if (this.ligado) { this.velocidade = Math.max(0, this.velocidade - 10); }
        else { alert("O carro precisa estar ligado para frear!"); }
    }
    buzinar() { if (this.somBuzina) this.somBuzina.play().catch(e => console.warn("Audio error (buzina carro):", e)); else super.buzinar(); }
    toPlainObject() { const p = super.toPlainObject(); p.velocidade = this.velocidade; return p; }
}

// ===== CLASSE CARRO ESPORTIVO =====
/** @class CarroEsportivo @extends Carro */
class CarroEsportivo extends Carro {
    constructor(modelo, cor) {
        super(modelo, cor);
        this.turboAtivado = false;
        this.somTurbo = document.getElementById("somTurbo");
        this.somBuzina = document.getElementById("somBuzinaEsportivo");
    }
    desligar() { super.desligar(); this.turboAtivado = false; }
    ativarTurbo() {
        if (this.ligado) {
            if (!this.turboAtivado) {
                this.turboAtivado = true; if (this.somTurbo) this.somTurbo.play().catch(e => console.warn("Audio error (turbo):", e));
            } else { alert("O turbo já está ativado!"); }
        } else { alert("O carro precisa estar ligado para ativar o turbo!"); }
    }
    desativarTurbo() { this.turboAtivado = false; }
    acelerar() {
        if (this.ligado) {
            this.velocidade += (this.turboAtivado ? 30 : 15);
            if (this.somAceleracao) this.somAceleracao.play().catch(e => console.warn("Audio error (acelerar esportivo):", e));
        } else { alert("O carro precisa estar ligado para acelerar!"); }
    }
    toPlainObject() { const p = super.toPlainObject(); p.turboAtivado = this.turboAtivado; return p; }
}

// ===== CLASSE CAMINHAO =====
/** @class Caminhao @extends Carro */
class Caminhao extends Carro {
    constructor(modelo, cor, capacidadeCarga) {
        super(modelo, cor);
        const capNum = Number(capacidadeCarga);
        if (isNaN(capNum) || capNum <= 0) throw new Error("Capacidade de carga inválida.");
        this.capacidadeCarga = capNum;
        this.cargaAtual = 0;
        this.somBuzina = document.getElementById("somBuzinaCaminhao");
    }
    acelerar() {
        if (this.ligado) {
            const fator = Math.max(0.2, 1 - (this.cargaAtual / (this.capacidadeCarga * 1.5)));
            this.velocidade += Math.max(1, 5 * fator);
            if (this.somAceleracao) this.somAceleracao.play().catch(e => console.warn("Audio error (acelerar caminhao):", e));
        } else { alert("O caminhão precisa estar ligado para acelerar!"); }
    }
    frear() {
        if (this.ligado) {
            const fator = Math.max(0.3, 1 - (this.cargaAtual / (this.capacidadeCarga * 2.0)));
            this.velocidade = Math.max(0, this.velocidade - Math.max(2, 8 * fator));
        } else { alert("O caminhão precisa estar ligado para frear!"); }
    }
    carregar(qtd) {
        const q = Number(qtd);
        if (isNaN(q) || q <= 0) { alert("Quantidade para carregar deve ser um número positivo."); return false; }
        if (this.cargaAtual + q <= this.capacidadeCarga) {
            this.cargaAtual += q; alert(`Carregado ${q}kg. Carga atual: ${this.cargaAtual}kg.`); return true;
        } else { alert(`Não é possível carregar ${q}kg. Capacidade máxima de ${this.capacidadeCarga}kg excedida (carga atual ${this.cargaAtual}kg).`); return false; }
    }
    descarregar(qtd) {
        const q = Number(qtd);
        if (isNaN(q) || q <= 0) { alert("Quantidade para descarregar deve ser um número positivo."); return false; }
        if (this.cargaAtual - q >= 0) {
            this.cargaAtual -= q; alert(`Descarregado ${q}kg. Carga atual: ${this.cargaAtual}kg.`); return true;
        } else { alert(`Não é possível descarregar ${q}kg. Carga atual é de apenas ${this.cargaAtual}kg.`); return false; }
    }
    toPlainObject() {
        const p = super.toPlainObject();
        p.capacidadeCarga = this.capacidadeCarga;
        p.cargaAtual = this.cargaAtual;
        return p;
    }
}

// ===== API SIMULADA (DETALHES EXTRAS VEÍCULOS) =====
/**
 * Busca detalhes extras de um veículo em uma API simulada local (JSON).
 * @async
 * @param {string} identificadorVeiculo O ID do veículo.
 * @returns {Promise<object|null>}
 */
async function buscarDetalhesVeiculoAPI(identificadorVeiculo) {
    const url = './dados_veiculos_api.json';
    console.log("[API Simulada Veic] Buscando para ID:", identificadorVeiculo);
    console.log("[API Simulada Veic] URL da requisição:", url);
    try {
        const response = await fetch(url, { cache: "no-cache" });
        console.log("[API Simulada Veic] Resposta do fetch:", response);

        if (!response.ok) {
            console.error("[API Simulada Veic] Resposta não OK:", response.status, response.statusText);
            throw new Error(`HTTP error! status: ${response.status} ao buscar ${url}`);
        }

        const dadosTodos = await response.json();
        console.log("[API Simulada Veic] JSON completo carregado:", dadosTodos);

        if (!Array.isArray(dadosTodos)) {
            console.error("[API Simulada Veic] O JSON carregado não é um array!", dadosTodos);
            return null;
        }

        const detalhesEncontrados = dadosTodos.find(v => v.id === identificadorVeiculo);
        console.log("[API Simulada Veic] Detalhes encontrados para o ID:", detalhesEncontrados);

        return detalhesEncontrados || null;

    } catch (error) {
        console.error(`[API Simulada Veic] Erro ao buscar/processar dados_veiculos_api.json:`, error);
        return null;
    }
}

// ===== GERENCIAMENTO DA GARAGEM E PERSISTÊNCIA =====
let garagemVeiculos = [];
const STORAGE_KEY = 'minhaGaragemInteligenteDados_v2';

/** Salva a garagem no LocalStorage. */
function salvarGaragem() {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(garagemVeiculos.map(v => v.toPlainObject())));
    } catch (e) { console.error("Erro ao salvar garagem:", e); }
}

/** Carrega a garagem do LocalStorage. */
function carregarGaragem() {
    try {
        const dados = localStorage.getItem(STORAGE_KEY);
        if (dados) {
            garagemVeiculos = JSON.parse(dados).map(obj => Veiculo.fromPlainObject(obj)).filter(v => v !== null);
        } else { garagemVeiculos = []; }
    } catch (e) {
        console.error("Erro ao carregar garagem:", e);
        localStorage.removeItem(STORAGE_KEY);
        garagemVeiculos = [];
    }
    atualizarListaGaragemUI();
    verificarAgendamentosProximos();
}

/** Encontra veículo por ID. @param {string} id @returns {Veiculo|undefined} */
function encontrarVeiculoPorId(id) { return garagemVeiculos.find(v => v.id === id); }

// ===== LÓGICA DA INTERFACE (UI) E EVENTOS =====

/** Atualiza a lista de veículos na UI da garagem. */
function atualizarListaGaragemUI() {
    const listaDiv = document.getElementById('listaVeiculosGaragem');
    if (!listaDiv) return;
    listaDiv.innerHTML = garagemVeiculos.length === 0 ? '<p>Nenhum veículo na garagem.</p>' : '';
    if (garagemVeiculos.length > 0) {
        const ul = document.createElement('ul');
        garagemVeiculos.forEach(v => {
            const li = document.createElement('li');
            let tipo = v.constructor.name;
            if (tipo === 'Carro') tipo = 'Carro Comum';
            if (tipo === 'CarroEsportivo') tipo = 'Carro Esportivo';
            li.innerHTML = `
                <span>${tipo}: ${v.modelo} (${v.cor})</span>
                <div>
                    <button class="btn-ver-detalhes" data-veiculo-id="${v.id}">Ver Detalhes</button>
                    <button class="btn-buscar-detalhes-api" data-veiculo-id="${v.id}">Detalhes Extras</button>
                    <button class="btn-remover-veiculo" data-veiculo-id="${v.id}" title="Remover">×</button>
                </div>`;
            ul.appendChild(li);
        });
        listaDiv.appendChild(ul);
    }
}

/** Remove veículo da garagem. @param {string} veiculoId */
function removerVeiculoDaGaragem(veiculoId) {
    const idx = garagemVeiculos.findIndex(v => v.id === veiculoId);
    if (idx > -1) {
        alert(`Veículo ${garagemVeiculos[idx].modelo} removido.`);
        garagemVeiculos.splice(idx, 1);
        salvarGaragem();
        atualizarListaGaragemUI();
        mostrarTela("garagem");
    }
}

/** Exibe histórico e agendamentos de manutenção na UI. @param {Veiculo} veiculo */
function exibirHistoricoEAgendamentos(veiculo) {
    if (!veiculo) return;
    const tipo = veiculo.constructor.name;
    const histUl = document.getElementById(`historicoManutencao${tipo}`);
    const agenUl = document.getElementById(`agendamentosFuturos${tipo}`);
    const veicIdInput = document.getElementById(`agendamentoVeiculoId${tipo}`);

    if (!histUl || !agenUl || !veicIdInput) return;
    veicIdInput.value = veiculo.id;
    histUl.innerHTML = ''; agenUl.innerHTML = '';

    const criarLi = (item, vId) => {
        const li = document.createElement('li');
        li.innerHTML = `${item.texto} <button class="btn-remover-manutencao" data-manutencao-id="${item.id}" data-veiculo-id="${vId}" title="Remover">×</button>`;
        return li;
    };
    veiculo.getHistoricoFormatado().forEach(item => histUl.appendChild(criarLi(item, veiculo.id)));
    if (histUl.children.length === 0) histUl.innerHTML = '<li>Nenhum histórico.</li>';
    veiculo.getAgendamentosFuturosFormatado().forEach(item => agenUl.appendChild(criarLi(item, veiculo.id)));
    if (agenUl.children.length === 0) agenUl.innerHTML = '<li>Nenhum agendamento.</li>';
}

/** Controla qual tela é exibida. @param {string} idTela */
function mostrarTela(idTela) {
    ["menuPrincipal", "garagem", "informacoesCarro", "informacoesCarroEsportivo", "informacoesCaminhao"]
        .forEach(id => {
            const el = document.getElementById(id);
            if (el) el.style.display = (id === idTela) ? "block" : "none";
        });
}

/** Mostra detalhes de um veículo. @param {string} veiculoId */
function mostrarDetalhesVeiculo(veiculoId) {
    const v = encontrarVeiculoPorId(veiculoId);
    if (!v) { alert("Veículo não encontrado!"); mostrarTela("garagem"); return; }

    const tipo = v.constructor.name;
    const divId = `informacoes${tipo}`;
    mostrarTela(divId);
    const divInfo = document.getElementById(divId);

    if (divInfo) {
        document.getElementById(`modelo${tipo}`).textContent = v.modelo;
        document.getElementById(`cor${tipo}`).textContent = v.cor;
        document.getElementById(`velocidade${tipo}`).textContent = (v.velocidade !== undefined) ? v.velocidade.toFixed(1) : 'N/A';
        const statusEl = document.getElementById(`status${tipo}`);
        statusEl.textContent = v.ligado ? "Ligado" : "Desligado";

        divInfo.querySelectorAll('button[data-veiculo-id]').forEach(btn => btn.dataset.veiculoId = veiculoId);

        if (tipo === 'CarroEsportivo') document.getElementById(`turboCarroEsportivo`).textContent = v.turboAtivado ? "Ativado" : "Desativado";
        if (tipo === 'Caminhao') {
            document.getElementById(`capacidadeCargaCaminhao`).textContent = v.capacidadeCarga;
            document.getElementById(`cargaAtualCaminhao`).textContent = v.cargaAtual;
            const qtdCargaInput = document.getElementById("quantidadeCarga");
            if (qtdCargaInput && !qtdCargaInput.value) qtdCargaInput.value = 1000;
        }
        const btnLigar = document.getElementById(`ligarDesligar${tipo}`);
        if (btnLigar) {
            btnLigar.textContent = v.ligado ? "Desligar" : "Ligar";
            btnLigar.dataset.estado = v.ligado ? "ligado" : "desligado";
        }
        exibirHistoricoEAgendamentos(v);
        const apiDiv = document.getElementById(`detalhesApi${tipo}`);
        if (apiDiv) apiDiv.innerHTML = '<p style="font-style: italic; color: #6c757d;">Clique em "Detalhes Extras" na garagem para carregar.</p>';
    } else { mostrarTela("garagem"); }
}

// --- Event Listeners Globais e de Navegação ---
document.body.addEventListener('click', async (event) => {
    const target = event.target;
    const veiculoId = target.dataset.veiculoId;

    if (target.classList.contains('btn-ver-detalhes') && veiculoId) {
        mostrarDetalhesVeiculo(veiculoId);
    } else if (target.classList.contains('btn-remover-veiculo') && veiculoId) {
        const v = encontrarVeiculoPorId(veiculoId);
        if (v && confirm(`Remover ${v.modelo}?`)) removerVeiculoDaGaragem(veiculoId);
    } else if (target.classList.contains('btn-remover-manutencao')) {
        const manutId = target.dataset.manutencaoId;
        const vId = target.dataset.veiculoId;
        const v = encontrarVeiculoPorId(vId);
        if (v && manutId && confirm("Remover este registro de manutenção?")) {
            if (v.removerManutencao(manutId)) {
                salvarGaragem();
                exibirHistoricoEAgendamentos(v);
            }
        }
    } else if (target.classList.contains('btn-buscar-detalhes-api') && veiculoId) {
        const v = encontrarVeiculoPorId(veiculoId);
        if (!v) return;
        mostrarDetalhesVeiculo(veiculoId);
        const apiDiv = document.getElementById(`detalhesApi${v.constructor.name}`);
        if (!apiDiv) return;

        apiDiv.innerHTML = "<p>Carregando detalhes extras...</p>";
        target.disabled = true;
        const detalhes = await buscarDetalhesVeiculoAPI(veiculoId);
        target.disabled = false;
        if (detalhes) {
            apiDiv.innerHTML = `
                <ul>
                    <li><strong>Valor FIPE (simulado):</strong> ${detalhes.valorFipe || 'N/D'}</li>
                    <li><strong>Recall Pendente:</strong> ${detalhes.recallPendente ? `<strong style="color:red;">Sim</strong> ${detalhes.recallDetalhe ? `(${detalhes.recallDetalhe})` : ''}` : 'Não'}</li>
                    <li><strong>Última Revisão:</strong> ${detalhes.ultimaRevisaoConcessionaria || 'N/D'}</li>
                    <li><strong>Dica:</strong> ${detalhes.dicaManutencao || 'N/A'}</li>
                    <li><strong>Falha Comum:</strong> ${detalhes.componenteComumFalha || 'N/A'}</li>
                </ul>`;
        } else {
            apiDiv.innerHTML = '<p style="color: orange;">Detalhes extras não encontrados ou ocorreu um erro ao buscar.</p>';
        }
    } else if (veiculoId) {
        const v = encontrarVeiculoPorId(veiculoId);
        if (!v) return;
        const tipo = v.constructor.name;
        let salvar = false;

        if (target.id === `ligarDesligar${tipo}`) { v.ligado ? v.desligar() : v.ligar(); mostrarDetalhesVeiculo(veiculoId); salvar = true; }
        else if (target.id === `acelerar${tipo}`) { v.acelerar(); document.getElementById(`velocidade${tipo}`).textContent = v.velocidade.toFixed(1); }
        else if (target.id === `frear${tipo}`) { v.frear(); document.getElementById(`velocidade${tipo}`).textContent = v.velocidade.toFixed(1); }
        else if (target.id.startsWith('buzinar')) { v.buzinar(); }
        else if (target.id === `ativarTurbo` && v instanceof CarroEsportivo) { v.ativarTurbo(); document.getElementById(`turboCarroEsportivo`).textContent = "Ativado"; salvar = true; }
        else if (target.id === `desativarTurbo` && v instanceof CarroEsportivo) { v.desativarTurbo(); document.getElementById(`turboCarroEsportivo`).textContent = "Desativado"; salvar = true; }
        else if (target.id === `carregarCaminhao` && v instanceof Caminhao) {
            const qtd = document.getElementById("quantidadeCarga")?.value;
            if (v.carregar(qtd)) { document.getElementById(`cargaAtualCaminhao`).textContent = v.cargaAtual; salvar = true; }
        } else if (target.id === `descarregarCaminhao` && v instanceof Caminhao) {
            const qtd = document.getElementById("quantidadeCarga")?.value;
            if (v.descarregar(qtd)) { document.getElementById(`cargaAtualCaminhao`).textContent = v.cargaAtual; salvar = true; }
        }
        if (salvar) salvarGaragem();
    }
});

document.getElementById("botaoGaragem")?.addEventListener("click", () => mostrarTela("garagem"));
document.getElementById("voltarParaMenuPrincipalGaragem")?.addEventListener("click", () => mostrarTela("menuPrincipal"));
document.getElementById("voltarParaGaragemCarro")?.addEventListener("click", () => mostrarTela("garagem"));
document.getElementById("voltarParaGaragemEsportivo")?.addEventListener("click", () => mostrarTela("garagem"));
document.getElementById("voltarParaGaragemCaminhao")?.addEventListener("click", () => mostrarTela("garagem"));

document.getElementById('formAdicionarVeiculo')?.addEventListener('submit', function(e) {
    e.preventDefault();
    const tipo = document.getElementById('tipoNovoVeiculo').value;
    const modelo = document.getElementById('modeloNovoVeiculo').value;
    const cor = document.getElementById('corNovoVeiculo').value;
    const capacidade = document.getElementById('capacidadeNovoCaminhao').value;
    let novoV;
    try {
        if (tipo === 'Carro') novoV = new Carro(modelo, cor);
        else if (tipo === 'CarroEsportivo') novoV = new CarroEsportivo(modelo, cor);
        else if (tipo === 'Caminhao') novoV = new Caminhao(modelo, cor, capacidade);
        else throw new Error("Tipo de veículo inválido selecionado.");

        garagemVeiculos.push(novoV);
        salvarGaragem();
        atualizarListaGaragemUI();
        alert(`${tipo === 'Carro' ? 'Carro Comum' : tipo} "${modelo}" adicionado à garagem!`);
        this.reset();
        document.getElementById('campoCapacidadeCaminhao').style.display = (document.getElementById('tipoNovoVeiculo').value === 'Caminhao' ? 'flex' : 'none');
    } catch (err) { alert(`Erro ao adicionar veículo: ${err.message}`); }
});

document.getElementById('tipoNovoVeiculo')?.addEventListener('change', function() {
    document.getElementById('campoCapacidadeCaminhao').style.display = this.value === 'Caminhao' ? 'flex' : 'none';
});

function handleAgendamento(event) {
    event.preventDefault();
    const form = event.target;
    const veiculoId = form.querySelector('input[type="hidden"]')?.value;
    if (!veiculoId) { alert("Erro: ID do veículo não encontrado no formulário."); return; }
    const v = encontrarVeiculoPorId(veiculoId);
    if (!v) { alert("Erro: Veículo não encontrado para agendamento."); return; }

    const data = form.querySelector('input[type="date"]')?.value;
    const hora = form.querySelector('input[type="time"]')?.value || '00:00';
    const tipoServ = form.querySelector('input[type="text"]')?.value;
    const custo = form.querySelector('input[type="number"]')?.value;
    const desc = form.querySelector('textarea')?.value;

    if (!data || !tipoServ || !custo) { alert("Por favor, preencha Data, Tipo de Serviço e Custo."); return; }
    try {
        const manut = new Manutencao(`${data}T${hora}`, tipoServ, custo, desc);
        if (v.adicionarManutencao(manut)) {
            salvarGaragem();
            exibirHistoricoEAgendamentos(v);
            alert("Manutenção/Agendamento adicionado com sucesso!");
            form.reset();
        } else { alert("Falha ao adicionar manutenção ao veículo."); }
    } catch (err) { alert(`Erro no agendamento: ${err.message}`); }
}
['formAgendamentoCarro', 'formAgendamentoCarroEsportivo', 'formAgendamentoCaminhao'].forEach(id => {
    document.getElementById(id)?.addEventListener('submit', handleAgendamento);
});

function verificarAgendamentosProximos() {
    const hoje = new Date(); hoje.setHours(0,0,0,0);
    const amanha = new Date(hoje); amanha.setDate(hoje.getDate() + 1);
    let alertas = [];
    garagemVeiculos.forEach(v => {
        v.historicoManutencao.forEach(m => {
            if (m.isFuture()) {
                const dataM = m.getDataObj(); const dataMSemHora = new Date(dataM); dataMSemHora.setHours(0,0,0,0);
                const horaF = dataM.toLocaleTimeString('pt-BR', {hour:'2-digit', minute:'2-digit'});
                let tipoN = v.constructor.name; if (tipoN==='Carro') tipoN = 'Carro Comum'; if (tipoN==='CarroEsportivo') tipoN = 'Carro Esportivo';
                if (dataMSemHora.getTime() === hoje.getTime()) alertas.push(`🚨 HOJE: ${tipoN} ${v.modelo} - ${m.tipo} às ${horaF}`);
                else if (dataMSemHora.getTime() === amanha.getTime()) alertas.push(`🔔 AMANHÃ: ${tipoN} ${v.modelo} - ${m.tipo} às ${horaF}`);
            }
        });
    });
    if (alertas.length > 0) setTimeout(() => alert("Lembretes de Agendamento:\n\n" + alertas.join("\n")), 1500);
}


// =============================================
//        LÓGICA DA API OPENWEATHERMAP (MODIFICADA)
// =============================================

// A constante OPENWEATHER_API_KEY foi REMOVIDA daqui. Ela está segura no backend!

/**
 * Busca a previsão do tempo detalhada (5 dias / 3 horas) para uma cidade,
 * utilizando nosso backend como proxy.
 * @async
 * @param {string} cidade - O nome da cidade.
 * @returns {Promise<object|null>} Dados da previsão ou null em caso de erro.
 */
async function buscarPrevisaoDetalhada(cidade) {
    const cidadeCodificada = encodeURIComponent(cidade);
    // A URL agora aponta para o seu servidor backend na porta 3001
    const url = `http://localhost:3001/api/previsao/${cidadeCodificada}`;

    console.log(`[Frontend] Buscando previsão para: ${cidade} via backend.`);
    console.log(`[Frontend] URL para o backend: ${url}`);

    try {
        const response = await fetch(url); // O fetch agora chama SEU backend
        console.log("[Frontend] Resposta do fetch do backend:", response);

        if (!response.ok) {
            // Tenta pegar a mensagem de erro do JSON que o backend envia
            const errorData = await response.json().catch(() => ({}));
            // A mensagem de erro agora vem do seu backend
            throw new Error(errorData.error || `Erro ${response.status} ao buscar previsão do backend.`);
        }

        const data = await response.json();
        console.log("[Frontend] Dados da previsão recebidos do backend:", data);
        // 'data' aqui deve ter o mesmo formato que a OpenWeatherMap enviava antes,
        // pois nosso backend está apenas repassando.
        return data;

    } catch (error) {
        console.error("[Frontend] Erro ao buscar previsão via backend:", error);
        // Você pode querer atualizar a mensagem de alerta para o usuário.
        // A função exibirPrevisaoDetalhada já lida com a UI de erro se 'data' for null.
        alert(`Falha ao buscar previsão para "${cidade}": ${error.message}. Verifique o nome da cidade e se o servidor backend está rodando.`);
        return null;
    }
}

// As funções processarDadosForecast(dataAPI) e exibirPrevisaoDetalhada(previsaoDiariaProcessada, nomeCidade)
// DEVEM PERMANECER COMO ESTÃO no seu script.js original, pois o formato dos dados que
// o backend envia é o mesmo que a OpenWeatherMap enviava diretamente.
// Vou incluí-las aqui para garantir que você as mantenha, mas elas NÃO MUDAM.

/**
 * Processa os dados brutos da API de forecast, agrupando por dia.
 * @param {object} dataAPI - Dados da API OpenWeatherMap.
 * @returns {Array<object>|null} Array de objetos com resumo diário ou null.
 */
function processarDadosForecast(dataAPI) {
    if (!dataAPI || !dataAPI.list || !Array.isArray(dataAPI.list) || dataAPI.list.length === 0) {
        console.error("[ProcessamentoForecast] Dados da API inválidos ou lista de previsões vazia.", dataAPI);
        return null;
    }
    const previsaoPorDia = {};
    dataAPI.list.forEach(item => {
        const dataHora = item.dt_txt;
        const dia = dataHora.split(' ')[0];
        if (!previsaoPorDia[dia]) {
            previsaoPorDia[dia] = { temperaturas: [], momentos: [] };
        }
        previsaoPorDia[dia].temperaturas.push(item.main.temp);
        previsaoPorDia[dia].momentos.push({
            hora: dataHora.split(' ')[1].substring(0, 5),
            temp: item.main.temp,
            descricao: item.weather[0].description,
            icone: item.weather[0].icon
        });
    });

    const resultadoFinal = Object.keys(previsaoPorDia).map(dia => {
        const dadosDia = previsaoPorDia[dia];
        const temp_min = Math.min(...dadosDia.temperaturas);
        const temp_max = Math.max(...dadosDia.temperaturas);
        const itemRep = dadosDia.momentos.find(m => m.hora === "12:00" || m.hora === "15:00") || dadosDia.momentos[Math.floor(dadosDia.momentos.length / 2)] || dadosDia.momentos[0];

        return {
            data: dia,
            temp_min: parseFloat(temp_min.toFixed(1)),
            temp_max: parseFloat(temp_max.toFixed(1)),
            descricao: itemRep.descricao.charAt(0).toUpperCase() + itemRep.descricao.slice(1),
            icone: itemRep.icone,
        };
    }).sort((a, b) => new Date(a.data) - new Date(b.data));
    console.log("[ProcessamentoForecast] Dados processados por dia:", resultadoFinal);
    return resultadoFinal;
}

/**
 * Exibe a previsão do tempo detalhada na UI.
 * @param {Array<object>|null} previsaoDiariaProcessada - Dados processados.
 * @param {string} nomeCidade - Nome da cidade.
 */
function exibirPrevisaoDetalhada(previsaoDiariaProcessada, nomeCidade) {
    const resultadoDiv = document.getElementById("previsao-detalhada-resultado");
    const statusDiv = document.getElementById("previsao-detalhada-status");

    if (!resultadoDiv || !statusDiv) {
        console.error("Elementos da UI para previsão detalhada não encontrados.");
        return;
    }
    resultadoDiv.innerHTML = "";
    statusDiv.textContent = "";

    if (!previsaoDiariaProcessada || previsaoDiariaProcessada.length === 0) {
        // A mensagem de erro já é tratada no catch de buscarPrevisaoDetalhada ou se dados forem nulos
        // Podemos manter ou simplificar aqui.
        resultadoDiv.innerHTML = `<p>Não foi possível exibir a previsão para ${nomeCidade}. Verifique o console para detalhes.</p>`;
        return;
    }

    const tituloH3 = document.createElement("h3");
    tituloH3.textContent = `Previsão para ${nomeCidade.charAt(0).toUpperCase() + nomeCidade.slice(1)}`;
    tituloH3.style.width = "100%";
    tituloH3.style.textAlign = "center";
    tituloH3.style.marginBottom = "15px";
    resultadoDiv.appendChild(tituloH3);

    previsaoDiariaProcessada.forEach(dia => {
        const diaDiv = document.createElement("div");
        diaDiv.classList.add("dia-previsao");
        const [ano, mes, diaNum] = dia.data.split('-');
        const dataFormatada = `${diaNum}/${mes}/${ano}`;
        diaDiv.innerHTML = `
            <h4>${dataFormatada}</h4>
            <img src="https://openweathermap.org/img/wn/${dia.icone}@2x.png" alt="${dia.descricao}">
            <p class="temperaturas">
                <span class="temp-max">${dia.temp_max}°C</span> /
                <span class="temp-min">${dia.temp_min}°C</span>
            </p>
            <p class="descricao-tempo">${dia.descricao}</p>
        `;
        resultadoDiv.appendChild(diaDiv);
    });
}

// O event listener para o botão "verificar-clima-detalhado-btn"
// DEVE PERMANECER COMO ESTÁ no seu script.js original, pois ele já chama
// buscarPrevisaoDetalhada, processarDadosForecast e exibirPrevisaoDetalhada
// na sequência correta. Ele não precisa de alterações.
// Vou incluir uma cópia dele aqui para referência, mas ele NÃO MUDA.
const btnVerClimaDetalhado = document.getElementById("verificar-clima-detalhado-btn");
const inputCidadeClima = document.getElementById("cidade-input");
const statusDivClima = document.getElementById("previsao-detalhada-status");
const resultadoDivClima = document.getElementById("previsao-detalhada-resultado");

if (btnVerClimaDetalhado && inputCidadeClima && statusDivClima && resultadoDivClima) {
    btnVerClimaDetalhado.addEventListener("click", async () => {
        const cidade = inputCidadeClima.value.trim();
        if (!cidade) { alert("Por favor, digite o nome de uma cidade."); return; }

        statusDivClima.textContent = `Carregando previsão para ${cidade}...`;
        resultadoDivClima.innerHTML = "";
        btnVerClimaDetalhado.disabled = true;

        try {
            const dadosApi = await buscarPrevisaoDetalhada(cidade); // Chama a função MODIFICADA
            if (dadosApi) {
                const previsaoProcessada = processarDadosForecast(dadosApi); // Função original
                exibirPrevisaoDetalhada(previsaoProcessada, cidade);    // Função original
                statusDivClima.textContent = ""; // Limpa o status se sucesso
            } else {
                // A função buscarPrevisaoDetalhada já deve ter mostrado um alerta ou logado o erro.
                // exibirPrevisaoDetalhada(null, cidade) vai mostrar uma mensagem genérica de falha na UI.
                exibirPrevisaoDetalhada(null, cidade);
                statusDivClima.textContent = `Falha ao carregar dados para ${cidade}.`; // Pode ser redundante se o alerta já apareceu
            }
        } catch (error) {
            // Este catch é mais para erros inesperados no fluxo do event listener,
            // já que buscarPrevisaoDetalhada tem seu próprio try/catch.
            console.error("Erro no fluxo principal de busca de previsão detalhada:", error);
            statusDivClima.textContent = `Ocorreu um erro inesperado: ${error.message}`;
            exibirPrevisaoDetalhada(null, cidade);
        } finally {
            btnVerClimaDetalhado.disabled = false;
        }
    });
} else {
    console.warn("Elementos da UI para previsão do tempo detalhada não foram encontrados. Funcionalidade desabilitada.");
}
// --- Inicialização ---
window.addEventListener('load', () => {
    console.log("Página carregada. Inicializando Garagem Inteligente...");
    carregarGaragem();
    mostrarTela("menuPrincipal");
    const tipoSelect = document.getElementById('tipoNovoVeiculo');
    if(tipoSelect) {
      document.getElementById('campoCapacidadeCaminhao').style.display = tipoSelect.value === 'Caminhao' ? 'flex' : 'none';
    }
    console.log("Garagem Inteligente pronta.");
});