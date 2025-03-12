// Classe Base: Veiculo
class Veiculo {
    constructor(modelo, cor) {
        this.modelo = modelo;
        this.cor = cor;
        this.ligado = false;
    }

    ligar() {
        this.ligado = true;
        console.log("Veículo ligado!");
        this.atualizarStatusNaTela();
    }

    desligar() {
        this.ligado = false;
        console.log("Veículo desligado!");
        this.atualizarStatusNaTela();
    }

    buzinar() {
        console.log("Bi bi!"); // Som genérico
    }

    atualizarStatusNaTela() {
        // Este método deve ser sobrescrito pelas classes filhas para atualizar o status específico
        // Se você precisar de um status genérico, pode implementá-lo aqui
    }
}

// Classe Carro que herda de Veiculo
class Carro extends Veiculo {
    constructor(modelo, cor) {
        super(modelo, cor);
        this.velocidade = 0;
        this.somAceleracao = document.getElementById("somAceleracao");
        this.somLigando = document.getElementById("somLigando");
        this.statusCarroElement = document.getElementById("statusCarro");
    }

    ligar() {
        super.ligar(); // Chama o método ligar da classe Veiculo
        this.somLigando.play();
        this.statusCarroElement.textContent = "Ligado";
    }

    desligar() {
        super.desligar(); // Chama o método desligar da classe Veiculo
        this.velocidade = 0;
        this.statusCarroElement.textContent = "Desligado";
        this.atualizarVelocidadeNaTela();
    }

    acelerar() {
        if (this.ligado) {
            this.velocidade += 10;
            this.somAceleracao.play();
            console.log(`Acelerando! Velocidade atual: ${this.velocidade} km/h`);
            this.atualizarVelocidadeNaTela();
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
            this.atualizarVelocidadeNaTela();
        } else {
            console.log("O carro precisa estar ligado para frear!");
        }
    }

    atualizarVelocidadeNaTela() {
        const velocidadeCarroElement = document.getElementById("velocidadeCarro");
        velocidadeCarroElement.textContent = this.velocidade;
    }

    atualizarStatusNaTela() {
        document.getElementById("statusCarro").textContent = this.ligado ? "Ligado" : "Desligado";
    }

    buzinar() {
        console.log("Fon fon!");
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
            this.turboAtivado = true;
            this.somTurbo.play();
            this.acelerarTurbo();
            this.atualizarTurboNaTela();
            console.log("Turbo ativado!");
        } else {
            console.log("O carro precisa estar ligado para ativar o turbo!");
        }
    }

    desativarTurbo() {
        this.turboAtivado = false;
        this.atualizarTurboNaTela();
        console.log("Turbo desativado!");
    }

    acelerarTurbo() {
        if (this.ligado && this.turboAtivado) {
            this.velocidade += 50;
            this.somAceleracao.play(); // Reutiliza o som de aceleração
            console.log(`Acelerando com Turbo! Velocidade atual: ${this.velocidade} km/h`);
            this.atualizarVelocidadeNaTela();
        } else {
            this.acelerar(); // Se não estiver ligado ou turbo desativado, usa a aceleração normal.
        }
    }

    frear() {
      if (this.ligado) {
          this.velocidade -= 10;
          if (this.velocidade < 0) {
              this.velocidade = 0;
          }
          console.log(`Freando! Velocidade atual: ${this.velocidade} km/h`);
          this.atualizarVelocidadeNaTela();
      } else {
          console.log("O carro precisa estar ligado para frear!");
      }
  }

    atualizarTurboNaTela() {
        document.getElementById("turboCarroEsportivo").textContent = this.turboAtivado ? "Ligado" : "Desligado";
    }

    atualizarVelocidadeNaTela() {
        const velocidadeCarroEsportivoElement = document.getElementById("velocidadeCarroEsportivo");
        velocidadeCarroEsportivoElement.textContent = this.velocidade;
    }

    atualizarStatusNaTela() {
        document.getElementById("statusCarroEsportivo").textContent = this.ligado ? "Ligado" : "Desligado";
    }

    buzinar() {
        console.log("Vrum vrum!");
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
                this.atualizarCargaNaTela();
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
                this.atualizarCargaNaTela();
            } else {
                console.log("Não é possível descarregar mais do que a carga atual!");
            }
        }else{
            console.log("O caminhão precisa estar ligado para descarregar!");
        }
    }

    frear() {
        if (this.ligado) {
            this.velocidade -= 10;
            if (this.velocidade < 0) {
                this.velocidade = 0;
            }
            console.log(`Freando! Velocidade atual: ${this.velocidade} km/h`);
            this.atualizarVelocidadeNaTela();
        } else {
            console.log("O carro precisa estar ligado para frear!");
        }
    }

    atualizarCargaNaTela() {
        document.getElementById("capacidadeCargaCaminhao").textContent = this.capacidadeCarga;
        document.getElementById("cargaAtualCaminhao").textContent = this.cargaAtual;
    }

    atualizarVelocidadeNaTela() {
        const velocidadeCaminhaoElement = document.getElementById("velocidadeCaminhao");
        velocidadeCaminhaoElement.textContent = this.velocidade;
    }

    atualizarStatusNaTela() {
        document.getElementById("statusCaminhao").textContent = this.ligado ? "Ligado" : "Desligado";
    }

    buzinar() {
        console.log("Fom fom!");
    }
}

// Criando objetos
const meuCarro = new Carro("Sedan", "Prata");
const meuCarroEsportivo = new CarroEsportivo("Ferrari", "Vermelha");
const meuCaminhao = new Caminhao("Volvo", "Azul", 10000);

// Funções para mostrar/esconder as informações
function mostrarCarro() {
    document.getElementById("informacoesCarro").style.display = "block";
    document.getElementById("informacoesCarroEsportivo").style.display = "none";
    document.getElementById("informacoesCaminhao").style.display = "none";
    document.getElementById("imagemCarro").src = "img/carro.png"; //  adicione a imagem correspondente
}

function mostrarCarroEsportivo() {
    document.getElementById("informacoesCarro").style.display = "none";
    document.getElementById("informacoesCarroEsportivo").style.display = "block";
    document.getElementById("informacoesCaminhao").style.display = "none";
    document.getElementById("imagemCarro").src = "img/carroEsportivo.png"; // Adicione a imagem correspondente
}

function mostrarCaminhao() {
    document.getElementById("informacoesCarro").style.display = "none";
    document.getElementById("informacoesCarroEsportivo").style.display = "none";
    document.getElementById("informacoesCaminhao").style.display = "block";
    document.getElementById("imagemCarro").src = "img/caminhao.png"; // Adicione a imagem correspondente
}

// Event listeners para os botões de mostrar
document.getElementById("mostrarCarro").addEventListener("click", mostrarCarro);
document.getElementById("mostrarCarroEsportivo").addEventListener("click", mostrarCarroEsportivo);
document.getElementById("mostrarCaminhao").addEventListener("click", mostrarCaminhao);

// Preenchendo as informações iniciais
mostrarCarro();

// Eventos dos botões (Carro Comum)
const botaoLigarDesligar = document.getElementById("ligarDesligar");
const botaoAcelerar = document.getElementById("acelerar");
const botaoFrear = document.getElementById("frear");

botaoLigarDesligar.addEventListener("click", function () {
    if (meuCarro.ligado) {
        meuCarro.desligar();
        botaoLigarDesligar.textContent = "Ligar";
    } else {
        meuCarro.ligar();
        botaoLigarDesligar.textContent = "Desligar";
    }
});

botaoAcelerar.addEventListener("click", function () {
    meuCarro.acelerar();
});

botaoFrear.addEventListener("click", function () {
    meuCarro.frear();
});


// Eventos dos botões (Carro Esportivo)
const botaoLigarDesligarEsportivo = document.getElementById("ligarDesligarCarroEsportivo");
const botaoAcelerarEsportivo = document.getElementById("acelerarCarroEsportivo");
const botaoFrearEsportivo = document.getElementById("frearCarroEsportivo");
const botaoTurbo = document.getElementById("ativarTurbo");
const botaoDesativarTurbo = document.getElementById("desativarTurbo");
const botaoBuzinarEsportivo = document.getElementById("buzinarCarroEsportivo");

botaoLigarDesligarEsportivo.addEventListener("click", function () {
    if (meuCarroEsportivo.ligado) {
        meuCarroEsportivo.desligar();
        botaoLigarDesligarEsportivo.textContent = "Ligar";
    } else {
        meuCarroEsportivo.ligar();
        botaoLigarDesligarEsportivo.textContent = "Desligar";
    }
});

botaoAcelerarEsportivo.addEventListener("click", function () {
    meuCarroEsportivo.acelerar();
});

botaoFrearEsportivo.addEventListener("click", function () {
    meuCarroEsportivo.frear();
});

botaoTurbo.addEventListener("click", function () {
    meuCarroEsportivo.ativarTurbo();
});

botaoDesativarTurbo.addEventListener("click", function () {
    meuCarroEsportivo.desativarTurbo();
});

botaoBuzinarEsportivo.addEventListener("click", function () {
    meuCarroEsportivo.buzinar();
});


// Eventos dos botões (Caminhão)
const botaoLigarDesligarCaminhao = document.getElementById("ligarDesligarCaminhao");
const botaoAcelerarCaminhao = document.getElementById("acelerarCaminhao");
const botaoFrearCaminhao = document.getElementById("frearCaminhao");
const botaoCarregar = document.getElementById("carregarCaminhao");
const botaoDescarregar = document.getElementById("descarregarCaminhao");
const botaoBuzinarCaminhao = document.getElementById("buzinarCaminhao");

botaoLigarDesligarCaminhao.addEventListener("click", function () {
    if (meuCaminhao.ligado) {
        meuCaminhao.desligar();
        botaoLigarDesligarCaminhao.textContent = "Ligar";
    } else {
        meuCaminhao.ligar();
        botaoLigarDesligarCaminhao.textContent = "Desligar";
    }
});

botaoAcelerarCaminhao.addEventListener("click", function () {
    meuCaminhao.acelerar();
});

botaoFrearCaminhao.addEventListener("click", function () {
    meuCaminhao.frear();
});

botaoCarregar.addEventListener("click", function () {
    const quantidade = parseInt(document.getElementById("quantidadeCarga").value);
    meuCaminhao.carregar(quantidade);
});

botaoDescarregar.addEventListener("click", function () {
    const quantidade = parseInt(document.getElementById("quantidadeCarga").value);
    meuCaminhao.descarregar(quantidade);
});

botaoBuzinarCaminhao.addEventListener("click", function () {
    meuCaminhao.buzinar();
});