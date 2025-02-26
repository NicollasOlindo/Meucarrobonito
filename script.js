class Carro {
    constructor(modelo, cor) {
        this.modelo = modelo;
        this.cor = cor;
        this.velocidade = 0;
        this.ligado = false;
        this.somAceleracao = document.getElementById("somAceleracao");
        this.somLigando = document.getElementById("somLigando");
        this.statusCarroElement = document.getElementById("statusCarro"); // Nova linha
    }

    // Métodos do Carro
    ligar() {
        this.ligado = true;
        this.somLigando.play();
        this.statusCarroElement.textContent = "Ligado"; // Nova linha
        console.log("Carro ligado!");
    }

    desligar() {
        this.ligado = false;
        this.statusCarroElement.textContent = "Desligado"; // Nova linha
        console.log("Carro desligado!");
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

    atualizarVelocidadeNaTela() {
        const velocidadeCarroElement = document.getElementById("velocidadeCarro");
        velocidadeCarroElement.textContent = this.velocidade;
    }
}

// Criando um objeto Carro
const meuCarro = new Carro("Sedan", "Prata");

// Preenchendo as informações do carro na tela
document.getElementById("modeloCarro").textContent = meuCarro.modelo;
document.getElementById("corCarro").textContent = meuCarro.cor;

// Eventos dos botões
const botaoLigarDesligar = document.getElementById("ligarDesligar");
botaoLigarDesligar.addEventListener("click", function() {
    if (meuCarro.ligado) {
        meuCarro.desligar();
        botaoLigarDesligar.textContent = "Ligar";
    } else {
        meuCarro.ligar();
        botaoLigarDesligar.textContent = "Desligar";
    }
});

const botaoAcelerar = document.getElementById("acelerar");
botaoAcelerar.addEventListener("click", function() {
    meuCarro.acelerar();
});