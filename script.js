// =============================================
//        SCRIPT COMPLETO - GARAGEM INTELIGENTE
// =============================================

// ===== CLASSE MANUTENCAO =====
/**
 * Representa um registro de manutenção para um veículo.
 * Contém informações sobre data, tipo, custo e descrição do serviço.
 * @class Manutencao
 */
class Manutencao {
    /**
     * Cria uma instância de Manutencao.
     * @param {string|Date} data - A data e hora da manutenção (string ISO 8601 ou objeto Date).
     * @param {string} tipo - O tipo de serviço realizado (ex: "Troca de óleo").
     * @param {number|string} custo - O custo do serviço. Será convertido para número.
     * @param {string} [descricao=''] - Uma descrição opcional do serviço.
     * @throws {Error} Se a data, tipo ou custo forem inválidos.
     */
    constructor(data, tipo, custo, descricao = '') {
        const dataObj = new Date(data);
        if (!this.validarData(dataObj)) {
            throw new Error("Data inválida fornecida para manutenção. Use um formato reconhecível ou objeto Date.");
        }
        if (typeof tipo !== 'string' || tipo.trim() === '') {
            throw new Error("Tipo de manutenção inválido. Deve ser uma string não vazia.");
        }
        const custoNum = parseFloat(custo);
        if (isNaN(custoNum) || custoNum < 0) {
            throw new Error("Custo da manutenção inválido. Deve ser um número não negativo.");
        }
        /** @property {string} id - Identificador único da manutenção. */
        this.id = `m-${Date.now()}-${Math.random().toString(16).substring(2, 8)}`;
        /** @property {string} data - Data da manutenção no formato ISO string. */
        this.data = dataObj.toISOString();
        /** @property {string} tipo - Tipo de serviço. */
        this.tipo = tipo.trim();
        /** @property {number} custo - Custo do serviço. */
        this.custo = custoNum;
        /** @property {string} descricao - Descrição do serviço. */
        this.descricao = descricao.trim();
    }

    /**
     * Valida se o objeto de data fornecido é uma instância de Date válida e não NaN.
     * @param {Date} data - O objeto Date a ser validado.
     * @returns {boolean} True se a data for válida, false caso contrário.
     * @private
     */
    validarData(data) {
        return data instanceof Date && !isNaN(data.getTime());
    }

    /**
     * Retorna o objeto Date da manutenção.
     * @returns {Date} O objeto Date correspondente à data da manutenção.
     */
    getDataObj() {
        return new Date(this.data);
    }

    /**
     * Formata os detalhes da manutenção para exibição (geralmente para histórico passado).
     * @returns {string} Uma string formatada com tipo, data e custo da manutenção.
     * Ex: "Troca de óleo em 01/07/2024 - R$ 150,00 (Filtro incluído)"
     */
    formatar() {
        const dataFormatada = this.getDataObj().toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
        const custoFormatado = this.custo.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
        let str = `${this.tipo} em ${dataFormatada} - ${custoFormatado}`;
        if (this.descricao) { str += ` (${this.descricao})`; }
        return str;
    }

    /**
     * Formata os detalhes da manutenção para exibição como um agendamento futuro.
     * @returns {string} Uma string formatada com tipo, data e hora do agendamento.
     * Ex: "Revisão completa agendado para 01/08/2024, 14:30 - Obs: Verificar freios"
     */
    formatarAgendamento() {
        const dataFormatada = this.getDataObj().toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
        let str = `${this.tipo} agendado para ${dataFormatada}`;
        if (this.descricao) { str += ` - Obs: ${this.descricao}`; }
        return str;
    }

    /**
     * Verifica se a data da manutenção é futura em relação à data atual.
     * @returns {boolean} True se a manutenção está agendada para o futuro, false caso contrário.
     */
    isFuture() {
        return this.getDataObj() > new Date();
    }

    /**
     * Cria uma instância de Manutencao a partir de um objeto simples (plain object),
     * geralmente vindo de dados desserializados (ex: LocalStorage).
     * @static
     * @param {object} obj - O objeto simples contendo as propriedades da manutenção.
     * @param {string} obj.data - Data da manutenção (string ISO).
     * @param {string} obj.tipo - Tipo de serviço.
     * @param {number} obj.custo - Custo do serviço.
     * @param {string} [obj.descricao] - Descrição opcional.
     * @param {string} [obj.id] - ID opcional (será usado se fornecido, senão um novo é gerado pelo construtor).
     * @returns {Manutencao|null} Uma nova instância de Manutencao ou null em caso de erro na criação.
     */
    static fromPlainObject(obj) {
        try {
            const manutencao = new Manutencao(obj.data, obj.tipo, obj.custo, obj.descricao);
            manutencao.id = obj.id || manutencao.id; // Mantém o ID original se existir
            return manutencao;
        } catch (error) {
            console.error("Erro ao recriar Manutencao a partir de objeto simples:", error, obj);
            return null;
        }
    }
}

// ===== CLASSE VEICULO (BASE) =====
/**
 * Classe base abstrata para todos os tipos de veículos na garagem.
 * Define propriedades e métodos comuns a todos os veículos.
 * @class Veiculo
 * @abstract
 */
class Veiculo {
    /**
     * Cria uma instância de Veiculo.
     * @param {string} modelo - O modelo do veículo. Não deve ser vazio.
     * @param {string} cor - A cor do veículo. Não deve ser vazia.
     * @throws {Error} Se o modelo ou a cor forem inválidos (vazios ou não strings).
     */
    constructor(modelo, cor) {
        if (!modelo || typeof modelo !== 'string' || modelo.trim() === '') throw new Error("Modelo inválido. Deve ser uma string não vazia.");
        if (!cor || typeof cor !== 'string' || cor.trim() === '') throw new Error("Cor inválida. Deve ser uma string não vazia.");

        /** @property {string} id - Identificador único do veículo. */
        this.id = `v-${Date.now()}-${Math.random().toString(16).substring(2, 8)}`;
        /** @property {string} modelo - Modelo do veículo. */
        this.modelo = modelo.trim();
        /** @property {string} cor - Cor do veículo. */
        this.cor = cor.trim();
        /** @property {boolean} ligado - Status do motor do veículo (ligado/desligado). */
        this.ligado = false;
        /** @property {Manutencao[]} historicoManutencao - Array de objetos Manutencao. */
        this.historicoManutencao = [];

        /** @property {HTMLAudioElement|null} somLigando - Elemento de áudio para o som de ligar. */
        this.somLigando = document.getElementById("somLigando");
        /** @property {HTMLAudioElement|null} somAceleracao - Elemento de áudio para o som de aceleração. */
        this.somAceleracao = document.getElementById("somAceleracao");
    }

    /**
     * Liga o motor do veículo.
     * Se o veículo já estiver ligado, não faz nada.
     * Tenta tocar um som de "ligando" se o elemento de áudio estiver configurado.
     */
    ligar() {
        if (!this.ligado) {
            this.ligado = true;
            console.log(`${this.constructor.name} ${this.modelo} ligado!`);
            if (this.somLigando && typeof this.somLigando.play === 'function') {
                this.somLigando.play().catch(e => console.error("Erro ao tocar som ligando:", e));
            }
        }
    }

    /**
     * Desliga o motor do veículo.
     * Se o veículo já estiver desligado, não faz nada.
     * A velocidade é geralmente resetada para 0 nas classes filhas ao desligar.
     */
    desligar() {
        if (this.ligado) {
            this.ligado = false;
            console.log(`${this.constructor.name} ${this.modelo} desligado!`);
        }
    }

    /**
     * Simula o ato de buzinar. Classes filhas devem sobrescrever para sons específicos.
     */
    buzinar() {
        console.log("Bi bi! (Som genérico de buzina)");
    }

    /**
     * Adiciona um registro de manutenção ao histórico do veículo.
     * O histórico é mantido ordenado pela data da manutenção (mais recente primeiro).
     * @param {Manutencao} manutencao - O objeto Manutencao a ser adicionado.
     * @returns {boolean} True se a manutenção foi adicionada com sucesso, false se o objeto não for uma instância de Manutencao.
     */
    adicionarManutencao(manutencao) {
        if (!(manutencao instanceof Manutencao)) {
            console.error("Tentativa de adicionar item inválido ao histórico de manutenção. Esperado objeto Manutencao.");
            alert("Erro interno: Objeto de manutenção inválido. Verifique o console.");
            return false;
        }
        this.historicoManutencao.push(manutencao);
        this.historicoManutencao.sort((a, b) => b.getDataObj() - a.getDataObj());
        console.log(`Manutenção adicionada ao ${this.modelo}: ${manutencao.formatar()}`);
        return true;
    }

    /**
     * Remove um registro de manutenção do histórico do veículo pelo seu ID.
     * @param {string} idManutencao - O ID da manutenção a ser removida.
     * @returns {boolean} True se a manutenção foi encontrada e removida, false caso contrário.
     */
    removerManutencao(idManutencao) {
        const index = this.historicoManutencao.findIndex(m => m.id === idManutencao);
        if (index > -1) {
            const removida = this.historicoManutencao.splice(index, 1);
            console.log(`Manutenção '${removida[0]?.tipo || idManutencao}' removida do histórico do ${this.modelo}.`);
            return true;
        }
        console.warn(`Manutenção com ID ${idManutencao} não encontrada para remoção no ${this.modelo}.`);
        return false;
    }

    /**
     * Retorna o histórico de manutenções formatado.
     * Por padrão, filtra apenas manutenções passadas ou presentes.
     * @param {boolean} [apenasPassado=true] - Se true, retorna apenas manutenções cuja data já ocorreu.
     * @returns {Array<{id: string, texto: string}>} Um array de objetos, cada um com o ID e o texto formatado da manutenção.
     */
    getHistoricoFormatado(apenasPassado = true) {
        const agora = new Date();
        return this.historicoManutencao
            .filter(m => !apenasPassado || m.getDataObj() <= agora)
            .map(m => ({ id: m.id, texto: m.formatar() }));
    }

    /**
     * Retorna os agendamentos futuros de manutenção formatados.
     * Filtra apenas manutenções cuja data ainda não ocorreu.
     * @returns {Array<{id: string, texto: string}>} Um array de objetos, cada um com o ID e o texto formatado do agendamento.
     */
    getAgendamentosFuturosFormatado() {
        const agora = new Date();
        return this.historicoManutencao
            .filter(m => m.getDataObj() > agora)
            .map(m => ({ id: m.id, texto: m.formatarAgendamento() }));
    }

    /**
     * Converte a instância do Veiculo para um objeto simples (plain object) para serialização (ex: LocalStorage).
     * @returns {object} Um objeto simples representando o estado do veículo.
     * @property {string} id - ID do veículo.
     * @property {string} tipoVeiculo - Nome da classe do veículo (ex: "Carro", "Caminhao").
     * @property {string} modelo - Modelo do veículo.
     * @property {string} cor - Cor do veículo.
     * @property {boolean} ligado - Estado do motor.
     * @property {object[]} historicoManutencao - Array de objetos simples representando as manutenções.
     */
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

    /**
     * Cria uma instância da classe Veiculo apropriada (Carro, CarroEsportivo, Caminhao)
     * a partir de um objeto simples (plain object), geralmente vindo de dados desserializados.
     * @static
     * @param {object} obj - O objeto simples contendo as propriedades do veículo.
     * @param {string} obj.tipoVeiculo - O nome da classe do veículo a ser instanciada.
     * @param {string} obj.modelo - Modelo do veículo.
     * @param {string} obj.cor - Cor do veículo.
     * @param {boolean} [obj.ligado=false] - Estado do motor.
     * @param {number} [obj.velocidade=0] - Velocidade atual (para carros e derivados).
     * @param {boolean} [obj.turboAtivado=false] - Estado do turbo (para CarroEsportivo).
     * @param {number} [obj.capacidadeCarga=10000] - Capacidade de carga (para Caminhao).
     * @param {number} [obj.cargaAtual=0] - Carga atual (para Caminhao).
     * @param {Array<object>} [obj.historicoManutencao=[]] - Array de objetos simples de manutenção.
     * @param {string} [obj.id] - ID do veículo (será usado se fornecido, senão um novo é gerado pelo construtor).
     * @returns {Veiculo|null} Uma nova instância da classe de veículo correta ou null em caso de erro.
     */
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
            veiculo.id = obj.id || veiculo.id; // Usa o ID do objeto se existir, senão o gerado no construtor
            veiculo.ligado = obj.ligado || false;
            // A velocidade é definida nas classes filhas, mas para garantir que seja número:
            if (veiculo.hasOwnProperty('velocidade')) {
                veiculo.velocidade = Number(obj.velocidade) || 0;
            }

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
/**
 * Representa um carro comum, herdando de Veiculo.
 * Adiciona funcionalidades como controle de velocidade.
 * @class Carro
 * @extends Veiculo
 */
class Carro extends Veiculo {
    /**
     * Cria uma instância de Carro.
     * @param {string} modelo - O modelo do carro.
     * @param {string} cor - A cor do carro.
     */
    constructor(modelo, cor) {
        super(modelo, cor);
        /** @property {number} velocidade - Velocidade atual do carro em km/h. */
        this.velocidade = 0;
        /** @property {HTMLAudioElement|null} somBuzina - Elemento de áudio para a buzina específica do carro. */
        this.somBuzina = document.getElementById("somBuzinaCarro");
    }

    /**
     * Desliga o motor do carro e redefine sua velocidade para 0.
     * @override
     */
    desligar() {
        super.desligar();
        this.velocidade = 0;
    }

    /**
     * Acelera o carro, aumentando sua velocidade em 10 km/h.
     * O carro deve estar ligado para acelerar.
     * Toca som de aceleração.
     */
    acelerar() {
        if (this.ligado) {
            this.velocidade += 10;
            if (this.somAceleracao && typeof this.somAceleracao.play === 'function') {
                this.somAceleracao.play().catch(e => console.error("Erro ao tocar som aceleração:", e));
            }
            console.log(`Acelerando! Velocidade atual: ${this.velocidade} km/h`);
        } else {
            alert("O carro precisa estar ligado para acelerar!");
        }
    }

    /**
     * Freia o carro, diminuindo sua velocidade em 10 km/h, até o mínimo de 0 km/h.
     * O carro deve estar ligado para frear.
     */
    frear() {
        if (this.ligado) {
            this.velocidade -= 10;
            if (this.velocidade < 0) { this.velocidade = 0; }
            console.log(`Freando! Velocidade atual: ${this.velocidade} km/h`);
        } else {
            alert("O carro precisa estar ligado para frear!");
        }
    }

    /**
     * Toca a buzina específica do carro.
     * Se o som específico não estiver disponível, usa a buzina genérica da classe Veiculo.
     * @override
     */
    buzinar() {
        if (this.somBuzina && typeof this.somBuzina.play === 'function') {
            this.somBuzina.play().catch(e => console.error("Erro ao tocar buzina:", e));
        } else {
            super.buzinar();
        }
        console.log("Fon fon!");
    }

    /**
     * Converte a instância do Carro para um objeto simples para serialização.
     * Inclui a propriedade 'velocidade' além das propriedades da classe Veiculo.
     * @override
     * @returns {object} Um objeto simples representando o estado do carro.
     */
    toPlainObject() {
        const plain = super.toPlainObject();
        plain.velocidade = this.velocidade;
        return plain;
    }
}

// ===== CLASSE CARRO ESPORTIVO =====
/**
 * Representa um carro esportivo, herdando de Carro.
 * Adiciona funcionalidades como controle de turbo.
 * @class CarroEsportivo
 * @extends Carro
 */
class CarroEsportivo extends Carro {
    /**
     * Cria uma instância de CarroEsportivo.
     * @param {string} modelo - O modelo do carro esportivo.
     * @param {string} cor - A cor do carro esportivo.
     */
    constructor(modelo, cor) {
        super(modelo, cor);
        /** @property {boolean} turboAtivado - Indica se o turbo está ativado. */
        this.turboAtivado = false;
        /** @property {HTMLAudioElement|null} somTurbo - Elemento de áudio para o som do turbo. */
        this.somTurbo = document.getElementById("somTurbo");
        /** @property {HTMLAudioElement|null} somBuzina - Elemento de áudio para a buzina específica do carro esportivo. */
        this.somBuzina = document.getElementById("somBuzinaEsportivo"); // Sobrescreve o somBuzina do Carro
    }

    /**
     * Liga o motor do carro esportivo.
     * (Herda comportamento de Veiculo.ligar via Carro.ligar)
     * @override
     */
    ligar() {
        super.ligar();
    }

    /**
     * Desliga o motor do carro esportivo, redefine sua velocidade para 0 e desativa o turbo.
     * @override
     */
    desligar() {
        super.desligar(); // Já zera a velocidade
        this.turboAtivado = false;
        console.log("Turbo desativado ao desligar.");
    }

    /**
     * Ativa o turbo do carro esportivo.
     * O carro deve estar ligado.
     * Toca o som do turbo.
     */
    ativarTurbo() {
        if (this.ligado) {
            if (!this.turboAtivado) {
                this.turboAtivado = true;
                if (this.somTurbo && typeof this.somTurbo.play === 'function') {
                    this.somTurbo.play().catch(e => console.error("Erro ao tocar som turbo:", e));
                }
                console.log("Turbo ativado!");
            } else {
                alert("O turbo já está ativado!");
            }
        } else {
            alert("O carro precisa estar ligado para ativar o turbo!");
        }
    }

    /**
     * Desativa o turbo do carro esportivo.
     */
    desativarTurbo() {
        if (this.turboAtivado) {
            this.turboAtivado = false;
            console.log("Turbo desativado!");
        }
    }

    /**
     * Acelera o carro esportivo. Se o turbo estiver ativado, o incremento de velocidade é maior.
     * O carro deve estar ligado.
     * Toca som de aceleração.
     * @override
     */
    acelerar() {
        if (this.ligado) {
            const incremento = this.turboAtivado ? 30 : 15;
            this.velocidade += incremento;
            if (this.somAceleracao && typeof this.somAceleracao.play === 'function') {
                this.somAceleracao.play().catch(e => console.error("Erro ao tocar som aceleração:", e));
            }
            console.log(`Acelerando ${this.turboAtivado ? 'com Turbo' : ''}! Velocidade atual: ${this.velocidade} km/h`);
        } else {
            alert("O carro precisa estar ligado para acelerar!");
        }
    }

    /**
     * Toca a buzina específica do carro esportivo.
     * @override
     */
    buzinar() {
        if (this.somBuzina && typeof this.somBuzina.play === 'function') {
            this.somBuzina.play().catch(e => console.error("Erro ao tocar buzina:", e));
        } else {
            super.buzinar(); // Fallback para a buzina do Carro ou Veiculo
        }
        console.log("Vrum vrum! (Buzina Esportiva)");
    }

    /**
     * Converte a instância do CarroEsportivo para um objeto simples para serialização.
     * Inclui a propriedade 'turboAtivado' além das propriedades da classe Carro.
     * @override
     * @returns {object} Um objeto simples representando o estado do carro esportivo.
     */
    toPlainObject() {
        const plain = super.toPlainObject();
        plain.turboAtivado = this.turboAtivado;
        return plain;
    }
}

// ===== CLASSE CAMINHAO =====
/**
 * Representa um caminhão, herdando de Carro.
 * Adiciona funcionalidades como controle de capacidade e carga atual.
 * @class Caminhao
 * @extends Carro
 */
class Caminhao extends Carro {
    /**
     * Cria uma instância de Caminhao.
     * @param {string} modelo - O modelo do caminhão.
     * @param {string} cor - A cor do caminhão.
     * @param {number|string} capacidadeCarga - A capacidade máxima de carga do caminhão em kg.
     * @throws {Error} Se a capacidade de carga for inválida (não numérica ou menor/igual a zero).
     */
    constructor(modelo, cor, capacidadeCarga) {
        super(modelo, cor);
        const capNum = Number(capacidadeCarga);
        if (isNaN(capNum) || capNum <= 0) throw new Error("Capacidade de carga inválida. Deve ser um número positivo.");
        /** @property {number} capacidadeCarga - Capacidade máxima de carga em kg. */
        this.capacidadeCarga = capNum;
        /** @property {number} cargaAtual - Carga atual do caminhão em kg. */
        this.cargaAtual = 0;
        /** @property {HTMLAudioElement|null} somBuzina - Elemento de áudio para a buzina específica do caminhão. */
        this.somBuzina = document.getElementById("somBuzinaCaminhao"); // Sobrescreve o somBuzina
    }

    /**
     * Acelera o caminhão. O incremento de velocidade é afetado pela carga atual.
     * O caminhão deve estar ligado.
     * @override
     */
    acelerar() {
        if (this.ligado) {
            const fatorCarga = Math.max(0.2, 1 - (this.cargaAtual / (this.capacidadeCarga * 1.5))); // Evita fator zero ou negativo
            const incremento = Math.max(1, 5 * fatorCarga); // Garante incremento mínimo
            this.velocidade += incremento;
            if (this.somAceleracao && typeof this.somAceleracao.play === 'function') {
                this.somAceleracao.play().catch(e => console.error("Erro ao tocar som aceleração:", e));
            }
            console.log(`Caminhão acelerando! Carga: ${this.cargaAtual}kg. Velocidade: ${this.velocidade.toFixed(1)} km/h`);
        } else {
            alert("O caminhão precisa estar ligado para acelerar!");
        }
    }

    /**
     * Freia o caminhão. A capacidade de frenagem é afetada pela carga atual.
     * O caminhão deve estar ligado.
     * @override
     */
    frear() {
        if (this.ligado) {
            const fatorCarga = Math.max(0.3, 1 - (this.cargaAtual / (this.capacidadeCarga * 2.0)));
            const decremento = Math.max(2, 8 * fatorCarga);
            this.velocidade -= decremento;
            if (this.velocidade < 0) { this.velocidade = 0; }
            console.log(`Caminhão freando! Carga: ${this.cargaAtual}kg. Velocidade: ${this.velocidade.toFixed(1)} km/h`);
        } else {
            alert("O caminhão precisa estar ligado para frear!");
        }
    }

    /**
     * Carrega o caminhão com uma determinada quantidade de carga.
     * Não permite exceder a capacidade máxima.
     * @param {number|string} quantidade - A quantidade de carga a ser adicionada (em kg).
     * @returns {boolean} True se a carga foi adicionada com sucesso, false caso contrário (ex: quantidade inválida, capacidade excedida).
     */
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

    /**
     * Descarrega o caminhão em uma determinada quantidade.
     * Não permite descarregar mais do que a carga atual.
     * @param {number|string} quantidade - A quantidade de carga a ser removida (em kg).
     * @returns {boolean} True se a carga foi removida com sucesso, false caso contrário (ex: quantidade inválida, carga insuficiente).
     */
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

    /**
     * Toca a buzina específica do caminhão.
     * @override
     */
    buzinar() {
        if (this.somBuzina && typeof this.somBuzina.play === 'function') {
            this.somBuzina.play().catch(e => console.error("Erro ao tocar buzina:", e));
        } else {
            super.buzinar();
        }
        console.log("Fóóóóóm! (Buzina de Caminhão)");
    }

    /**
     * Converte a instância do Caminhao para um objeto simples para serialização.
     * Inclui as propriedades 'capacidadeCarga' e 'cargaAtual'.
     * @override
     * @returns {object} Um objeto simples representando o estado do caminhão.
     */
    toPlainObject() {
        const plain = super.toPlainObject();
        plain.capacidadeCarga = this.capacidadeCarga;
        plain.cargaAtual = this.cargaAtual;
        return plain;
    }
}

// ===== API SIMULADA - BUSCA DETALHES EXTRAS =====

/**
 * Busca detalhes extras de um veículo em uma API simulada (arquivo JSON local).
 * @async
 * @function buscarDetalhesVeiculoAPI
 * @param {string} identificadorVeiculo - O ID único do veículo (gerado pela classe Veiculo) a ser buscado no JSON.
 * @returns {Promise<object|null>} Uma Promise que resolve com o objeto de detalhes do veículo encontrado no JSON,
 *                                 ou null se não encontrado ou em caso de erro de fetch/parse.
 */
async function buscarDetalhesVeiculoAPI(identificadorVeiculo) {
    const url = './dados_veiculos_api.json';
    console.log(`[API Simulada] Buscando detalhes para o veículo ID: ${identificadorVeiculo}`);

    try {
        const response = await fetch(url, { cache: "no-cache" });

        if (!response.ok) {
            console.error(`[API Simulada] Erro HTTP: ${response.status} - ${response.statusText} ao buscar ${url}`);
            return null;
        }

        const dadosTodosVeiculos = await response.json();
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

/**
 * Array que armazena as instâncias dos veículos na garagem.
 * @type {Veiculo[]}
 */
let garagemVeiculos = [];
/**
 * Chave usada para armazenar/recuperar os dados da garagem no LocalStorage.
 * @const {string}
 */
const STORAGE_KEY = 'minhaGaragemInteligenteDados';

/**
 * Salva o estado atual da garagem (array de veículos) no LocalStorage.
 * Os veículos são convertidos para objetos simples usando `toPlainObject()` antes de salvar.
 * @function salvarGaragem
 */
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

/**
 * Carrega os dados da garagem do LocalStorage.
 * Converte os objetos simples de volta para instâncias das classes de Veiculo apropriadas
 * usando `Veiculo.fromPlainObject()`.
 * Atualiza a UI da lista de veículos e verifica agendamentos próximos.
 * Em caso de erro na desserialização, a garagem pode ser iniciada vazia e o LocalStorage limpo.
 * @function carregarGaragem
 */
function carregarGaragem() {
    try {
        const dadosSalvos = localStorage.getItem(STORAGE_KEY);
        if (dadosSalvos) {
            const garagemPura = JSON.parse(dadosSalvos);
            garagemVeiculos = garagemPura
                .map(obj => Veiculo.fromPlainObject(obj)) // Polimorfismo na recriação
                .filter(v => v !== null); // Remove veículos que falharam na recriação
            console.log(`Garagem carregada com ${garagemVeiculos.length} veículos.`);
        } else {
            console.log("Nenhum dado salvo encontrado. Iniciando com garagem vazia.");
            garagemVeiculos = [];
        }
    } catch (error) {
        console.error("Erro crítico ao carregar ou processar dados da garagem:", error);
        alert("Erro ao carregar dados da garagem. Os dados podem estar corrompidos. Iniciando garagem vazia. Verifique o console.");
        localStorage.removeItem(STORAGE_KEY); // Limpa dados corrompidos
        garagemVeiculos = [];
    }
    atualizarListaGaragemUI();
    verificarAgendamentosProximos(); // Verifica após carregar os veículos e suas manutenções
}

/**
 * Encontra um veículo na garagem pelo seu ID.
 * @function encontrarVeiculoPorId
 * @param {string} id - O ID do veículo a ser encontrado.
 * @returns {Veiculo|undefined} A instância do veículo se encontrada, ou undefined caso contrário.
 */
function encontrarVeiculoPorId(id) {
    return garagemVeiculos.find(v => v.id === id);
}

// ===== LÓGICA DA INTERFACE E EVENTOS =====

/**
 * Atualiza a lista de veículos exibida na tela da garagem.
 * Limpa a lista existente e a recria com base no array `garagemVeiculos`.
 * Exibe uma mensagem se a garagem estiver vazia.
 * @function atualizarListaGaragemUI
 */
function atualizarListaGaragemUI() {
    const listaDiv = document.getElementById('listaVeiculosGaragem');
    if (!listaDiv) {
        console.error("Elemento 'listaVeiculosGaragem' não encontrado no DOM.");
        return;
    }
    listaDiv.innerHTML = ''; // Limpa conteúdo anterior

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

        li.innerHTML = `
            <span>${tipoNome}: ${veiculo.modelo} (${veiculo.cor})</span>
            <div>
                <button class="btn-ver-detalhes" data-veiculo-id="${veiculo.id}">Ver Detalhes</button>
                <button class="btn-buscar-detalhes-api" data-veiculo-id="${veiculo.id}">Ver Detalhes Extras</button>
                <button class="btn-remover-veiculo" data-veiculo-id="${veiculo.id}" title="Remover Veículo">×</button>
             </div>
        `;
        ul.appendChild(li);
    });
    listaDiv.appendChild(ul);
}

/**
 * Remove um veículo da garagem, tanto do array `garagemVeiculos` quanto do LocalStorage.
 * Atualiza a UI da lista de veículos e exibe uma mensagem de confirmação.
 * @function removerVeiculoDaGaragem
 * @param {string} veiculoId - O ID do veículo a ser removido.
 */
function removerVeiculoDaGaragem(veiculoId) {
    const index = garagemVeiculos.findIndex(v => v.id === veiculoId);
    if (index > -1) {
        const modeloRemovido = garagemVeiculos[index].modelo;
        garagemVeiculos.splice(index, 1);
        salvarGaragem();
        atualizarListaGaragemUI();
        mostrarGaragem(); // Volta para a tela da garagem
        alert(`Veículo ${modeloRemovido} removido com sucesso.`);
    } else {
        console.warn(`Tentativa de remover veículo com ID não encontrado: ${veiculoId}`);
        alert("Erro: Veículo não encontrado para remoção.");
    }
}

/**
 * Exibe o histórico de manutenções passadas e os agendamentos futuros para um veículo específico na UI.
 * @function exibirHistoricoEAgendamentos
 * @param {Veiculo} veiculo - A instância do veículo cujas manutenções serão exibidas.
 */
function exibirHistoricoEAgendamentos(veiculo) {
    if (!veiculo) {
        console.error("Tentativa de exibir histórico para veículo nulo ou indefinido.");
        return;
    }
    const tipo = veiculo.constructor.name; // Ex: Carro, CarroEsportivo, Caminhao
    const idBase = tipo.charAt(0).toLowerCase() + tipo.slice(1); // Ex: carro, carroEsportivo, caminhao
    // Correção: IDs no HTML são 'Carro', 'CarroEsportivo', 'Caminhao' (maiúsculo)
    const historicoUl = document.getElementById(`historicoManutencao${tipo}`);
    const agendamentosUl = document.getElementById(`agendamentosFuturos${tipo}`);
    const inputVeiculoId = document.getElementById(`agendamentoVeiculoId${tipo}`);

    if (!historicoUl || !agendamentosUl || !inputVeiculoId) {
        console.warn(`Elementos de UI para manutenção do tipo '${tipo}' não encontrados. Verifique os IDs no HTML.`);
        return;
    }
    inputVeiculoId.value = veiculo.id; // Define o ID do veículo no campo hidden do formulário de agendamento

    historicoUl.innerHTML = '';
    agendamentosUl.innerHTML = '';

    const historicoFormatado = veiculo.getHistoricoFormatado(true); // Apenas passadas
    const agendamentosFormatado = veiculo.getAgendamentosFuturosFormatado();

    const criarLiManutencao = (item, veiculoId) => {
        const li = document.createElement('li');
        // Adiciona botão de remover para cada item da lista
        const btnRemover = `<button class="btn-remover-manutencao" data-manutencao-id="${item.id}" data-veiculo-id="${veiculoId}" title="Remover Registro">×</button>`;
        li.innerHTML = `${item.texto} ${btnRemover}`;
        return li;
    };

    if (historicoFormatado.length > 0) {
        historicoFormatado.forEach(item => historicoUl.appendChild(criarLiManutencao(item, veiculo.id)));
    } else {
        historicoUl.innerHTML = '<li>Nenhum histórico registrado.</li>';
    }

    if (agendamentosFormatado.length > 0) {
        agendamentosFormatado.forEach(item => agendamentosUl.appendChild(criarLiManutencao(item, veiculo.id)));
    } else {
        agendamentosUl.innerHTML = '<li>Nenhum agendamento futuro.</li>';
    }
}

/**
 * Controla a visibilidade das diferentes "telas" (divs) da aplicação.
 * Esconde todas as telas principais e exibe apenas a tela com o ID fornecido.
 * @function mostrarTela
 * @param {string} idTela - O ID da div (tela) a ser exibida.
 */
function mostrarTela(idTela) {
    // Lista de IDs de todas as telas principais
    const todasAsTelas = [
        "menuPrincipal", "garagem",
        "informacoesCarro", "informacoesCarroEsportivo", "informacoesCaminhao"
    ];

    todasAsTelas.forEach(id => {
        const telaElement = document.getElementById(id);
        if (telaElement) {
            telaElement.style.display = "none";
        }
    });

    const telaParaMostrar = document.getElementById(idTela);
    if (telaParaMostrar) {
        telaParaMostrar.style.display = "block";
    } else {
        console.error(`Tela com ID '${idTela}' não encontrada! Voltando para o menu principal.`);
        mostrarMenuPrincipal(); // Fallback
    }
}

/**
 * Exibe a tela do menu principal.
 * @function mostrarMenuPrincipal
 */
function mostrarMenuPrincipal() { mostrarTela("menuPrincipal"); }

/**
 * Exibe a tela da garagem e atualiza a lista de veículos.
 * @function mostrarGaragem
 */
function mostrarGaragem() {
    mostrarTela("garagem");
    atualizarListaGaragemUI(); // Garante que a lista está sempre atualizada ao mostrar a garagem
}

/**
 * Exibe a tela de detalhes de um veículo específico.
 * Preenche os campos da UI com as informações do veículo e configura os botões de ação.
 * @function mostrarDetalhesVeiculo
 * @param {string} veiculoId - O ID do veículo cujos detalhes serão exibidos.
 */
function mostrarDetalhesVeiculo(veiculoId) {
    const veiculo = encontrarVeiculoPorId(veiculoId);
    if (!veiculo) {
        console.error(`Veículo com ID ${veiculoId} não encontrado para mostrar detalhes.`);
        alert("Erro: Veículo não encontrado.");
        mostrarGaragem(); // Volta para a garagem se o veículo não for encontrado
        return;
    }

    const tipo = veiculo.constructor.name; // Ex: Carro, CarroEsportivo, Caminhao
    const idBaseDiv = `informacoes${tipo}`; // Ex: informacoesCarro
    mostrarTela(idBaseDiv); // Mostra a div correta para o tipo de veículo

    const divInfo = document.getElementById(idBaseDiv);

    if (divInfo) {
        // Preenche informações comuns
        document.getElementById(`modelo${tipo}`).textContent = veiculo.modelo;
        document.getElementById(`cor${tipo}`).textContent = veiculo.cor;
        document.getElementById(`velocidade${tipo}`).textContent = (veiculo.velocidade !== undefined) ? veiculo.velocidade.toFixed(1) : 'N/A';
        document.getElementById(`status${tipo}`).textContent = veiculo.ligado ? "Ligado" : "Desligado";

        // Configura o data-veiculo-id para todos os botões de ação dentro da div
        divInfo.querySelectorAll('button[data-veiculo-id]').forEach(btn => {
            btn.dataset.veiculoId = veiculoId;
        });

        // Preenche informações específicas do tipo de veículo
        if (tipo === 'CarroEsportivo' && veiculo instanceof CarroEsportivo) {
            document.getElementById(`turboCarroEsportivo`).textContent = veiculo.turboAtivado ? "Ativado" : "Desativado";
        } else if (tipo === 'Caminhao' && veiculo instanceof Caminhao) {
            document.getElementById(`capacidadeCargaCaminhao`).textContent = veiculo.capacidadeCarga;
            document.getElementById(`cargaAtualCaminhao`).textContent = veiculo.cargaAtual;
            const inputCarga = document.getElementById("quantidadeCarga");
            if (inputCarga && !inputCarga.value) inputCarga.value = 1000; // Valor padrão se vazio
        }

        // Atualiza o texto e o estado visual do botão Ligar/Desligar
        const btnLigar = document.getElementById(`ligarDesligar${tipo}`);
        if (btnLigar) {
            btnLigar.textContent = veiculo.ligado ? "Desligar" : "Ligar";
            btnLigar.dataset.estado = veiculo.ligado ? "ligado" : "desligado"; // Para estilização CSS
        }

        // Exibe histórico e agendamentos
        exibirHistoricoEAgendamentos(veiculo);

        // Limpa a área de detalhes da API (será preenchida ao clicar no botão específico)
        const idAreaDetalhesApi = `detalhesApi${tipo}`;
        const areaDetalhesApi = document.getElementById(idAreaDetalhesApi);
        if (areaDetalhesApi) {
            areaDetalhesApi.innerHTML = '<p style="font-style: italic; color: #6c757d;">Clique em "Ver Detalhes Extras" na garagem para carregar.</p>';
        }

    } else {
        console.error(`Div de informações '${idBaseDiv}' não encontrada para o veículo tipo '${tipo}'.`);
        mostrarGaragem(); // Fallback
    }
}

// --- Event Listeners ---

/**
 * Listener global de cliques no corpo do documento para lidar com eventos delegados,
 * como cliques em botões de detalhes, remoção, ações de veículos, etc.
 * Isso evita a necessidade de adicionar múltiplos listeners a elementos dinâmicos.
 */
document.body.addEventListener('click', function(event) {
    const target = event.target; // Elemento que originou o clique

    // Botão "Ver Detalhes" na lista da garagem
    if (target.classList.contains('btn-ver-detalhes')) {
        const veiculoId = target.dataset.veiculoId;
        if (veiculoId) {
            mostrarDetalhesVeiculo(veiculoId);
        }
    }
    // Botão "Remover Veículo" (ícone '×') na lista da garagem
    else if (target.classList.contains('btn-remover-veiculo')) {
        const veiculoId = target.dataset.veiculoId;
        const veiculo = encontrarVeiculoPorId(veiculoId);
        if (veiculo && confirm(`Tem certeza que deseja remover o ${veiculo.modelo} (${veiculo.cor})? Esta ação não pode ser desfeita.`)) {
            removerVeiculoDaGaragem(veiculoId);
        }
    }
    // Botão "Remover Manutenção/Agendamento" (ícone '×') nas listas de detalhes
    else if (target.classList.contains('btn-remover-manutencao')) {
        const manutencaoId = target.dataset.manutencaoId;
        const veiculoId = target.dataset.veiculoId;
        const veiculo = encontrarVeiculoPorId(veiculoId);
        if (veiculo && manutencaoId && confirm("Tem certeza que deseja remover este registro de manutenção?")) {
            if (veiculo.removerManutencao(manutencaoId)) {
                salvarGaragem();
                exibirHistoricoEAgendamentos(veiculo); // Atualiza a lista na UI
                alert("Registro de manutenção removido com sucesso.");
            } else {
                alert("Erro ao remover o registro de manutenção.");
            }
        }
    }
    // Botão "Ver Detalhes Extras" (API Simulada)
    else if (target.classList.contains('btn-buscar-detalhes-api')) {
        const veiculoId = target.dataset.veiculoId;
        const veiculo = encontrarVeiculoPorId(veiculoId);

        if (veiculoId && veiculo) {
            const tipo = veiculo.constructor.name;
            const idAreaDetalhes = `detalhesApi${tipo}`;

            // Primeiro, garante que a tela de detalhes correta esteja visível
            mostrarDetalhesVeiculo(veiculoId); // Isso já limpa a área da API

            // Pequeno delay para garantir que o DOM da tela de detalhes está pronto
            setTimeout(() => {
                const areaDetalhes = document.getElementById(idAreaDetalhes);
                if (areaDetalhes) {
                    areaDetalhes.innerHTML = '<p>Carregando detalhes extras...</p>';
                    target.disabled = true; // Desabilita o botão durante a carga
                    target.textContent = 'Carregando...';

                    buscarDetalhesVeiculoAPI(veiculoId)
                        .then(detalhes => {
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
                         })
                        .finally(() => {
                            target.disabled = false; // Reabilita o botão
                            target.textContent = 'Ver Detalhes Extras';
                        });
                } else {
                    console.error(`Área de detalhes com ID ${idAreaDetalhes} não encontrada após mostrar detalhes!`);
                    alert("Erro interno: Não foi possível encontrar a área para exibir os detalhes extras.");
                    target.disabled = false;
                    target.textContent = 'Ver Detalhes Extras';
                }
            }, 50); // Delay para renderização da tela de detalhes
        } else {
             console.error("ID do veículo ou objeto Veículo não encontrado para buscar detalhes da API.");
             alert("Não foi possível identificar o veículo para buscar detalhes extras.");
        }
    }
    // Botões de Ação do Veículo (Ligar/Desligar, Acelerar, Frear, etc.)
    // Verifica se o botão clicado tem o atributo 'data-veiculo-id'
    else if (target.dataset.veiculoId && !target.classList.contains('btn-ver-detalhes') && !target.classList.contains('btn-buscar-detalhes-api') && !target.classList.contains('btn-remover-veiculo') && !target.classList.contains('btn-remover-manutencao')) {
        const veiculoId = target.dataset.veiculoId;
        const veiculo = encontrarVeiculoPorId(veiculoId);
        if (!veiculo) {
            console.warn(`Veículo ${veiculoId} não encontrado para ação do botão ${target.id}.`);
            return;
        }

        const tipo = veiculo.constructor.name;
        const idBotao = target.id; // ID do botão clicado
        let precisaSalvar = false; // Flag para indicar se a garagem precisa ser salva após a ação

        // Lógica específica para cada botão de ação
        if (idBotao === `ligarDesligar${tipo}`) {
            if (veiculo.ligado) veiculo.desligar(); else veiculo.ligar();
            mostrarDetalhesVeiculo(veiculoId); // Recarrega UI para refletir estado (incluindo texto do botão)
            precisaSalvar = true;
        }
        else if (idBotao === `acelerar${tipo}`) {
            veiculo.acelerar();
            document.getElementById(`velocidade${tipo}`).textContent = veiculo.velocidade.toFixed(1);
            // Não precisa salvar aqui, pois a velocidade não é persistida no desligar/ligar, mas sim no estado geral
        }
        else if (idBotao === `frear${tipo}`) {
            veiculo.frear();
            document.getElementById(`velocidade${tipo}`).textContent = veiculo.velocidade.toFixed(1);
        }
        else if (idBotao.startsWith('buzinar')) { // Ex: buzinarCarro, buzinarCarroEsportivo
            veiculo.buzinar();
        }
        // Ações específicas de CarroEsportivo
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
        // Ações específicas de Caminhao
        else if (idBotao === `carregarCaminhao` && veiculo instanceof Caminhao) {
            const quantidadeInput = document.getElementById("quantidadeCarga");
            if (quantidadeInput && veiculo.carregar(quantidadeInput.value)){ // carregar() já dá alert
                document.getElementById(`cargaAtualCaminhao`).textContent = veiculo.cargaAtual;
                precisaSalvar = true;
            }
        }
        else if (idBotao === `descarregarCaminhao` && veiculo instanceof Caminhao) {
            const quantidadeInput = document.getElementById("quantidadeCarga");
            if (quantidadeInput && veiculo.descarregar(quantidadeInput.value)){ // descarregar() já dá alert
                document.getElementById(`cargaAtualCaminhao`).textContent = veiculo.cargaAtual;
                precisaSalvar = true;
            }
        }

        if (precisaSalvar) {
            salvarGaragem();
        }
    }
});

// Listeners de Navegação Básica (entre telas principais)
document.getElementById("botaoGaragem")?.addEventListener("click", mostrarGaragem);
document.getElementById("voltarParaMenu")?.addEventListener("click", mostrarMenuPrincipal);
document.getElementById("voltarParaGaragemCarro")?.addEventListener("click", mostrarGaragem);
document.getElementById("voltarParaGaragemEsportivo")?.addEventListener("click", mostrarGaragem);
document.getElementById("voltarParaGaragemCaminhao")?.addEventListener("click", mostrarGaragem);

/**
 * Listener para o formulário de adicionar novo veículo.
 * Cria uma nova instância de veículo com base nos dados do formulário,
 * adiciona à garagem, salva e atualiza a UI.
 */
const formAdicionar = document.getElementById('formAdicionarVeiculo');
if (formAdicionar) {
    formAdicionar.addEventListener('submit', function(event) {
        event.preventDefault();
        const tipoSelect = document.getElementById('tipoNovoVeiculo');
        const modeloInput = document.getElementById('modeloNovoVeiculo');
        const corInput = document.getElementById('corNovoVeiculo');
        const capacidadeInput = document.getElementById('capacidadeNovoCaminhao'); // Específico para Caminhão

        // Validação básica dos campos (poderia ser mais robusta)
        if (!tipoSelect || !modeloInput || !corInput || !capacidadeInput) {
            alert("Erro: Elementos do formulário não encontrados.");
            return;
        }

        const tipo = tipoSelect.value;
        const modelo = modeloInput.value;
        const cor = corInput.value;
        const capacidade = (tipo === 'Caminhao') ? capacidadeInput.value : null;

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
                    if (!capacidade) throw new Error("Capacidade de carga é obrigatória para caminhão.");
                    const capNum = Number(capacidade);
                    // A validação de capNum > 0 já está no construtor do Caminhao
                    novoVeiculo = new Caminhao(modelo, cor, capNum);
                    break;
                default:
                    throw new Error("Tipo de veículo selecionado é inválido.");
            }

            if (novoVeiculo) {
                garagemVeiculos.push(novoVeiculo);
                salvarGaragem();
                atualizarListaGaragemUI();
                alert(`${tipo === 'Carro' ? 'Carro Comum' : tipo} "${modelo}" adicionado à garagem!`);
                this.reset(); // Limpa o formulário
                // Esconde o campo de capacidade se não for caminhão (após reset)
                document.getElementById('campoCapacidadeCaminhao').style.display = (tipoSelect.value === 'Caminhao') ? 'flex' : 'none';
            }
        } catch (error) {
            console.error("Erro ao criar novo veículo:", error);
            alert(`Erro ao adicionar veículo: ${error.message}`);
        }
    });
}

/**
 * Listener para mostrar/esconder o campo de capacidade de carga
 * ao mudar o tipo de veículo no formulário de adição.
 */
const tipoNovoSelect = document.getElementById('tipoNovoVeiculo');
if (tipoNovoSelect) {
    tipoNovoSelect.addEventListener('change', function() {
        const campoCapacidade = document.getElementById('campoCapacidadeCaminhao');
        if (campoCapacidade) {
            campoCapacidade.style.display = (this.value === 'Caminhao') ? 'flex' : 'none';
        }
    });
}

/**
 * Handler genérico para o submit dos formulários de agendamento de manutenção.
 * Coleta os dados do formulário, cria uma nova instância de `Manutencao`,
 * adiciona ao veículo correspondente, salva e atualiza a UI.
 * @param {Event} event - O objeto de evento do submit.
 */
function handleAgendamentoSubmit(event) {
    event.preventDefault();
    const form = event.target;
    // O ID do veículo está em um input hidden dentro do formulário
    const veiculoIdInput = form.querySelector('input[type="hidden"]');
    if (!veiculoIdInput || !veiculoIdInput.value) {
        alert("Erro crítico: ID do veículo não encontrado no formulário de agendamento.");
        return;
    }
    const veiculoId = veiculoIdInput.value;
    const veiculo = encontrarVeiculoPorId(veiculoId);

    if (!veiculo) {
        alert("Erro crítico: Veículo não encontrado para agendar manutenção.");
        return;
    }

    const dataStr = form.querySelector('input[type="date"]')?.value;
    const horaStr = form.querySelector('input[type="time"]')?.value || '00:00'; // Default se não fornecido
    const tipoServico = form.querySelector('input[type="text"]')?.value;
    const custoServico = form.querySelector('input[type="number"]')?.value;
    const descricaoServico = form.querySelector('textarea')?.value;

    if (!dataStr || !tipoServico || !custoServico) {
        alert("Por favor, preencha todos os campos obrigatórios: Data, Tipo de Serviço e Custo.");
        return;
    }

    // Combina data e hora para criar um objeto Date
    const dataHoraISO = `${dataStr}T${horaStr}:00`; // Assume fuso horário local

    try {
        const novaManutencao = new Manutencao(dataHoraISO, tipoServico, custoServico, descricaoServico);
        if (veiculo.adicionarManutencao(novaManutencao)) {
            salvarGaragem();
            exibirHistoricoEAgendamentos(veiculo); // Atualiza as listas na UI
            alert("Manutenção/Agendamento adicionado com sucesso!");
            form.reset(); // Limpa o formulário
        } else {
            // A classe Manutencao ou Veiculo já deve ter lidado com o erro específico.
            // Este é um fallback se adicionarManutencao retornar false por outra razão.
            alert("Falha ao adicionar manutenção ao veículo. Verifique o console.");
        }
    } catch (error) {
        console.error("Erro ao criar ou adicionar manutenção:", error);
        alert(`Erro no agendamento: ${error.message}`);
    }
}

// Adiciona o handler aos formulários de agendamento
document.getElementById('formAgendamentoCarro')?.addEventListener('submit', handleAgendamentoSubmit);
document.getElementById('formAgendamentoCarroEsportivo')?.addEventListener('submit', handleAgendamentoSubmit);
document.getElementById('formAgendamentoCaminhao')?.addEventListener('submit', handleAgendamentoSubmit);

// --- Alertas e Notificações ---
/**
 * Verifica se existem agendamentos de manutenção para hoje ou amanhã
 * e exibe um alerta para o usuário.
 * @function verificarAgendamentosProximos
 */
function verificarAgendamentosProximos() {
    const hoje = new Date();
    const amanha = new Date();
    amanha.setDate(hoje.getDate() + 1);

    // Zera horas, minutos, segundos e milissegundos para comparar apenas as datas
    hoje.setHours(0, 0, 0, 0);
    amanha.setHours(0, 0, 0, 0);

    let alertas = [];
    garagemVeiculos.forEach(veiculo => {
        veiculo.historicoManutencao.forEach(m => {
            if (m.isFuture()) { // Considera apenas agendamentos futuros
                const dataAgendamento = m.getDataObj();
                const dataAgendamentoSemHora = new Date(dataAgendamento);
                dataAgendamentoSemHora.setHours(0, 0, 0, 0);

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
        // Usa setTimeout para garantir que o alerta apareça após a UI principal estar visível
        setTimeout(() => {
            alert("Lembretes de Agendamento:\n\n" + alertas.join("\n"));
        }, 1500); // Atraso de 1.5 segundos
    }
}

// --- Inicialização ---
/**
 * Listener para o evento 'load' da janela.
 * Executa as rotinas de inicialização da aplicação:
 * - Carrega a garagem do LocalStorage.
 * - Exibe o menu principal.
 * - Configura o estado inicial do formulário de adicionar veículo (campo de capacidade).
 */
window.addEventListener('load', () => {
    console.log("Página carregada. Inicializando aplicação Garagem Inteligente...");
    carregarGaragem();      // Carrega dados e atualiza UI da garagem (que está escondida)
    mostrarMenuPrincipal(); // Define a tela inicial

    // Garante que o campo de capacidade do caminhão esteja no estado correto no formulário
    const tipoSelectInit = document.getElementById('tipoNovoVeiculo');
    const campoCapacidadeInit = document.getElementById('campoCapacidadeCaminhao');
    if (tipoSelectInit && campoCapacidadeInit) {
        campoCapacidadeInit.style.display = (tipoSelectInit.value === 'Caminhao') ? 'flex' : 'none';
    } else {
        console.warn("Elementos do formulário de adicionar veículo não encontrados na inicialização para ajuste do campo de capacidade.");
    }
    console.log("Aplicação Garagem Inteligente inicializada.");
});

console.log("Script principal (script.js) carregado e pronto para executar no evento 'load'.");
// =============================================
//        FIM DO SCRIPT COMPLETO
// =============================================