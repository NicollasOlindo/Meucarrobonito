// =============================================
//        SCRIPT COMPLETO - GARAGEM INTELIGENTE
// =============================================

// ===== CLASSE MANUTENCAO =====
class Manutencao {
    constructor(data, tipo, custo, descricao = '') {
        // Tenta converter a string/data para objeto Date
        // Suporta ISO string (yyyy-mm-ddThh:mm:ss) ou objeto Date
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

        this.data = dataObj.toISOString(); // Armazena como string ISO para consistência e timezone handling
        this.tipo = tipo.trim();
        this.custo = custoNum;
        this.descricao = descricao.trim();
        this.id = `m-${Date.now()}-${Math.random().toString(16).substring(2, 8)}`; // ID único simples
    }

    validarData(data) {
        // Verifica se é um objeto Date válido e não "Invalid Date"
        return data instanceof Date && !isNaN(data);
    }

    getDataObj() {
        // Retorna o objeto Date para comparações e formatação
        return new Date(this.data);
    }

    formatar() {
        const dataFormatada = this.getDataObj().toLocaleDateString('pt-BR', {
            day: '2-digit', month: '2-digit', year: 'numeric'
        });
        const custoFormatado = this.custo.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
        let str = `${this.tipo} em ${dataFormatada} - ${custoFormatado}`;
        if (this.descricao) {
            str += ` (${this.descricao})`;
        }
        return str;
    }

    formatarAgendamento() {
        const dataFormatada = this.getDataObj().toLocaleString('pt-BR', { // Usa toLocaleString para incluir hora
             day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
        });
         let str = `${this.tipo} agendado para ${dataFormatada}`;
         if (this.descricao) {
             str += ` - Obs: ${this.descricao}`;
         }
         return str;
    }

    isFuture() {
        return this.getDataObj() > new Date();
    }

    // Método estático para recriar instância a partir de dados puros (ex: do LocalStorage)
    static fromPlainObject(obj) {
        try {
            // O construtor já espera um formato que Date() entenda, como ISO string
            const manutencao = new Manutencao(obj.data, obj.tipo, obj.custo, obj.descricao);
            manutencao.id = obj.id || `m-${Date.now()}-${Math.random().toString(16).substring(2, 8)}`; // Mantém ou gera ID
            return manutencao;
        } catch (error) {
            console.error("Erro ao recriar Manutencao a partir de objeto:", error, obj);
            return null; // Retorna null se a recriação falhar
        }
    }
}


// ===== CLASSE VEICULO (BASE) =====
class Veiculo {
    constructor(modelo, cor) {
        if (!modelo || typeof modelo !== 'string' || modelo.trim() === '') throw new Error("Modelo inválido");
        if (!cor || typeof cor !== 'string' || cor.trim() === '') throw new Error("Cor inválida");

        this.id = `v-${Date.now()}-${Math.random().toString(16).substring(2, 8)}`; // ID único
        this.modelo = modelo.trim();
        this.cor = cor.trim();
        this.ligado = false;
        this.historicoManutencao = []; // Array para armazenar objetos Manutencao

        // Elementos de áudio podem ser referenciados aqui ou nas subclasses se forem específicos
        this.somLigando = document.getElementById("somLigando");
        this.somAceleracao = document.getElementById("somAceleracao");
    }

    ligar() {
        if (!this.ligado) {
            this.ligado = true;
            console.log(`${this.constructor.name} ${this.modelo} ligado!`);
            if (this.somLigando) this.somLigando.play().catch(e => console.error("Erro ao tocar som ligando:", e));
            // Atualizações de UI devem ser feitas onde o contexto do elemento existe
        }
    }

    desligar() {
        if (this.ligado) {
            this.ligado = false;
            console.log(`${this.constructor.name} ${this.modelo} desligado!`);
            // Resetar propriedades como velocidade deve ocorrer nas subclasses ou aqui se aplicável
            // Atualizações de UI
        }
    }

    buzinar() {
        console.log("Bi bi! (Som genérico)");
        // Subclasses devem sobrescrever para usar sons específicos
    }

    adicionarManutencao(manutencao) {
        if (!(manutencao instanceof Manutencao)) {
            console.error("Tentativa de adicionar item inválido ao histórico de manutenção.");
            alert("Erro interno: Objeto de manutenção inválido.");
            return false;
        }
        this.historicoManutencao.push(manutencao);
        // Ordena o histórico por data (mais recente primeiro)
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

    getHistoricoFormatado(apenasPassado = true) { // Default para mostrar só passado
        const agora = new Date();
        return this.historicoManutencao
            .filter(m => !apenasPassado || m.getDataObj() <= agora) // Filtra se necessário
            .map(m => ({ id: m.id, texto: m.formatar() })); // Retorna objeto com ID e texto
    }

    getAgendamentosFuturosFormatado() {
        const agora = new Date();
        return this.historicoManutencao
            .filter(m => m.getDataObj() > agora) // Pega apenas datas futuras
            .map(m => ({ id: m.id, texto: m.formatarAgendamento() })); // Retorna objeto com ID e texto
    }

    // Método para obter dados simples para salvar (sem métodos)
    toPlainObject() {
        return {
            id: this.id,
            tipoVeiculo: this.constructor.name, // Guarda o nome da classe! Crucial!
            modelo: this.modelo,
            cor: this.cor,
            ligado: this.ligado,
            // Converte cada manutenção para objeto simples também
            historicoManutencao: this.historicoManutencao.map(m => ({
                 id: m.id,
                 data: m.data, // Já está como ISO string
                 tipo: m.tipo,
                 custo: m.custo,
                 descricao: m.descricao
            })),
            // Propriedades específicas devem ser adicionadas pelas subclasses
            // Exemplo: velocidade será adicionada por Carro
        };
    }

     // Método estático para popular dados a partir de um objeto simples (usado no carregamento)
     static fromPlainObject(obj) {
        let veiculo = null;
        // Decide qual classe instanciar baseado no tipo salvo
        try {
            switch (obj.tipoVeiculo) {
                case 'Carro':
                    veiculo = new Carro(obj.modelo, obj.cor);
                    break;
                case 'CarroEsportivo':
                    veiculo = new CarroEsportivo(obj.modelo, obj.cor);
                    veiculo.turboAtivado = obj.turboAtivado || false; // Restaura estado específico
                    break;
                case 'Caminhao':
                    // Garante que capacidade seja um número válido ou usa padrão
                    const capacidade = Number(obj.capacidadeCarga);
                    veiculo = new Caminhao(obj.modelo, obj.cor, isNaN(capacidade) || capacidade <= 0 ? 10000 : capacidade);
                    veiculo.cargaAtual = Number(obj.cargaAtual) || 0; // Restaura estado específico
                    break;
                default:
                    throw new Error(`Tipo de veículo desconhecido: ${obj.tipoVeiculo}`);
            }

            // Copia propriedades comuns e específicas que podem ter sido salvas
            veiculo.id = obj.id || `v-${Date.now()}-${Math.random().toString(16).substring(2, 8)}`; // Garante ID
            veiculo.ligado = obj.ligado || false;
            veiculo.velocidade = Number(obj.velocidade) || 0; // Garante que velocidade seja número

            // REHIDRATA o histórico de manutenção
            if (Array.isArray(obj.historicoManutencao)) {
                veiculo.historicoManutencao = obj.historicoManutencao
                    .map(mObj => Manutencao.fromPlainObject(mObj)) // Recria cada Manutencao
                    .filter(m => m !== null); // Remove nulos se a recriação falhar
                veiculo.historicoManutencao.sort((a, b) => b.getDataObj() - a.getDataObj()); // Reordena
            } else {
                 veiculo.historicoManutencao = []; // Garante que seja um array
            }

            return veiculo;

        } catch (error) {
            console.error(`Erro ao recriar veículo ${obj.modelo} (ID: ${obj.id}) do tipo ${obj.tipoVeiculo}:`, error);
            return null; // Falha na recriação
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

    desligar() {
        super.desligar();
        this.velocidade = 0; // Zera velocidade ao desligar
    }

    acelerar() {
        if (this.ligado) {
            this.velocidade += 10;
            if (this.somAceleracao) this.somAceleracao.play().catch(e => console.error("Erro ao tocar som aceleração:", e));
            console.log(`Acelerando! Velocidade atual: ${this.velocidade} km/h`);
        } else {
            alert("O carro precisa estar ligado para acelerar!");
        }
    }

    frear() {
        if (this.ligado) {
            this.velocidade -= 10;
            if (this.velocidade < 0) {
                this.velocidade = 0;
            }
            console.log(`Freando! Velocidade atual: ${this.velocidade} km/h`);
        } else {
           alert("O carro precisa estar ligado para frear!");
        }
    }

    buzinar() {
        if (this.somBuzina) this.somBuzina.play().catch(e => console.error("Erro ao tocar buzina:", e));
        else super.buzinar(); // Som genérico se o específico falhar
        console.log("Fon fon!");
    }

    // Adiciona velocidade ao objeto salvo
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
        this.somBuzina = document.getElementById("somBuzinaEsportivo"); // Sobrescreve buzina
    }

    ligar() {
        super.ligar();
        // Não resetamos turbo ao ligar
    }

    desligar() {
        super.desligar(); // Zera velocidade
        this.turboAtivado = false; // Desativa turbo ao desligar
    }

    ativarTurbo() {
        if (this.ligado) {
            if (!this.turboAtivado) {
                this.turboAtivado = true;
                if (this.somTurbo) this.somTurbo.play().catch(e => console.error("Erro ao tocar som turbo:", e));
                console.log("Turbo ativado!");
            } else {
                 alert("O turbo já está ativado!");
            }
        } else {
            alert("O carro precisa estar ligado para ativar o turbo!");
        }
    }

    desativarTurbo() {
        if (this.turboAtivado) {
            this.turboAtivado = false;
            console.log("Turbo desativado!");
        }
    }

    acelerar() { // Sobrescreve acelerar para incluir o turbo
        if (this.ligado) {
            const incremento = this.turboAtivado ? 30 : 15; // Acelera mais (base e com turbo)
            this.velocidade += incremento;
            if (this.somAceleracao) this.somAceleracao.play().catch(e => console.error("Erro ao tocar som aceleração:", e));
            console.log(`Acelerando ${this.turboAtivado ? 'com Turbo' : ''}! Velocidade atual: ${this.velocidade} km/h`);
        } else {
            alert("O carro precisa estar ligado para acelerar!");
        }
    }

    buzinar() {
        if (this.somBuzina) this.somBuzina.play().catch(e => console.error("Erro ao tocar buzina:", e));
        else super.buzinar();
        console.log("Vrum vrum! (Buzina Esportiva)");
    }

     // Adiciona estado do turbo ao objeto salvo
     toPlainObject() {
        const plain = super.toPlainObject(); // Pega o objeto de Carro (com velocidade)
        plain.turboAtivado = this.turboAtivado;
        return plain;
    }
}


// ===== CLASSE CAMINHAO =====
class Caminhao extends Carro { // Herdando de Carro para ter velocidade, etc.
    constructor(modelo, cor, capacidadeCarga) {
        super(modelo, cor);
        if (isNaN(capacidadeCarga) || capacidadeCarga <= 0) throw new Error("Capacidade de carga inválida");
        this.capacidadeCarga = capacidadeCarga;
        this.cargaAtual = 0;
        this.somBuzina = document.getElementById("somBuzinaCaminhao"); // Sobrescreve buzina
    }

    // Ligar/Desligar herdados de Carro (que zera velocidade)

    acelerar() { // Caminhão acelera mais devagar, afetado pela carga
        if (this.ligado) {
            const fatorCarga = Math.max(0.2, 1 - (this.cargaAtual / (this.capacidadeCarga * 1.5))); // Reduz aceleração com carga
            const incremento = Math.max(1, 5 * fatorCarga); // Mínimo 1, máximo 5 (sem carga)
            this.velocidade += incremento;
            if (this.somAceleracao) this.somAceleracao.play().catch(e => console.error("Erro ao tocar som aceleração:", e));
            console.log(`Caminhão acelerando! Carga: ${this.cargaAtual}kg. Velocidade: ${this.velocidade.toFixed(1)} km/h`);
        } else {
            alert("O caminhão precisa estar ligado para acelerar!");
        }
    }

    frear() { // Caminhão freia mais devagar, afetado pela carga
        if (this.ligado) {
             const fatorCarga = Math.max(0.3, 1 - (this.cargaAtual / (this.capacidadeCarga * 2.0))); // Reduz frenagem com carga
            const decremento = Math.max(2, 8 * fatorCarga); // Mínimo 2, máximo 8 (sem carga)
            this.velocidade -= decremento;
            if (this.velocidade < 0) {
                this.velocidade = 0;
            }
            console.log(`Caminhão freando! Carga: ${this.cargaAtual}kg. Velocidade: ${this.velocidade.toFixed(1)} km/h`);
        } else {
            alert("O caminhão precisa estar ligado para frear!");
        }
    }

    carregar(quantidade) {
         const qtdNum = Number(quantidade);
        if (isNaN(qtdNum) || qtdNum <= 0) {
            alert("A quantidade para carregar deve ser um número positivo.");
            return false;
        }
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
        if (isNaN(qtdNum) || qtdNum <= 0) {
            alert("A quantidade para descarregar deve ser um número positivo.");
            return false;
        }
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

    // Adiciona propriedades de carga ao objeto salvo
     toPlainObject() {
        const plain = super.toPlainObject(); // Pega o objeto de Carro (com velocidade)
        plain.capacidadeCarga = this.capacidadeCarga;
        plain.cargaAtual = this.cargaAtual;
        return plain;
    }
}


// ===== GERENCIAMENTO DA GARAGEM E PERSISTÊNCIA =====

let garagemVeiculos = []; // Array principal que guarda os objetos Veiculo (instâncias)
const STORAGE_KEY = 'minhaGaragemInteligenteDados'; // Chave para LocalStorage

function salvarGaragem() {
    try {
        // Mapeia cada instância de Veiculo para seu objeto simples usando toPlainObject()
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
            // REHIDRATA: Transforma os objetos puros de volta em instâncias das classes corretas
            garagemVeiculos = garagemPura
                .map(obj => Veiculo.fromPlainObject(obj)) // Usa o método estático para recriar
                .filter(v => v !== null); // Remove veículos que falharam ao carregar
            console.log(`Garagem carregada com ${garagemVeiculos.length} veículos.`);
        } else {
            console.log("Nenhum dado salvo encontrado. Iniciando com garagem vazia.");
            garagemVeiculos = []; // Inicia vazio se não houver dados
        }
    } catch (error) {
        console.error("Erro crítico ao carregar ou processar dados da garagem:", error);
        alert("Erro ao carregar dados da garagem. Os dados podem estar corrompidos. Iniciando garagem vazia. Verifique o console.");
        localStorage.removeItem(STORAGE_KEY); // Remove dados corrompidos para evitar loop de erro
        garagemVeiculos = []; // Reseta em caso de erro grave
    }
    // Após carregar (ou falhar), atualiza a interface da garagem principal
    atualizarListaGaragemUI();
    verificarAgendamentosProximos(); // Verifica alertas ao carregar
}

// --- Funções Auxiliares ---
function encontrarVeiculoPorId(id) {
    return garagemVeiculos.find(v => v.id === id);
}


// ===== LÓGICA DA INTERFACE E EVENTOS =====

// --- Funções de Atualização da UI ---

function atualizarListaGaragemUI() {
    const listaDiv = document.getElementById('listaVeiculosGaragem');
    if (!listaDiv) return; // Sai se o elemento não existe
    listaDiv.innerHTML = ''; // Limpa a lista atual

    if (garagemVeiculos.length === 0) {
        listaDiv.innerHTML = '<p>Nenhum veículo na garagem.</p>';
        return;
    }

    const ul = document.createElement('ul');
    garagemVeiculos.forEach(veiculo => {
        const li = document.createElement('li');
        // Define o nome amigável do tipo
        let tipoNome = veiculo.constructor.name;
        if (tipoNome === 'Carro') tipoNome = 'Carro Comum';
        if (tipoNome === 'CarroEsportivo') tipoNome = 'Carro Esportivo';

        li.innerHTML = `
            <span>${tipoNome}: ${veiculo.modelo} (${veiculo.cor})</span>
            <div> <!-- Agrupa botões -->
                <button class="btn-ver-detalhes" data-veiculo-id="${veiculo.id}">Ver Detalhes</button>
                <button class="btn-remover-veiculo" data-veiculo-id="${veiculo.id}" title="Remover Veículo" style="color: red; margin-left: 10px; border: none; background: none; cursor: pointer; font-size: 1.2em;">×</button>
             </div>
        `;
        // Adiciona evento para ver detalhes (usando delegação mais abaixo)
        // Adiciona evento para remover (usando delegação mais abaixo)
        ul.appendChild(li);
    });
    listaDiv.appendChild(ul);
}

function removerVeiculoDaGaragem(veiculoId) {
    const index = garagemVeiculos.findIndex(v => v.id === veiculoId);
    if (index > -1) {
        const modeloRemovido = garagemVeiculos[index].modelo;
        garagemVeiculos.splice(index, 1); // Remove do array
        salvarGaragem(); // Salva o estado atualizado
        atualizarListaGaragemUI(); // Atualiza a lista na tela
        mostrarGaragem(); // Volta para a tela da garagem
        alert(`Veículo ${modeloRemovido} removido com sucesso.`);
    } else {
        alert("Erro: Veículo não encontrado para remoção.");
    }
}

function exibirHistoricoEAgendamentos(veiculo) {
    if (!veiculo) return;

    const tipo = veiculo.constructor.name; // Carro, CarroEsportivo, Caminhao
    const idBase = tipo.charAt(0).toLowerCase() + tipo.slice(1); // carro, carroEsportivo, caminhao

    const historicoUl = document.getElementById(`historicoManutencao${tipo}`);
    const agendamentosUl = document.getElementById(`agendamentosFuturos${tipo}`);
    const inputVeiculoId = document.getElementById(`agendamentoVeiculoId${tipo}`); // Para o form

    if (!historicoUl || !agendamentosUl || !inputVeiculoId) {
        // Se os elementos não existem para este tipo de veículo, não faz nada.
        // Isso pode acontecer se o HTML não foi atualizado corretamente.
        console.warn(`Elementos de manutenção não encontrados para o tipo ${tipo}. Verifique o HTML.`);
        return;
    }

    inputVeiculoId.value = veiculo.id; // Define o ID no form de agendamento

    // Limpa listas
    historicoUl.innerHTML = '';
    agendamentosUl.innerHTML = '';

    const historicoFormatado = veiculo.getHistoricoFormatado(true); // Apenas passado
    const agendamentosFormatado = veiculo.getAgendamentosFuturosFormatado();

    // Função auxiliar para criar LI com botão de remover
    const criarLiManutencao = (item) => {
         const li = document.createElement('li');
         const btnRemover = `<button class="btn-remover-manutencao" data-manutencao-id="${item.id}" data-veiculo-id="${veiculo.id}" title="Remover Registro" style="font-size: 0.8em; color: red; margin-left: 5px; border: none; background: none; cursor: pointer;">×</button>`;
         li.innerHTML = item.texto + btnRemover;
         return li;
    }

    // Preenche histórico
    if (historicoFormatado.length > 0) {
        historicoFormatado.forEach(item => historicoUl.appendChild(criarLiManutencao(item)));
    } else {
        historicoUl.innerHTML = '<li>Nenhum histórico registrado.</li>';
    }

    // Preenche agendamentos
    if (agendamentosFormatado.length > 0) {
        agendamentosFormatado.forEach(item => agendamentosUl.appendChild(criarLiManutencao(item)));
    } else {
        agendamentosUl.innerHTML = '<li>Nenhum agendamento futuro.</li>';
    }

    // Listeners para botões de remover serão adicionados por delegação no listener principal
}


// --- Funções de Controle de Tela ---

function mostrarTela(idTela) {
     // Esconde todas as telas principais
     document.getElementById("menuPrincipal").style.display = "none";
     document.getElementById("garagem").style.display = "none";
     document.getElementById("informacoesCarro").style.display = "none";
     document.getElementById("informacoesCarroEsportivo").style.display = "none";
     document.getElementById("informacoesCaminhao").style.display = "none";

     // Mostra a tela desejada
     const tela = document.getElementById(idTela);
     if (tela) {
        tela.style.display = "block";
     } else {
         console.error(`Tela com ID ${idTela} não encontrada!`);
         mostrarMenuPrincipal(); // Volta para o menu em caso de erro
     }
}

function mostrarMenuPrincipal() {
    mostrarTela("menuPrincipal");
}

function mostrarGaragem() {
    mostrarTela("garagem");
    atualizarListaGaragemUI(); // Atualiza a lista sempre que mostrar a garagem
}

// Função Genérica para Mostrar Detalhes do Veículo
function mostrarDetalhesVeiculo(veiculoId) {
    const veiculo = encontrarVeiculoPorId(veiculoId);
    if (!veiculo) {
        console.error(`Veículo com ID ${veiculoId} não encontrado.`);
        alert("Erro: Veículo não encontrado.");
        mostrarGaragem();
        return;
    }

    const tipo = veiculo.constructor.name; // Carro, CarroEsportivo, Caminhao
    const idBaseDiv = `informacoes${tipo}`; // informacoesCarro, etc.

    // Mostra a div correta
    mostrarTela(idBaseDiv);
    const divInfo = document.getElementById(idBaseDiv);

    if (divInfo) {
         // Preenche as informações básicas e específicas
        document.getElementById(`modelo${tipo}`).textContent = veiculo.modelo;
        document.getElementById(`cor${tipo}`).textContent = veiculo.cor;
        document.getElementById(`velocidade${tipo}`).textContent = veiculo.velocidade !== undefined ? veiculo.velocidade.toFixed(1) : 'N/A';
        document.getElementById(`status${tipo}`).textContent = veiculo.ligado ? "Ligado" : "Desligado";

        // Define o data-veiculo-id nos botões de ação dentro desta div
        divInfo.querySelectorAll('button[data-veiculo-id]').forEach(btn => {
            btn.dataset.veiculoId = veiculoId;
        });

        // Preenche informações específicas e atualiza botões/status
        if (tipo === 'CarroEsportivo' && veiculo instanceof CarroEsportivo) {
            document.getElementById(`turboCarroEsportivo`).textContent = veiculo.turboAtivado ? "Ativado" : "Desativado";
        } else if (tipo === 'Caminhao' && veiculo instanceof Caminhao) {
            document.getElementById(`capacidadeCargaCaminhao`).textContent = veiculo.capacidadeCarga;
            document.getElementById(`cargaAtualCaminhao`).textContent = veiculo.cargaAtual;
            // Atualiza valor do input de carga se existir
            const inputCarga = document.getElementById("quantidadeCarga");
            if (inputCarga) inputCarga.value = inputCarga.value || 1000; // Mantém ou default
        }

        // Atualiza estado visual do botão Ligar/Desligar
        const btnLigar = document.getElementById(`ligarDesligar${tipo}`);
        if (btnLigar) {
            btnLigar.textContent = veiculo.ligado ? "Desligar" : "Ligar";
        }

        // Exibe histórico e agendamentos
        exibirHistoricoEAgendamentos(veiculo);

    } else {
        console.error(`Div de informação ${idBaseDiv} não encontrada.`);
        mostrarGaragem(); // Volta para a garagem se a div não existir
    }
}


// --- Event Listeners ---

// Delegação de Eventos Principal (para botões dentro das listas e telas de detalhes)
document.body.addEventListener('click', function(event) {
    const target = event.target; // O elemento que foi clicado

    // Botão Ver Detalhes (na lista da garagem)
    if (target.classList.contains('btn-ver-detalhes')) {
        const veiculoId = target.dataset.veiculoId;
        if (veiculoId) {
            mostrarDetalhesVeiculo(veiculoId);
        }
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
                 exibirHistoricoEAgendamentos(veiculo); // Atualiza a UI da lista
                 alert("Registro removido.");
             } else {
                 alert("Erro ao remover manutenção.");
             }
         }
    }
    // Botões de Ação do Veículo (dentro das telas de detalhes)
    else if (target.dataset.veiculoId) {
        const veiculoId = target.dataset.veiculoId;
        const veiculo = encontrarVeiculoPorId(veiculoId);
        if (!veiculo) return; // Segurança

        const tipo = veiculo.constructor.name;
        const idBotao = target.id;

        let precisaSalvar = false; // Flag para salvar no final da ação se necessário

        // Ligar/Desligar
        if (idBotao === `ligarDesligar${tipo}`) {
            if (veiculo.ligado) {
                veiculo.desligar();
            } else {
                veiculo.ligar();
            }
            // Atualiza UI específica na tela de detalhes
            mostrarDetalhesVeiculo(veiculoId); // Recarrega a tela para refletir mudanças
            precisaSalvar = true;
        }
        // Acelerar
        else if (idBotao === `acelerar${tipo}`) {
            veiculo.acelerar();
            document.getElementById(`velocidade${tipo}`).textContent = veiculo.velocidade.toFixed(1);
            // Não salva a cada aceleração para performance
        }
        // Frear
        else if (idBotao === `frear${tipo}`) {
            veiculo.frear();
            document.getElementById(`velocidade${tipo}`).textContent = veiculo.velocidade.toFixed(1);
        }
        // Buzinar
        else if (idBotao === `buzinar${tipo}` || idBotao.startsWith('buzinar')) { // Pega IDs antigos tbm
            veiculo.buzinar();
        }
        // Turbo (CarroEsportivo)
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
        // Carregar/Descarregar (Caminhao)
        else if (idBotao === `carregarCaminhao` && veiculo instanceof Caminhao) {
            const quantidadeInput = document.getElementById("quantidadeCarga");
            if (quantidadeInput){
                 const quantidade = quantidadeInput.value;
                 if(veiculo.carregar(quantidade)){
                    document.getElementById(`cargaAtualCaminhao`).textContent = veiculo.cargaAtual;
                    precisaSalvar = true;
                 }
            }
        }
        else if (idBotao === `descarregarCaminhao` && veiculo instanceof Caminhao) {
             const quantidadeInput = document.getElementById("quantidadeCarga");
            if (quantidadeInput){
                 const quantidade = quantidadeInput.value;
                 if(veiculo.descarregar(quantidade)){
                    document.getElementById(`cargaAtualCaminhao`).textContent = veiculo.cargaAtual;
                    precisaSalvar = true;
                 }
            }
        }

        // Salva o estado se uma ação modificadora foi realizada
        if (precisaSalvar) {
            salvarGaragem();
        }
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
                case 'Carro':
                    novoVeiculo = new Carro(modelo, cor);
                    break;
                case 'CarroEsportivo':
                    novoVeiculo = new CarroEsportivo(modelo, cor);
                    break;
                case 'Caminhao':
                    const capNum = Number(capacidade);
                    if (isNaN(capNum) || capNum <= 0) {
                         throw new Error("Capacidade de carga inválida para o caminhão.");
                    }
                    novoVeiculo = new Caminhao(modelo, cor, capNum);
                    break;
                default:
                    throw new Error("Tipo de veículo inválido.");
            }

            if (novoVeiculo) {
                garagemVeiculos.push(novoVeiculo);
                salvarGaragem();
                atualizarListaGaragemUI();
                alert(`${tipo === 'Carro' ? 'Carro Comum' : tipo} ${modelo} adicionado à garagem!`);
                this.reset(); // Limpa o formulário
                 document.getElementById('campoCapacidadeCaminhao').style.display = 'none'; // Esconde campo de capacidade
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
            campoCapacidade.style.display = this.value === 'Caminhao' ? 'flex' : 'none'; // Use flex se o CSS estiver configurado assim
        }
    });
}


// Listener para Agendamento de Manutenção (Função genérica)
function handleAgendamentoSubmit(event) {
    event.preventDefault();
    const form = event.target;
    const veiculoId = form.querySelector('input[type="hidden"]')?.value; // Pega o ID do veículo do campo hidden
    const veiculo = encontrarVeiculoPorId(veiculoId);

    if (!veiculo) {
        alert("Erro crítico: Veículo não encontrado para agendar manutenção.");
        return;
    }

    // Extrai valores do formulário específico que disparou o evento
    const dataStr = form.querySelector('input[type="date"]')?.value;
    const horaStr = form.querySelector('input[type="time"]')?.value || '00:00';
    const tipoServico = form.querySelector('input[type="text"]')?.value; // Primeiro input de texto deve ser o tipo
    const custoServico = form.querySelector('input[type="number"]')?.value; // Primeiro input number deve ser o custo
    const descricaoServico = form.querySelector('textarea')?.value;

    if (!dataStr || !tipoServico || !custoServico) {
        alert("Por favor, preencha Data, Tipo de Serviço e Custo.");
        return;
    }

    const dataHoraISO = `${dataStr}T${horaStr}:00`; // Formato ISO simplificado

    try {
        const novaManutencao = new Manutencao(dataHoraISO, tipoServico, custoServico, descricaoServico);
        if (veiculo.adicionarManutencao(novaManutencao)) {
            salvarGaragem(); // Salva a atualização
            exibirHistoricoEAgendamentos(veiculo); // Atualiza a UI da tela atual
            alert("Manutenção/Agendamento adicionado com sucesso!");
            form.reset(); // Limpa o formulário
        } else {
             alert("Falha ao adicionar manutenção ao veículo.");
        }
    } catch (error) {
        console.error("Erro ao criar ou adicionar manutenção:", error);
        alert(`Erro no agendamento: ${error.message}`);
    }
}

// Adiciona o listener aos 3 formulários de agendamento
document.getElementById('formAgendamentoCarro')?.addEventListener('submit', handleAgendamentoSubmit);
document.getElementById('formAgendamentoCarroEsportivo')?.addEventListener('submit', handleAgendamentoSubmit);
document.getElementById('formAgendamentoCaminhao')?.addEventListener('submit', handleAgendamentoSubmit);


// --- Alertas e Notificações ---
function verificarAgendamentosProximos() {
    const hoje = new Date();
    const amanha = new Date();
    amanha.setDate(hoje.getDate() + 1);

    // Zera a hora para comparar apenas a data
    hoje.setHours(0, 0, 0, 0);
    amanha.setHours(0, 0, 0, 0);

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
        // Exibe os alertas (pode ser num modal, numa div específica, ou simples alerts)
        setTimeout(() => { // Pequeno delay para não bloquear o carregamento inicial
             alert("Lembretes de Agendamento:\n\n" + alertas.join("\n"));
        }, 1000); // Aumentei o delay
    }
}


// --- Inicialização ---
window.addEventListener('load', () => {
    console.log("Página carregada. Inicializando aplicação.");
    carregarGaragem(); // Carrega dados salvos ao iniciar
    mostrarMenuPrincipal(); // Começa no menu

    // Configura estado inicial do campo de capacidade no form de adicionar
    const tipoSelectInit = document.getElementById('tipoNovoVeiculo');
    const campoCapacidadeInit = document.getElementById('campoCapacidadeCaminhao');
    if(tipoSelectInit && campoCapacidadeInit){
         campoCapacidadeInit.style.display = tipoSelectInit.value === 'Caminhao' ? 'flex' : 'none';
    } else {
        console.warn("Elementos do formulário de adicionar veículo não encontrados na inicialização.");
    }
});

// Opcional: Salvar antes de descarregar (pode ser útil, mas também pode perder dados se fechar rápido)
// window.addEventListener('beforeunload', (event) => {
//     console.log("Tentando salvar antes de descarregar...");
//     salvarGaragem();
//     // Não é garantido que o salvamento complete, especialmente em mobile
// });

console.log("Script principal carregado e pronto.");
// =============================================
//        FIM DO SCRIPT COMPLETO
// =============================================