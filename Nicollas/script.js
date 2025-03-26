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
        this.botaoLigarDesligar = document.getElementById("ligarDesligar"); // Captura o botão
        this.atualizarCorBotao();
    }

    ligar() {
        super.ligar(); // Chama o método ligar da classe Veiculo
        this.somLigando.play();
        this.statusCarroElement.textContent = "Ligado";
        this.botaoLigarDesligar.textContent = "Desligar";
        this.atualizarCorBotao(); // Atualiza a cor do botão
    }

    desligar() {
        super.desligar(); // Chama o método desligar da classe Veiculo
        this.velocidade = 0;
        this.statusCarroElement.textContent = "Desligado";
        this.botaoLigarDesligar.textContent = "Ligar";
        this.atualizarCorBotao(); // Atualiza a cor do botão
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
        const somBuzinaCarro = document.getElementById("somBuzinaCarro");
        somBuzinaCarro.play();
        console.log("Fon fon!");
    }

    atualizarCorBotao() {
        if (this.ligado) {
            this.botaoLigarDesligar.classList.remove("desligado");
            this.botaoLigarDesligar.classList.add("ligado");
        } else {
            this.botaoLigarDesligar.classList.remove("ligado");
            this.botaoLigarDesligar.classList.add("desligado");
        }
    }
}

// Classe CarroEsportivo que herda de Carro
class CarroEsportivo extends Carro {
    constructor(modelo, cor) {
        super(modelo, cor);
        this.turboAtivado = false;
        this.somTurbo = document.getElementById("somTurbo");
        this.botaoLigarDesligar = document.getElementById("ligarDesligarCarroEsportivo"); // Captura o botão
        this.atualizarCorBotao();
    }

    ligar() {
        super.ligar(); // Chama o método ligar da classe Veiculo
        this.botaoLigarDesligar.textContent = "Desligar";
        this.atualizarCorBotao(); // Atualiza a cor do botão
    }

    desligar() {
        super.desligar(); // Chama o método desligar da classe Veiculo
        this.botaoLigarDesligar.textContent = "Ligar";
        this.atualizarCorBotao(); // Atualiza a cor do botão
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
      const somBuzinaEsportivo = document.getElementById("somBuzinaEsportivo");
      somBuzinaEsportivo.play();
        console.log("Vrum vrum!");
    }

    atualizarCorBotao() {
        if (this.ligado) {
            this.botaoLigarDesligar.classList.remove("desligado");
            this.botaoLigarDesligar.classList.add("ligado");
        } else {
            this.botaoLigarDesligar.classList.remove("ligado");
            this.botaoLigarDesligar.classList.add("desligado");
        }
    }
}

// Classe Caminhao que herda de Carro
class Caminhao extends Carro {
    constructor(modelo, cor) {
        super(modelo, cor);
        this.turboAtivado = false;
        this.somTurbo = document.getElementById("somTurbo");
        this.botaoLigarDesligar = document.getElementById("ligarDesligarCaminhao"); // Captura o botão
        this.atualizarCorBotao();
    }

    ligar() {
        super.ligar(); // Chama o método ligar da classe Veiculo
        this.botaoLigarDesligar.textContent = "Desligar";
        this.atualizarCorBotao(); // Atualiza a cor do botão
    }

    desligar() {
        super.desligar(); // Chama o método desligar da classe Veiculo
        this.botaoLigarDesligar.textContent = "Ligar";
        this.atualizarCorBotao(); // Atualiza a cor do botão
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
      const somBuzinaEsportivo = document.getElementById("somBuzinaEsportivo");
      somBuzinaEsportivo.play();
        console.log("Vrum vrum!");
    }

    atualizarCorBotao() {
        if (this.ligado) {
            this.botaoLigarDesligar.classList.remove("desligado");
            this.botaoLigarDesligar.classList.add("ligado");
        } else {
            this.botaoLigarDesligar.classList.remove("ligado");
            this.botaoLigarDesligar.classList.add("desligado");
        }
    }
}


// Criando objetos
const meuCarro = new Carro("Sedan", "Prata");
const meuCarroEsportivo = new CarroEsportivo("Ferrari", "Vermelha");
const meuCaminhao = new Caminhao("Volvo", "Azul");


// **Funções de Controle de Tela**
function mostrarMenuPrincipal() {
    document.getElementById("menuPrincipal").style.display = "block";
    document.getElementById("garagem").style.display = "none";
    document.getElementById("informacoesCarro").style.display = "none";
    document.getElementById("informacoesCarroEsportivo").style.display = "none";
    document.getElementById("informacoesCaminhao").style.display = "none";
}

function mostrarGaragem() {
    document.getElementById("menuPrincipal").style.display = "none";
    document.getElementById("garagem").style.display = "block";
    document.getElementById("informacoesCarro").style.display = "none";
    document.getElementById("informacoesCarroEsportivo").style.display = "none";
    document.getElementById("informacoesCaminhao").style.display = "none";
}

function mostrarCarroComum() {
    document.getElementById("garagem").style.display = "none";
    document.getElementById("informacoesCarro").style.display = "block";
    document.getElementById("informacoesCarroEsportivo").style.display = "none";
    document.getElementById("informacoesCaminhao").style.display = "none";

     // Preenche as informações do carro na tela
     document.getElementById("modeloCarro").textContent = meuCarro.modelo;
     document.getElementById("corCarro").textContent = meuCarro.cor;
}

function mostrarCarroEsportivo() {
    document.getElementById("garagem").style.display = "none";
    document.getElementById("informacoesCarro").style.display = "none";
    document.getElementById("informacoesCarroEsportivo").style.display = "block";
    document.getElementById("informacoesCaminhao").style.display = "none";
    
     // Preenche as informações do carro esportivo na tela
     document.getElementById("modeloCarroEsportivo").textContent = meuCarroEsportivo.modelo;
     document.getElementById("corCarroEsportivo").textContent = meuCarroEsportivo.cor;
}

function mostrarCaminhao() {
    document.getElementById("garagem").style.display = "none";
    document.getElementById("informacoesCarro").style.display = "none";
    document.getElementById("informacoesCarroEsportivo").style.display = "none";
    document.getElementById("informacoesCaminhao").style.display = "block";
    
    // Preenche as informações do caminhão na tela
    document.getElementById("modeloCaminhao").textContent = meuCaminhao.modelo;
    document.getElementById("corCaminhao").textContent = meuCaminhao.cor;
}

// **Event Listeners dos Botões do Menu**
document.getElementById("botaoGaragem").addEventListener("click", mostrarGaragem);
document.getElementById("voltarParaMenu").addEventListener("click", mostrarMenuPrincipal);

// **Event Listeners dos Botões da Garagem**
document.getElementById("escolherCarro").addEventListener("click", mostrarCarroComum);
document.getElementById("escolherCarroEsportivo").addEventListener("click", mostrarCarroEsportivo);
document.getElementById("escolherCaminhao").addEventListener("click", mostrarCaminhao);

// **Event Listeners dos Botões "Voltar para Garagem"**
document.getElementById("voltarParaGaragemCarro").addEventListener("click", mostrarGaragem);
document.getElementById("voltarParaGaragemEsportivo").addEventListener("click", mostrarGaragem);
document.getElementById("voltarParaGaragemCaminhao").addEventListener("click", mostrarGaragem);

// Eventos dos botões (Carro Comum)
const botaoLigarDesligar = document.getElementById("ligarDesligar");
const botaoAcelerar = document.getElementById("acelerar");
const botaoFrear = document.getElementById("frear");
const botaoBuzinar = document.getElementById("buzinarCarro"); // Captura o botão de buzinar

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

// Adiciona o evento de clique para o botão de buzinar
botaoBuzinar.addEventListener("click", function() {
    meuCarro.buzinar(); // Chama a função buzinar do carro comum
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

// Eventos dos botões (Caminhão)
const botaoLigarDesligarCaminhao2 = document.getElementById("ligarDesligarCaminhao");
const botaoAcelerarCaminhao2 = document.getElementById("acelerarCaminhao");
const botaoFrearCaminhao2 = document.getElementById("frearCaminhao");
const botaoCarregar2 = document.getElementById("carregarCaminhao");
const botaoDescarregar2 = document.getElementById("descarregarCaminhao");
const botaoBuzinarCaminhao2 = document.getElementById("buzinarCaminhao");

botaoLigarDesligarCaminhao2.addEventListener("click", function () {
    if (meuCaminhao.ligado) {
        meuCaminhao.desligar();
        botaoLigarDesligarCaminhao2.textContent = "Ligar";
    } else {
        meuCaminhao.ligar();
        botaoLigarDesligarCaminhao2.textContent = "Desligar";
    }
});

botaoAcelerarCaminhao2.addEventListener("click", function () {
    meuCaminhao.acelerar();
});

botaoFrearCaminhao2.addEventListener("click", function () {
    meuCaminhao.frear();
});

function atualizarCorBotao() {
    if (this.ligado) {
        this.botaoLigarDesligar.classList.remove("desligado");
        this.botaoLigarDesligar.classList.add("ligado");
    } else {
        this.botaoLigarDesligar.classList.remove("ligado");
        this.botaoLigarDesligar.classList.add("desligado");
    }
}

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

// Inicialização: Mostrar o menu principal ao carregar a página
mostrarMenuPrincipal();