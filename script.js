// =============================================
//        SCRIPT COMPLETO - GARAGEM INTELIGENTE
// =============================================

// ===== CLASSE MANUTENCAO =====
class Manutencao {
    constructor(data, tipo, custo, descricao = '') {
        const dataObj = new Date(data);
        if (!this.validarData(dataObj)) {
            throw new Error("Data inválida fornecida para manutenção.");
        }
        if (typeof tipo !== 'string' || tipo.trim() === '') {
            throw new Error("Tipo de manutenção inválido.");
        }
        const custoNum = parseFloat(custo);
        if (isNaN(custoNum) || custoNum < 0) {
            throw new Error("Custo da manutenção inválido.");
        }
        this.data = dataObj.toISOString();
        this.tipo = tipo.trim();
        this.custo = custoNum;
        this.descricao = descricao.trim();
        this.id = `m-${Date.now()}-${Math.random().toString(16).substring(2, 8)}`;
    }
    validarData(data) {
        return data instanceof Date && !isNaN(data);
    }
    getDataObj() {
        return new Date(this.data);
    }
    formatar() {
        const dataFormatada = this.getDataObj().toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
        const custoFormatado = this.custo.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
        let str = `${this.tipo} em ${dataFormatada} - ${custoFormatado}`;
        if (this.descricao) { str += ` (${this.descricao})`; }
        return str;
    }
    formatarAgendamento() {
        const dataFormatada = this.getDataObj().toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
        let str = `${this.tipo} agendado para ${dataFormatada}`;
        if (this.descricao) { str += ` - Obs: ${this.descricao}`; }
        return str;
    }
    isFuture() {
        return this.getDataObj() > new Date();
    }
    static fromPlainObject(obj) {
        try {
            const manutencao = new Manutencao(obj.data, obj.tipo, obj.custo, obj.descricao);
            manutencao.id = obj.id || `m-${Date.now()}-${Math.random().toString(16).substring(2, 8)}`;
            return manutencao;
        } catch (error) {
            console.error("Erro ao recriar Manutencao a partir de objeto:", error, obj);
            return null;
        }
    }
}

// ===== CLASSE VEICULO (BASE) =====
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
    ligar() {
        if (!this.ligado) {
            this.ligado = true;
            console.log(`${this.constructor.name} ${this.modelo} ligado!`);
            if (this.somLigando) this.somLigando.play().catch(e => console.error("Erro ao tocar som ligando:", e));
        }
    }
    desligar() {
        if (this.ligado) {
            this.ligado = false;
            console.log(`${this.constructor.name} ${this.modelo} desligado!`);
        }
    }
    buzinar() { console.log("Bi bi! (Som genérico)"); }
    adicionarManutencao(manutencao) {
        if (!(manutencao instanceof Manutencao)) {
            console.error("Tentativa de adicionar item inválido ao histórico de manutenção.");
            alert("Erro interno: Objeto de manutenção inválido.");
            return false;
        }
        this.historicoManutencao.push(manutencao);
        this.historicoManutencao.sort((a, b) => b.getDataObj() - a.getDataObj());
        console.log(`Manutenção adicionada ao ${this.modelo}: ${manutencao.formatar()}`);
        return true;
    }
    removerManutencao(idManutencao) {
        const index = this.historicoManutencao.findIndex(m => m.id === idManutencao);
        if (index > -1) {
            const removida = this.historicoManutencao.splice(index, 1);
            console.log(`Manutenção ${removida[0]?.tipo || idManutencao} removida do ${this.modelo}`);
            return true;
        }
        console.warn(`Manutenção ${idManutencao} não encontrada para remoção no ${this.modelo}`);
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
            id: this.id,
            tipoVeiculo: this.constructor.name,
            modelo: this.modelo,
            cor: this.cor,
            ligado: this.ligado,
            historicoManutencao: this.historicoManutencao.map(m => ({
                id: m.id, data: m.data, tipo: m.tipo, custo: m.custo, descricao: m.descricao
            })),
        };
    }
    static fromPlainObject(obj) {
        let veiculo = null;
        try {
            switch (obj.tipoVeiculo) {
                case 'Carro':
                    veiculo = new Carro(obj.modelo, obj.cor);
                    break;
                case 'CarroEsportivo':
                    veiculo = new CarroEsportivo(obj.modelo, obj.cor);
                    veiculo.turboAtivado = obj.turboAtivado || false;
                    break;
                case 'Caminhao':
                    const capacidade = Number(obj.capacidadeCarga);
                    veiculo = new Caminhao(obj.modelo, obj.cor, isNaN(capacidade) || capacidade <= 0 ? 10000 : capacidade);
                    veiculo.cargaAtual = Number(obj.cargaAtual) || 0;
                    break;
                default:
                    throw new Error(`Tipo de veículo desconhecido: ${obj.tipoVeiculo}`);
            }
            veiculo.id = obj.id || `v-${Date.now()}-${Math.random().toString(16).substring(2, 8)}`;
            veiculo.ligado = obj.ligado || false;
            veiculo.velocidade = Number(obj.velocidade) || 0;
            if (Array.isArray(obj.historicoManutencao)) {
                veiculo.historicoManutencao = obj.historicoManutencao
                    .map(mObj => Manutencao.fromPlainObject(mObj))
                    .filter(m => m !== null);
                veiculo.historicoManutencao.sort((a, b) => b.getDataObj() - a.getDataObj());
            } else {
                veiculo.historicoManutencao = [];
            }
            return veiculo;
        } catch (error) {
            console.error(`Erro ao recriar veículo ${obj.modelo} (ID: ${obj.id}) do tipo ${obj.tipoVeiculo}:`, error);
            return null;
        }
    }
}

// ===== CLASSE CARRO =====
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
            if (this.somAceleracao) this.somAceleracao.play().catch(e => console.error("Erro ao tocar som aceleração:", e));
            console.log(`Acelerando! Velocidade atual: ${this.velocidade} km/h`);
        } else { alert("O carro precisa estar ligado para acelerar!"); }
    }
    frear() {
        if (this.ligado) {
            this.velocidade -= 10;
            if (this.velocidade < 0) { this.velocidade = 0; }
            console.log(`Freando! Velocidade atual: ${this.velocidade} km/h`);
        } else { alert("O carro precisa estar ligado para frear!"); }
    }
    buzinar() {
        if (this.somBuzina) this.somBuzina.play().catch(e => console.error("Erro ao tocar buzina:", e));
        else super.buzinar();
        console.log("Fon fon!");
    }
    toPlainObject() {
        const plain = super.toPlainObject();
        plain.velocidade = this.velocidade;
        return plain;
    }
}

// ===== CLASSE CARRO ESPORTIVO =====
class CarroEsportivo extends Carro {
    constructor(modelo, cor) {
        super(modelo, cor);
        this.turboAtivado = false;
        this.somTurbo = document.getElementById("somTurbo");
        this.somBuzina = document.getElementById("somBuzinaEsportivo");
    }
    ligar() { super.ligar(); }
    desligar() { super.desligar(); this.turboAtivado = false; }
    ativarTurbo() {
        if (this.ligado) {
            if (!this.turboAtivado) {
                this.turboAtivado = true;
                if (this.somTurbo) this.somTurbo.play().catch(e => console.error("Erro ao tocar som turbo:", e));
                console.log("Turbo ativado!");
            } else { alert("O turbo já está ativado!"); }
        } else { alert("O carro precisa estar ligado para ativar o turbo!"); }
    }
    desativarTurbo() {
        if (this.turboAtivado) { this.turboAtivado = false; console.log("Turbo desativado!"); }
    }
    acelerar() {
        if (this.ligado) {
            const incremento = this.turboAtivado ? 30 : 15;
            this.velocidade += incremento;
            if (this.somAceleracao) this.somAceleracao.play().catch(e => console.error("Erro ao tocar som aceleração:", e));
            console.log(`Acelerando ${this.turboAtivado ? 'com Turbo' : ''}! Velocidade atual: ${this.velocidade} km/h`);
        } else { alert("O carro precisa estar ligado para acelerar!"); }
    }
    buzinar() {
        if (this.somBuzina) this.somBuzina.play().catch(e => console.error("Erro ao tocar buzina:", e));
        else super.buzinar();
        console.log("Vrum vrum! (Buzina Esportiva)");
    }
    toPlainObject() {
        const plain = super.toPlainObject();
        plain.turboAtivado = this.turboAtivado;
        return plain;
    }
}

// ===== CLASSE CAMINHAO =====
class Caminhao extends Carro {
    constructor(modelo, cor, capacidadeCarga) {
        super(modelo, cor);
        if (isNaN(capacidadeCarga) || capacidadeCarga <= 0) throw new Error("Capacidade de carga inválida");
        this.capacidadeCarga = capacidadeCarga;
        this.cargaAtual = 0;
        this.somBuzina = document.getElementById("somBuzinaCaminhao");
    }
    acelerar() {
        if (this.ligado) {
            const fatorCarga = Math.max(0.2, 1 - (this.cargaAtual / (this.capacidadeCarga * 1.5)));
            const incremento = Math.max(1, 5 * fatorCarga);
            this.velocidade += incremento;
            if (this.somAceleracao) this.somAceleracao.play().catch(e => console.error("Erro ao tocar som aceleração:", e));
            console.log(`Caminhão acelerando! Carga: ${this.cargaAtual}kg. Velocidade: ${this.velocidade.toFixed(1)} km/h`);
        } else { alert("O caminhão precisa estar ligado para acelerar!"); }
    }
    frear() {
        if (this.ligado) {
            const fatorCarga = Math.max(0.3, 1 - (this.cargaAtual / (this.capacidadeCarga * 2.0)));
            const decremento = Math.max(2, 8 * fatorCarga);
            this.velocidade -= decremento;
            if (this.velocidade < 0) { this.velocidade = 0; }
            console.log(`Caminhão freando! Carga: ${this.cargaAtual}kg. Velocidade: ${this.velocidade.toFixed(1)} km/h`);
        } else { alert("O caminhão precisa estar ligado para frear!"); }
    }
    carregar(quantidade) {
        const qtdNum = Number(quantidade);
        if (isNaN(qtdNum) || qtdNum <= 0) { alert("A quantidade para carregar deve ser um número positivo."); return false; }
        if (this.cargaAtual + qtdNum <= this.capacidadeCarga) {
            this.cargaAtual += qtdNum;
            console.log(`Carregado ${qtdNum}kg. Carga atual: ${this.cargaAtual}kg.`);
            alert(`Carregado ${qtdNum}kg.\nCarga atual: ${this.cargaAtual}kg.`);
            return true;
        } else {
            alert(`Não é possível carregar ${qtdNum}kg. Capacidade máxima de ${this.capacidadeCarga}kg excedida (carga atual ${this.cargaAtual}kg).`);
            return false;
        }
    }
    descarregar(quantidade) {
        const qtdNum = Number(quantidade);
        if (isNaN(qtdNum) || qtdNum <= 0) { alert("A quantidade para descarregar deve ser um número positivo."); return false; }
        if (this.cargaAtual - qtdNum >= 0) {
            this.cargaAtual -= qtdNum;
            console.log(`Descarregado ${qtdNum}kg. Carga atual: ${this.cargaAtual}kg.`);
            alert(`Descarregado ${qtdNum}kg.\nCarga atual: ${this.cargaAtual}kg.`);
            return true;
        } else {
            alert(`Não é possível descarregar ${qtdNum}kg. Carga atual é de apenas ${this.cargaAtual}kg.`);
            return false;
        }
    }
    buzinar() {
        if (this.somBuzina) this.somBuzina.play().catch(e => console.error("Erro ao tocar buzina:", e));
        else super.buzinar();
        console.log("Fóóóóóm! (Buzina de Caminhão)");
    }
    toPlainObject() {
        const plain = super.toPlainObject();
        plain.capacidadeCarga = this.capacidadeCarga;
        plain.cargaAtual = this.cargaAtual;
        return plain;
    }
}

// ===== API SIMULADA - BUSCA DETALHES EXTRAS =====

/**
 * Busca detalhes extras de um veículo em uma API simulada local (JSON).
 * @async
 * @function buscarDetalhesVeiculoAPI
 * @param {string} identificadorVeiculo O ID único do veículo a ser buscado.
 * @returns {Promise<object|null>} Uma Promise que resolve com o objeto de detalhes do veículo ou null se não encontrado ou em caso de erro.
 * @throws {Error} Pode lançar erros de rede ou JSON parsing, tratados internamente com try...catch.
 */
async function buscarDetalhesVeiculoAPI(identificadorVeiculo) {
    const url = './dados_veiculos_api.json'; // Caminho relativo para o arquivo JSON local
    console.log(`[API Simulada] Buscando detalhes para o veículo ID: ${identificadorVeiculo}`); // Log para depuração

    try {
        const response = await fetch(url, { cache: "no-cache" }); // Adiciona no-cache para evitar problemas durante testes

        if (!response.ok) {
            console.error(`[API Simulada] Erro HTTP: ${response.status} - ${response.statusText} ao buscar ${url}`);
            return null;
        }

        const dadosTodosVeiculos = await response.json(); // Parseia o corpo da resposta como JSON
        const detalhesVeiculo = dadosTodosVeiculos.find(veiculo => veiculo.id === identificadorVeiculo);

        if (detalhesVeiculo) {
            console.log("[API Simulada] Detalhes encontrados:", detalhesVeiculo);
            return detalhesVeiculo;
        } else {
            console.log(`[API Simulada] Veículo com ID ${identificadorVeiculo} não encontrado nos dados da API.`);
            return null;
        }

    } catch (error) {
        console.error(`[API Simulada] Erro ao buscar ou processar detalhes do veículo (${identificadorVeiculo}):`, error);
        return null;
    }
}


// ===== GERENCIAMENTO DA GARAGEM E PERSISTÊNCIA =====

let garagemVeiculos = [];
const STORAGE_KEY = 'minhaGaragemInteligenteDados';

function salvarGaragem() {
    try {
        const garagemParaSalvar = garagemVeiculos.map(v => v.toPlainObject());
        localStorage.setItem(STORAGE_KEY, JSON.stringify(garagemParaSalvar));
        console.log(`Garagem salva com ${garagemParaSalvar.length} veículos.`);
    } catch (error) {
        console.error("Erro ao salvar garagem no LocalStorage:", error);
        alert("Erro ao salvar dados da garagem. Verifique o console.");
    }
}

function carregarGaragem() {
    try {
        const dadosSalvos = localStorage.getItem(STORAGE_KEY);
        if (dadosSalvos) {
            const garagemPura = JSON.parse(dadosSalvos);
            garagemVeiculos = garagemPura
                .map(obj => Veiculo.fromPlainObject(obj))
                .filter(v => v !== null);
            console.log(`Garagem carregada com ${garagemVeiculos.length} veículos.`);
        } else {
            console.log("Nenhum dado salvo encontrado. Iniciando com garagem vazia.");
            garagemVeiculos = [];
        }
    } catch (error) {
        console.error("Erro crítico ao carregar ou processar dados da garagem:", error);
        alert("Erro ao carregar dados da garagem. Os dados podem estar corrompidos. Iniciando garagem vazia. Verifique o console.");
        localStorage.removeItem(STORAGE_KEY);
        garagemVeiculos = [];
    }
    atualizarListaGaragemUI();
    verificarAgendamentosProximos();
}

function encontrarVeiculoPorId(id) {
    return garagemVeiculos.find(v => v.id === id);
}

// ===== LÓGICA DA INTERFACE E EVENTOS =====

function atualizarListaGaragemUI() {
    const listaDiv = document.getElementById('listaVeiculosGaragem');
    if (!listaDiv) return;
    listaDiv.innerHTML = '';

    if (garagemVeiculos.length === 0) {
        listaDiv.innerHTML = '<p>Nenhum veículo na garagem.</p>';
        return;
    }

    const ul = document.createElement('ul');
    garagemVeiculos.forEach(veiculo => {
        const li = document.createElement('li');
        let tipoNome = veiculo.constructor.name;
        if (tipoNome === 'Carro') tipoNome = 'Carro Comum';
        if (tipoNome === 'CarroEsportivo') tipoNome = 'Carro Esportivo';

        // --- HTML da Lista Atualizado ---
        li.innerHTML = `
            <span>${tipoNome}: ${veiculo.modelo} (${veiculo.cor})</span>
            <div> <!-- Agrupa botões -->
                <button class="btn-ver-detalhes" data-veiculo-id="${veiculo.id}">Ver Detalhes</button>
                <button class="btn-buscar-detalhes-api" data-veiculo-id="${veiculo.id}">Ver Detalhes Extras</button> <!-- BOTÃO ATUALIZADO -->
                <button class="btn-remover-veiculo" data-veiculo-id="${veiculo.id}" title="Remover Veículo">×</button> <!-- Estilo movido para CSS -->
             </div>
        `;
        ul.appendChild(li);
    });
    listaDiv.appendChild(ul);
}

function removerVeiculoDaGaragem(veiculoId) {
    const index = garagemVeiculos.findIndex(v => v.id === veiculoId);
    if (index > -1) {
        const modeloRemovido = garagemVeiculos[index].modelo;
        garagemVeiculos.splice(index, 1);
        salvarGaragem();
        atualizarListaGaragemUI();
        mostrarGaragem();
        alert(`Veículo ${modeloRemovido} removido com sucesso.`);
    } else {
        alert("Erro: Veículo não encontrado para remoção.");
    }
}

function exibirHistoricoEAgendamentos(veiculo) {
    if (!veiculo) return;
    const tipo = veiculo.constructor.name;
    const idBase = tipo.charAt(0).toLowerCase() + tipo.slice(1);
    const historicoUl = document.getElementById(`historicoManutencao${tipo}`);
    const agendamentosUl = document.getElementById(`agendamentosFuturos${tipo}`);
    const inputVeiculoId = document.getElementById(`agendamentoVeiculoId${tipo}`);

    if (!historicoUl || !agendamentosUl || !inputVeiculoId) {
        console.warn(`Elementos de manutenção não encontrados para o tipo ${tipo}. Verifique o HTML.`);
        return;
    }
    inputVeiculoId.value = veiculo.id;
    historicoUl.innerHTML = '';
    agendamentosUl.innerHTML = '';
    const historicoFormatado = veiculo.getHistoricoFormatado(true);
    const agendamentosFormatado = veiculo.getAgendamentosFuturosFormatado();

    const criarLiManutencao = (item) => {
        const li = document.createElement('li');
        const btnRemover = `<button class="btn-remover-manutencao" data-manutencao-id="${item.id}" data-veiculo-id="${veiculo.id}" title="Remover Registro">×</button>`; // Estilo movido para CSS
        li.innerHTML = item.texto + btnRemover;
        return li;
    }

    if (historicoFormatado.length > 0) {
        historicoFormatado.forEach(item => historicoUl.appendChild(criarLiManutencao(item)));
    } else { historicoUl.innerHTML = '<li>Nenhum histórico registrado.</li>'; }
    if (agendamentosFormatado.length > 0) {
        agendamentosFormatado.forEach(item => agendamentosUl.appendChild(criarLiManutencao(item)));
    } else { agendamentosUl.innerHTML = '<li>Nenhum agendamento futuro.</li>'; }
}

function mostrarTela(idTela) {
    document.getElementById("menuPrincipal").style.display = "none";
    document.getElementById("garagem").style.display = "none";
    document.getElementById("informacoesCarro").style.display = "none";
    document.getElementById("informacoesCarroEsportivo").style.display = "none";
    document.getElementById("informacoesCaminhao").style.display = "none";
    const tela = document.getElementById(idTela);
    if (tela) { tela.style.display = "block"; }
    else { console.error(`Tela com ID ${idTela} não encontrada!`); mostrarMenuPrincipal(); }
}

function mostrarMenuPrincipal() { mostrarTela("menuPrincipal"); }
function mostrarGaragem() { mostrarTela("garagem"); atualizarListaGaragemUI(); }

function mostrarDetalhesVeiculo(veiculoId) {
    const veiculo = encontrarVeiculoPorId(veiculoId);
    if (!veiculo) { console.error(`Veículo com ID ${veiculoId} não encontrado.`); alert("Erro: Veículo não encontrado."); mostrarGaragem(); return; }

    const tipo = veiculo.constructor.name;
    const idBaseDiv = `informacoes${tipo}`;
    mostrarTela(idBaseDiv);
    const divInfo = document.getElementById(idBaseDiv);

    if (divInfo) {
        document.getElementById(`modelo${tipo}`).textContent = veiculo.modelo;
        document.getElementById(`cor${tipo}`).textContent = veiculo.cor;
        document.getElementById(`velocidade${tipo}`).textContent = veiculo.velocidade !== undefined ? veiculo.velocidade.toFixed(1) : 'N/A';
        document.getElementById(`status${tipo}`).textContent = veiculo.ligado ? "Ligado" : "Desligado";
        divInfo.querySelectorAll('button[data-veiculo-id]').forEach(btn => { btn.dataset.veiculoId = veiculoId; });

        if (tipo === 'CarroEsportivo' && veiculo instanceof CarroEsportivo) {
            document.getElementById(`turboCarroEsportivo`).textContent = veiculo.turboAtivado ? "Ativado" : "Desativado";
        } else if (tipo === 'Caminhao' && veiculo instanceof Caminhao) {
            document.getElementById(`capacidadeCargaCaminhao`).textContent = veiculo.capacidadeCarga;
            document.getElementById(`cargaAtualCaminhao`).textContent = veiculo.cargaAtual;
            const inputCarga = document.getElementById("quantidadeCarga");
            if (inputCarga) inputCarga.value = inputCarga.value || 1000;
        }

        const btnLigar = document.getElementById(`ligarDesligar${tipo}`);
        if (btnLigar) {
             btnLigar.textContent = veiculo.ligado ? "Desligar" : "Ligar";
             // Atualiza data-estado para CSS poder estilizar
             btnLigar.dataset.estado = veiculo.ligado ? "ligado" : "desligado";
        }

        exibirHistoricoEAgendamentos(veiculo);

        // Limpa a área da API ao mostrar detalhes (será preenchida ao clicar no botão específico)
        const idAreaDetalhes = `detalhesApi${tipo}`;
        const areaDetalhes = document.getElementById(idAreaDetalhes);
        if (areaDetalhes) {
             areaDetalhes.innerHTML = '<p style="font-style: italic; color: #6c757d;">Clique em "Ver Detalhes Extras" na garagem para carregar.</p>';
        }


    } else {
        console.error(`Div de informação ${idBaseDiv} não encontrada.`);
        mostrarGaragem();
    }
}

// --- Event Listeners ---

document.body.addEventListener('click', function(event) {
    const target = event.target;

    // Botão Ver Detalhes (na lista da garagem)
    if (target.classList.contains('btn-ver-detalhes')) {
        const veiculoId = target.dataset.veiculoId;
        if (veiculoId) { mostrarDetalhesVeiculo(veiculoId); }
    }
    // Botão Remover Veículo (na lista da garagem)
    else if (target.classList.contains('btn-remover-veiculo')) {
        const veiculoId = target.dataset.veiculoId;
        const veiculo = encontrarVeiculoPorId(veiculoId);
        if (veiculo && confirm(`Tem certeza que deseja remover o ${veiculo.modelo}? Esta ação não pode ser desfeita.`)) {
            removerVeiculoDaGaragem(veiculoId);
        }
    }
    // Botão Remover Manutenção/Agendamento (nas listas de detalhes)
    else if (target.classList.contains('btn-remover-manutencao')) {
        const manutencaoId = target.dataset.manutencaoId;
        const veiculoId = target.dataset.veiculoId;
        const veiculo = encontrarVeiculoPorId(veiculoId);
        if (veiculo && manutencaoId && confirm("Tem certeza que deseja remover este registro de manutenção?")) {
            if (veiculo.removerManutencao(manutencaoId)) {
                salvarGaragem();
                exibirHistoricoEAgendamentos(veiculo);
                alert("Registro removido.");
            } else { alert("Erro ao remover manutenção."); }
        }
    }
    // --- NOVO: Botão Buscar Detalhes Extras da API ---
    else if (target.classList.contains('btn-buscar-detalhes-api')) {
        const veiculoId = target.dataset.veiculoId;
        const veiculo = encontrarVeiculoPorId(veiculoId);

        if (veiculoId && veiculo) {
            const tipo = veiculo.constructor.name;
            const idAreaDetalhes = `detalhesApi${tipo}`;

            // PRIMEIRO: Garante que a tela de detalhes correta esteja visível
            // Chama a função que já cuida de mostrar a tela e limpar a área da API
            mostrarDetalhesVeiculo(veiculoId);

            // SEGUNDO: Busca e exibe os dados da API na área correta
            // Pequeno delay para garantir que o DOM atualizou
            setTimeout(() => {
                const areaDetalhes = document.getElementById(idAreaDetalhes);
                if (areaDetalhes) {
                    areaDetalhes.innerHTML = '<p>Carregando detalhes extras...</p>';
                    target.disabled = true;
                    target.textContent = 'Carregando...';

                    buscarDetalhesVeiculoAPI(veiculoId)
                        .then(detalhes => {
                            target.disabled = false;
                            target.textContent = 'Ver Detalhes Extras';

                            if (detalhes) {
                                areaDetalhes.innerHTML = `
                                    <ul style="list-style: none; padding-left: 0;">
                                        <li><strong>Valor FIPE (simulado):</strong> ${detalhes.valorFipe || 'N/D'}</li>
                                        <li><strong>Recall Pendente:</strong> ${detalhes.recallPendente ? `<strong style="color:red;">Sim</strong> ${detalhes.recallDetalhe ? ' ('+detalhes.recallDetalhe+')' : ''}` : 'Não'}</li>
                                        <li><strong>Última Revisão (Concessionária):</strong> ${detalhes.ultimaRevisaoConcessionaria || 'N/D'}</li>
                                        <li><strong>Dica:</strong> ${detalhes.dicaManutencao || 'Nenhuma.'}</li>
                                        <li><strong>Ponto de Atenção Comum:</strong> ${detalhes.componenteComumFalha || 'N/D'}</li>
                                    </ul>
                                `;
                            } else {
                                areaDetalhes.innerHTML = '<p style="color: orange;">Detalhes extras não encontrados ou ocorreu um erro ao buscar na API simulada.</p>';
                            }
                        })
                        .catch(error => {
                             console.error("Erro inesperado ao processar detalhes da API:", error);
                             areaDetalhes.innerHTML = '<p style="color: red;">Ocorreu um erro inesperado ao exibir os detalhes.</p>';
                              target.disabled = false;
                              target.textContent = 'Ver Detalhes Extras';
                         });
                } else {
                    console.error(`Área de detalhes com ID ${idAreaDetalhes} não encontrada após mostrar detalhes!`);
                    alert("Erro interno: Não foi possível encontrar a área para exibir os detalhes extras.");
                    target.disabled = false; // Reabilita botão em caso de erro de UI
                    target.textContent = 'Ver Detalhes Extras';
                }
            }, 50); // Delay reduzido, 50ms costuma ser suficiente

        } else {
             console.error("ID do veículo ou objeto Veículo não encontrado para buscar detalhes da API.");
             alert("Não foi possível identificar o veículo para buscar detalhes extras.");
        }
    }
     // --- FIM: Botão Buscar Detalhes Extras da API ---

    // Botões de Ação do Veículo (dentro das telas de detalhes)
    else if (target.dataset.veiculoId) {
        const veiculoId = target.dataset.veiculoId;
        const veiculo = encontrarVeiculoPorId(veiculoId);
        if (!veiculo) return;

        const tipo = veiculo.constructor.name;
        const idBotao = target.id;
        let precisaSalvar = false;

        if (idBotao === `ligarDesligar${tipo}`) {
            if (veiculo.ligado) veiculo.desligar(); else veiculo.ligar();
            mostrarDetalhesVeiculo(veiculoId); // Recarrega para refletir TUDO (incluindo texto/estado do botão)
            precisaSalvar = true;
        }
        else if (idBotao === `acelerar${tipo}`) {
            veiculo.acelerar();
            document.getElementById(`velocidade${tipo}`).textContent = veiculo.velocidade.toFixed(1);
        }
        else if (idBotao === `frear${tipo}`) {
            veiculo.frear();
            document.getElementById(`velocidade${tipo}`).textContent = veiculo.velocidade.toFixed(1);
        }
        else if (idBotao.startsWith('buzinar')) {
            veiculo.buzinar();
        }
        else if (idBotao === `ativarTurbo` && veiculo instanceof CarroEsportivo) {
            veiculo.ativarTurbo();
            document.getElementById(`turboCarroEsportivo`).textContent = "Ativado";
            precisaSalvar = true;
        }
        else if (idBotao === `desativarTurbo` && veiculo instanceof CarroEsportivo) {
            veiculo.desativarTurbo();
            document.getElementById(`turboCarroEsportivo`).textContent = "Desativado";
            precisaSalvar = true;
        }
        else if (idBotao === `carregarCaminhao` && veiculo instanceof Caminhao) {
            const quantidadeInput = document.getElementById("quantidadeCarga");
            if (quantidadeInput && veiculo.carregar(quantidadeInput.value)){
                document.getElementById(`cargaAtualCaminhao`).textContent = veiculo.cargaAtual;
                precisaSalvar = true;
            }
        }
        else if (idBotao === `descarregarCaminhao` && veiculo instanceof Caminhao) {
            const quantidadeInput = document.getElementById("quantidadeCarga");
            if (quantidadeInput && veiculo.descarregar(quantidadeInput.value)){
                document.getElementById(`cargaAtualCaminhao`).textContent = veiculo.cargaAtual;
                precisaSalvar = true;
            }
        }

        if (precisaSalvar) { salvarGaragem(); }
    }
});

// Listeners de Navegação Básica
document.getElementById("botaoGaragem")?.addEventListener("click", mostrarGaragem);
document.getElementById("voltarParaMenu")?.addEventListener("click", mostrarMenuPrincipal);
document.getElementById("voltarParaGaragemCarro")?.addEventListener("click", mostrarGaragem);
document.getElementById("voltarParaGaragemEsportivo")?.addEventListener("click", mostrarGaragem);
document.getElementById("voltarParaGaragemCaminhao")?.addEventListener("click", mostrarGaragem);

// Listener para Adicionar Novo Veículo
const formAdicionar = document.getElementById('formAdicionarVeiculo');
if (formAdicionar) {
    formAdicionar.addEventListener('submit', function(event) {
        event.preventDefault();
        const tipoSelect = document.getElementById('tipoNovoVeiculo');
        const modeloInput = document.getElementById('modeloNovoVeiculo');
        const corInput = document.getElementById('corNovoVeiculo');
        const capacidadeInput = document.getElementById('capacidadeNovoCaminhao');
        const tipo = tipoSelect?.value;
        const modelo = modeloInput?.value;
        const cor = corInput?.value;
        const capacidade = tipo === 'Caminhao' ? capacidadeInput?.value : null;
        let novoVeiculo = null;
        try {
            switch (tipo) {
                case 'Carro': novoVeiculo = new Carro(modelo, cor); break;
                case 'CarroEsportivo': novoVeiculo = new CarroEsportivo(modelo, cor); break;
                case 'Caminhao':
                    const capNum = Number(capacidade);
                    if (isNaN(capNum) || capNum <= 0) throw new Error("Capacidade de carga inválida para o caminhão.");
                    novoVeiculo = new Caminhao(modelo, cor, capNum); break;
                default: throw new Error("Tipo de veículo inválido.");
            }
            if (novoVeiculo) {
                garagemVeiculos.push(novoVeiculo);
                salvarGaragem();
                atualizarListaGaragemUI();
                alert(`${tipo === 'Carro' ? 'Carro Comum' : tipo} ${modelo} adicionado à garagem!`);
                this.reset();
                document.getElementById('campoCapacidadeCaminhao').style.display = 'none';
            }
        } catch (error) {
            console.error("Erro ao criar novo veículo:", error);
            alert(`Erro ao adicionar veículo: ${error.message}`);
        }
    });
}

// Mostrar/Esconder campo de capacidade ao mudar tipo de veículo
const tipoNovoSelect = document.getElementById('tipoNovoVeiculo');
if (tipoNovoSelect) {
    tipoNovoSelect.addEventListener('change', function() {
        const campoCapacidade = document.getElementById('campoCapacidadeCaminhao');
        if (campoCapacidade) {
            campoCapacidade.style.display = this.value === 'Caminhao' ? 'flex' : 'none';
        }
    });
}

// Listener para Agendamento de Manutenção (Função genérica)
function handleAgendamentoSubmit(event) {
    event.preventDefault();
    const form = event.target;
    const veiculoId = form.querySelector('input[type="hidden"]')?.value;
    const veiculo = encontrarVeiculoPorId(veiculoId);
    if (!veiculo) { alert("Erro crítico: Veículo não encontrado para agendar manutenção."); return; }
    const dataStr = form.querySelector('input[type="date"]')?.value;
    const horaStr = form.querySelector('input[type="time"]')?.value || '00:00';
    const tipoServico = form.querySelector('input[type="text"]')?.value;
    const custoServico = form.querySelector('input[type="number"]')?.value;
    const descricaoServico = form.querySelector('textarea')?.value;
    if (!dataStr || !tipoServico || !custoServico) { alert("Por favor, preencha Data, Tipo de Serviço e Custo."); return; }
    const dataHoraISO = `${dataStr}T${horaStr}:00`;
    try {
        const novaManutencao = new Manutencao(dataHoraISO, tipoServico, custoServico, descricaoServico);
        if (veiculo.adicionarManutencao(novaManutencao)) {
            salvarGaragem();
            exibirHistoricoEAgendamentos(veiculo);
            alert("Manutenção/Agendamento adicionado com sucesso!");
            form.reset();
        } else { alert("Falha ao adicionar manutenção ao veículo."); }
    } catch (error) {
        console.error("Erro ao criar ou adicionar manutenção:", error);
        alert(`Erro no agendamento: ${error.message}`);
    }
}

document.getElementById('formAgendamentoCarro')?.addEventListener('submit', handleAgendamentoSubmit);
document.getElementById('formAgendamentoCarroEsportivo')?.addEventListener('submit', handleAgendamentoSubmit);
document.getElementById('formAgendamentoCaminhao')?.addEventListener('submit', handleAgendamentoSubmit);

// --- Alertas e Notificações ---
function verificarAgendamentosProximos() {
    const hoje = new Date(); const amanha = new Date();
    amanha.setDate(hoje.getDate() + 1);
    hoje.setHours(0, 0, 0, 0); amanha.setHours(0, 0, 0, 0);
    let alertas = [];
    garagemVeiculos.forEach(veiculo => {
        veiculo.historicoManutencao.forEach(m => {
            if (m.isFuture()) {
                const dataAgendamento = m.getDataObj();
                const dataAgendamentoSemHora = new Date(dataAgendamento);
                dataAgendamentoSemHora.setHours(0,0,0,0);
                const horaFormatada = dataAgendamento.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
                let tipoNome = veiculo.constructor.name;
                 if (tipoNome === 'Carro') tipoNome = 'Carro Comum';
                 if (tipoNome === 'CarroEsportivo') tipoNome = 'Carro Esportivo';
                if (dataAgendamentoSemHora.getTime() === hoje.getTime()) {
                    alertas.push(`🚨 HOJE: ${tipoNome} ${veiculo.modelo} - ${m.tipo} às ${horaFormatada}`);
                } else if (dataAgendamentoSemHora.getTime() === amanha.getTime()) {
                     alertas.push(`🔔 AMANHÃ: ${tipoNome} ${veiculo.modelo} - ${m.tipo} às ${horaFormatada}`);
                }
            }
        });
    });
    if (alertas.length > 0) {
        setTimeout(() => { alert("Lembretes de Agendamento:\n\n" + alertas.join("\n")); }, 1500); // Delay ligeiramente maior
    }
}

// --- Inicialização ---
window.addEventListener('load', () => {
    console.log("Página carregada. Inicializando aplicação.");
    carregarGaragem();
    mostrarMenuPrincipal();
    const tipoSelectInit = document.getElementById('tipoNovoVeiculo');
    const campoCapacidadeInit = document.getElementById('campoCapacidadeCaminhao');
    if(tipoSelectInit && campoCapacidadeInit){
         campoCapacidadeInit.style.display = tipoSelectInit.value === 'Caminhao' ? 'flex' : 'none';
    } else { console.warn("Elementos do formulário de adicionar veículo não encontrados na inicialização."); }
});

console.log("Script principal carregado e pronto.");
// =============================================
//        FIM DO SCRIPT COMPLETO
// =============================================