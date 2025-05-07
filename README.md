# Garagem Inteligente Unificada 🚗💨

## Visão Geral

A "Garagem Inteligente Unificada" é uma aplicação web simulada para gerenciar uma coleção de veículos. Ela permite adicionar diferentes tipos de veículos (carros comuns, esportivos e caminhões), interagir com suas funcionalidades específicas (ligar, acelerar, usar turbo, carregar carga) e gerenciar o histórico de manutenção de cada um.

Este projeto foi desenvolvido como parte da disciplina de **[Nome da Sua Disciplina/Matéria]** do curso de **[Nome do Seu Curso ou Formação]** em **[Nome da Sua Instituição de Ensino]**. O objetivo principal desta etapa ("Missão Validação Final") é consolidar e verificar a qualidade da aplicação após a organização do código e documentação, garantindo sua funcionalidade e estabilidade.

## Funcionalidades Principais ✨

*   **Gerenciamento de Veículos:**
    *   Adicionar Carros Comuns, Carros Esportivos e Caminhões à garagem.
    *   Visualizar a lista de veículos existentes na garagem.
    *   Remover veículos da garagem com confirmação.
*   **Interação Polimórfica com Veículos:**
    *   Ligar e desligar motores (com feedback visual e sonoro).
    *   Acelerar e frear (com feedback visual e sonoro).
    *   Buzinar (com sons específicos por tipo de veículo).
    *   **Carro Esportivo:** Ativar e desativar o modo turbo para aceleração aprimorada (com feedback visual e sonoro).
    *   **Caminhão:** Carregar e descarregar carga, com validação de capacidade e impacto no desempenho (aceleração/frenagem).
*   **Gerenciamento de Manutenção:**
    *   Registrar serviços de manutenção realizados (com data, hora, tipo de serviço, custo e descrição opcional).
    *   Visualizar o histórico de manutenções passadas de um veículo.
    *   Agendar manutenções futuras.
    *   Remover registros de manutenção (passados ou futuros) individualmente.
    *   Alertas visuais para agendamentos próximos (hoje/amanhã) ao carregar a aplicação.
*   **Persistência de Dados:**
    *   Todos os dados da garagem (veículos, seus estados e histórico de manutenções) são salvos no LocalStorage do navegador, persistindo entre sessões.
*   **Detalhes Extras (Simulado via API local):**
    *   Busca e exibição de informações adicionais simuladas para cada veículo (ex: Valor FIPE, recalls pendentes, dicas de manutenção) a partir de um arquivo `dados_veiculos_api.json` local.

## Como Executar Localmente 🚀

1.  **Clone o repositório (ou baixe o ZIP e extraia):**
    ```bash
    git clone [https://github.com/NicollasOlindo/Meucarrobonito.git]
    ```
    (Se você ainda não usa Git ou GitHub, simplesmente baixe os arquivos do projeto para uma pasta no seu computador).

2.  **Navegue até a pasta do projeto:**
    ```bash
    cd [Meucarrobonito]
    ```
    (Ou, se baixou o ZIP, navegue até a pasta onde extraiu os arquivos).

3.  **Abra o arquivo `index.html` no seu navegador web de preferência** (Google Chrome, Firefox, Edge, etc.).
    *   Não é necessário um servidor web para este projeto, ele pode ser executado diretamente do sistema de arquivos.
    *   *Opcional:* Se você utiliza o Visual Studio Code, pode usar a extensão "Live Server" para uma melhor experiência de desenvolvimento com recarregamento automático.

## Estrutura do Projeto 📂

A estrutura de arquivos do projeto está organizada da seguinte forma (idealmente, após a separação das classes):
.
├── index.html # Arquivo principal da interface do usuário (HTML)
├── style.css # Folha de estilos principal (CSS)
├── script.js # Script principal contendo toda a lógica JavaScript e classes
│ # (Idealmente, seria dividido conforme abaixo)
├── js/ # (Pasta para scripts, idealmente)
│ ├── classes/ # (Pasta para as classes separadas)
│ │ ├── Manutencao.js
│ │ ├── Veiculo.js
│ │ ├── Carro.js
│ │ ├── CarroEsportivo.js
│ │ └── Caminhao.js
│ ├── app.js # (Script principal para UI e eventos, se classes separadas)
│ └── api.js # (Função de busca da API simulada, se separada)
├── img/ # Pasta contendo as imagens dos veículos
│ ├── carro.png
│ ├── carroEsportivo.png
│ └── caminhao.png
├── som/ # Pasta contendo os arquivos de áudio
│ ├── buzinaCarro.mp3
│ ├── buzinaCaminhao.mp3
│ ├── buzinaEsportivo.mp3
│ ├── carroAcelerando.mp3
│ ├── carroLigando.mp3
│ └── turbo.mp3
├── dados_veiculos_api.json # Arquivo JSON para simular a API de detalhes extras
└── README.md # Este arquivo de documentação
*(Nota: Conforme a "Missão Documentação Inteligente", o ideal é que as classes JavaScript (`Veiculo`, `Carro`, etc.) residam em arquivos `.js` separados dentro da pasta `js/classes/`. Atualmente, todo o código JavaScript está consolidado em `script.js` para esta etapa de validação.)*

## Tecnologias Utilizadas 🛠️

*   **HTML5:** Para a estrutura da página web.
*   **CSS3:** Para a estilização e layout da interface.
    *   Utilização de Variáveis CSS para um tema consistente.
    *   Design Responsivo para adaptação a diferentes tamanhos de tela.
*   **JavaScript (ES6+):** Para toda a lógica da aplicação, incluindo:
    *   Programação Orientada a Objetos (Classes, Herança, Polimorfismo).
    *   Manipulação do DOM (Document Object Model) para interatividade.
    *   Gerenciamento de Eventos.
    *   Consumo de API simulada (Fetch API para arquivo JSON local).
*   **JSDoc:** Para a documentação do código JavaScript (classes e métodos).
*   **LocalStorage API:** Para persistência dos dados da garagem no navegador do usuário.
*   **Git & GitHub:** Para versionamento do código e hospedagem do repositório (substitua se não estiver usando).

## Autor 👤

*   **[Seu Nome Completo]** - ([nicollasgsantos2@gmail.com]) - [Link para seu GitHub, se tiver, ex: https://github.com/NicollasOlindo]

---

Este `README.md` foi preparado para a "Missão Validação Final".