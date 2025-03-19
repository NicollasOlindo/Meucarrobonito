// Classe Base: Veiculo
class Veiculo {
    constructor(modelo, cor) {
        this.modelo = modelo;
        this.cor = cor;
        this.ligado = false;
    }

    ligar() {
        this.ligado = !this.ligado; // Alterna o estado
        console.log(this.ligado ? "Veículo ligado!" : "Veículo desligado!");
        return this.ligado; // Retorna o novo estado
    }

    buzinar() {
        console.log("Bi bi!"); // Som genérico
    }
}

// Classe Carro que herda de Veiculo
class Carro extends Veiculo {
    constructor(modelo, cor) {
        super(modelo, cor);
        this.velocidade = 0;
        this.somAceleracao = document.getElementById("somAceleracao");
        this.somLigando = document.getElementById("somLigando");
    }

    ligar() {
        const estado = super.ligar(); // Chama o método ligar da classe Veiculo
        estado ? this.somLigando.play() : null; // toca o som so se ligar
    }

    acelerar() {
        if (this.ligado) {
            this.velocidade += 10;
            this.somAceleracao.play();
            console.log(`Acelerando! Velocidade atual: ${this.velocidade} km/h`);
        } else {
            console.log("O carro precisa estar ligado para acelerar!");
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
            console.log("O carro precisa estar ligado para frear!");
        }
    }

    buzinar() {
        const somBuzinaCarro = document.getElementById("somBuzinaCarro");
        somBuzinaCarro.play();
    }
}

// Classe CarroEsportivo que herda de Carro
class CarroEsportivo extends Carro {
    constructor(modelo, cor) {
        super(modelo, cor);
        this.turboAtivado = false;
        this.somTurbo = document.getElementById("somTurbo");
    }

    ativarTurbo() {
        if (this.ligado) {
            this.turboAtivado = !this.turboAtivado;
            this.turboAtivado ? this.somTurbo.play() : null;
            console.log(this.turboAtivado ? "Turbo ativado!" : "Turbo desativado!");
        } else {
            console.log("O carro precisa estar ligado para ativar o turbo!");
        }
    }

    buzinar() {
        const somBuzinaEsportivo = document.getElementById("somBuzinaEsportivo");
        somBuzinaEsportivo.play();
    }
}

// Classe Caminhao que herda de Carro
class Caminhao extends Carro {
    constructor(modelo, cor, capacidadeCarga) {
        super(modelo, cor);
        this.capacidadeCarga = capacidadeCarga;
        this.cargaAtual = 0;
    }

    carregar(quantidade) {
        if (this.ligado){
            if (this.cargaAtual + quantidade <= this.capacidadeCarga) {
                this.cargaAtual += quantidade;
                console.log(`Caminhão carregado. Carga atual: ${this.cargaAtual} kg`);
            } else {
                console.log("Capacidade máxima de carga excedida!");
            }
        }else {
            console.log("O caminhão precisa estar ligado para carregar!");
        }
    }

    descarregar(quantidade) {
        if(this.ligado){
            if (this.cargaAtual - quantidade >= 0) {
                this.cargaAtual -= quantidade;
                console.log(`Caminhão descarregado. Carga atual: ${this.cargaAtual} kg`);
            } else {
                console.log("Não é possível descarregar mais do que a carga atual!");
            }
        }else{
            console.log("O caminhão precisa estar ligado para descarregar!");
        }
    }

    buzinar() {
        const somBuzinaCaminhao = document.getElementById("somBuzinaCaminhao");
        somBuzinaCaminhao.play();
    }
}

// Criando objetos
const meuCarro = new Carro("Sedan", "Prata");
const meuCarroEsportivo = new CarroEsportivo("Ferrari", "Vermelha");
const meuCaminhao = new Caminhao("Volvo", "Azul", 10000);

let veiculoSelecionado = null; // Armazena o veículo selecionado

// Elementos da Garagem
const botaoAbrirGaragem = document.getElementById("abrirGaragem");
const opcoesGaragem = document.getElementById("opcoesGaragem");
const imagemCarro = document.getElementById("imagemCarro");

// Elementos de Interação
const interacoesComuns = document.getElementById("interacoesComuns");
const interacoesCarroEsportivo = document.getElementById("interacoesCarroEsportivo");
const interacoesCaminhao = document.getElementById("interacoesCaminhao");

// Funções para mostrar/esconder as informações dos veículos
function mostrarCarro() {
    esconderTodosVeiculos();
    veiculoSelecionado = meuCarro;
    document.getElementById("informacoesCarro").style.display = "block";
    imagemCarro.src = "img/carro.png";
    imagemCarro.alt = "Carro";
    imagemCarro.style.display = "block";
    exibirInformacoes();
    mostrarInteracoes();
}

function mostrarCarroEsportivo() {
    esconderTodosVeiculos();
    veiculoSelecionado = meuCarroEsportivo;
    document.getElementById("informacoesCarroEsportivo").style.display = "block";
    imagemCarro.src = "img/carroEsportivo.png";
    imagemCarro.alt = "Carro Esportivo";
    imagemCarro.style.display = "block";
    exibirInformacoes();
    mostrarInteracoes();
}

function mostrarCaminhao() {
    esconderTodosVeiculos();
    veiculoSelecionado = meuCaminhao;
    document.getElementById("informacoesCaminhao").style.display = "block";
    imagemCarro.src = "img/caminhao.png";
    imagemCarro.alt = "Caminhão";
    imagemCarro.style.display = "block";
    exibirInformacoes();
    mostrarInteracoes();
}

function esconderTodosVeiculos() {
    document.getElementById("informacoesCarro").style.display = "none";
    document.getElementById("informacoesCarroEsportivo").style.display = "none";
    document.getElementById("informacoesCaminhao").style.display = "none";
    imagemCarro.src = "";
    imagemCarro.alt = "";
    imagemCarro.style.display = "none";
    interacoesComuns.style.display = "none";
    interacoesCarroEsportivo.style.display = "none";
    interacoesCaminhao.style.display = "none";
    veiculoSelecionado = null;
}

function mostrarInteracoes() {
    interacoesComuns.style.display = "block";
    interacoesCarroEsportivo.style.display = (veiculoSelecionado instanceof CarroEsportivo) ? "block" : "none";
    interacoesCaminhao.style.display = (veiculoSelecionado instanceof Caminhao) ? "block" : "none";
}

//Função para voltar para a Garagem
function voltarParaGaragem() {
    esconderTodosVeiculos();
    opcoesGaragem.style.display = "flex";
    botaoAbrirGaragem.style.display = "block";
}

//Abre a garagem
botaoAbrirGaragem.addEventListener("click", function() {
    opcoesGaragem.style.display = opcoesGaragem.style.display === "flex" ? "none" : "flex";
    botaoAbrirGaragem.style.display = "none";
});

// Event listeners para os botões de escolha de veículo na garagem
const botoesEscolherVeiculo = document.querySelectorAll(".escolherVeiculo");
botoesEscolherVeiculo.forEach(botao => {
    botao.addEventListener("click", function() {
        const veiculo = this.dataset.veiculo;
        opcoesGaragem.style.display = "none";
        botaoAbrirGaragem.style.display = "none";
        switch (veiculo) {
            case "carro":
                mostrarCarro();
                break;
            case "carroEsportivo":
                mostrarCarroEsportivo();
                break;
            case "caminhao":
                mostrarCaminhao();
                break;
        }
    });
});

// Interação Genérica
function interagir(veiculo, acao) {
    if (veiculo && typeof veiculo[acao] === 'function') {
        const quantidadeCarga = parseInt(document.getElementById("quantidadeCarga").value);
        switch (acao) {
            case "ligar": // Trata o caso especial do método ligar
                veiculo.ligar();
                break;
            case "carregar":
            case "descarregar":
                veiculo[acao](quantidadeCarga);
                break;
            case "ativarTurbo":
                veiculo.ativarTurbo();
                break;
            default:
                veiculo[acao]();
        }
        exibirInformacoes();
    } else {
        console.log(`Ação "${acao}" não suportada para este veículo.`);
    }
}

// Event listeners para os botões de interação
const botoesInteragir = document.querySelectorAll(".interagir");
botoesInteragir.forEach(botao => {
    botao.addEventListener("click", function() {
        const acao = this.dataset.acao;
        interagir(veiculoSelecionado, acao);
    });
});

//Event Listener para o botão voltar para garagem
document.getElementById("voltarGaragem").addEventListener("click", function() {
    voltarParaGaragem();
});

// Função para exibir as informações do veículo selecionado
function exibirInformacoes() {
    if (veiculoSelecionado) {
        let infoDiv, modeloSpan, corSpan, velocidadeSpan, statusSpan;

        if (veiculoSelecionado instanceof Carro) {
            infoDiv = document.getElementById("informacoesCarro");
            modeloSpan = document.getElementById("modeloCarro");
            corSpan = document.getElementById("corCarro");
            velocidadeSpan = document.getElementById("velocidadeCarro");
            statusSpan = document.getElementById("statusCarro");
        } else if (veiculoSelecionado instanceof CarroEsportivo) {
            infoDiv = document.getElementById("informacoesCarroEsportivo");
            modeloSpan = document.getElementById("modeloCarroEsportivo");
            corSpan = document.getElementById("corCarroEsportivo");
            velocidadeSpan = document.getElementById("velocidadeCarroEsportivo");
            statusSpan = document.getElementById("statusCarroEsportivo");
            const turboSpan = document.getElementById("turboCarroEsportivo");
            turboSpan.textContent = veiculoSelecionado.turboAtivado ? "Ligado" : "Desligado";
        } else if (veiculoSelecionado instanceof Caminhao) {
            infoDiv = document.getElementById("informacoesCaminhao");
            modeloSpan = document.getElementById("modeloCaminhao");
            corSpan = document.getElementById("corCaminhao");
            velocidadeSpan = document.getElementById("velocidadeCaminhao");
            statusSpan = document.getElementById("statusCaminhao");
            const capacidadeCargaSpan = document.getElementById("capacidadeCargaCaminhao");
            const cargaAtualSpan = document.getElementById("cargaAtualCaminhao");
            capacidadeCargaSpan.textContent = veiculoSelecionado.capacidadeCarga;
            cargaAtualSpan.textContent = veiculoSelecionado.cargaAtual;
        }

        if (modeloSpan) modeloSpan.textContent = veiculoSelecionado.modelo;
        if (corSpan) corSpan.textContent = veiculoSelecionado.cor;
        if (velocidadeSpan) velocidadeSpan.textContent = veiculoSelecionado.velocidade;
        if (statusSpan) statusSpan.textContent = veiculoSelecionado.ligado ? "Ligado" : "Desligado";
    }
}

// Inicialização
esconderTodosVeiculos();    