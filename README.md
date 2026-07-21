# Voice-Driven Budgeting API

Uma API REST desenvolvida em **Java + Spring Boot** para gerenciamento de transações financeiras pessoais utilizando **Inteligência Artificial**, **Processamento de Linguagem Natural (NLP)** e **comandos de voz**.

---

## Visão Geral

O projeto foi desenvolvido seguindo uma arquitetura modular, integrando modelos de IA para automatizar todo o fluxo de entrada de dados financeiros.

O pipeline permite que o usuário registre movimentações financeiras apenas falando, enquanto a aplicação é responsável por:

- Transcrever o áudio enviado.
- Interpretar a intenção do usuário utilizando LLMs.
- Executar automaticamente as regras de negócio.
- Retornar uma confirmação por voz da operação realizada.

---

# Pipeline de Inteligência Artificial

O processamento ocorre de forma assíncrona em três etapas principais:

### 1. Transcrição
- Conversão de arquivos de áudio (`.m4a`) em texto.
- Utilização do modelo **OpenAI Whisper**.

### 2. Orquestração e Processamento
- Integração com **GPT-4o** através do **Spring AI**.
- Utilização de **Tool Calling** para converter intenções do usuário em chamadas para funções Java.
- Execução dinâmica das regras de negócio.

### 3. Síntese de Voz
- Geração de respostas utilizando modelos **Text-to-Speech (TTS)**.
- Confirmação audível das operações executadas.

---

# Stack Tecnológica

| Tecnologia | Descrição |
|------------|-----------|
| Java 17 | Linguagem principal |
| Spring Boot 3.2.5 | Framework backend |
| Spring AI 1.0.0-M1 | Integração com modelos de IA |
| MySQL | Banco de dados |
| Docker Compose | Infraestrutura do banco |
| Gradle | Gerenciamento de dependências |

---

# Configuração e Execução

## Pré-requisitos

Antes de executar o projeto, certifique-se de possuir:

- Java JDK 17 ou superior
- Docker
- Docker Compose
- Uma API Key da OpenAI

---

## Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto (não versionado):

```properties
OPENAI_API_KEY=sua_chave_aqui
```

---

## Inicialização

### 1. Carregar as variáveis de ambiente (PowerShell)

```powershell
Get-Content .env | Where-Object { $_.Trim() -ne '' } | Foreach-Object {
    $var = $_.Split('=', 2)
    [Environment]::SetEnvironmentVariable($var[0].Trim(), $var[1].Trim(), "Process")
}
```

### 2. Executar a aplicação

```bash
./gradlew bootRun
```

---

# Arquitetura

O projeto segue princípios de **Clean Architecture**, promovendo separação de responsabilidades entre as camadas.

```
src
├── application
│   ├── Use Cases
│   └── Functions (Spring AI)
│
├── domain
│   ├── Entities
│   └── Repository Contracts
│
└── infrastructure
    ├── Controllers
    ├── Persistence
    └── Configurations
```

### Application
Responsável pelos **casos de uso** da aplicação e pelas implementações da interface `Function`, permitindo que a IA interaja diretamente com as regras de negócio.

### Domain
Contém as **entidades** e os **contratos de repositório**, representando o núcleo da aplicação.

### Infrastructure
Implementa os adaptadores externos, incluindo:

- Controllers REST
- Persistência de dados
- Configurações
- Integrações

---

# Funcionalidades

- Cadastro de transações via voz
- Transcrição automática com Whisper
- Interpretação de comandos utilizando GPT-4o
- Tool Calling com Spring AI
- Persistência em MySQL
- Resposta por voz utilizando TTS

---

# Roadmap

- [ ] Implementar testes unitários.
- [ ] Desenvolver interface Web utilizando Web Audio API.
- [ ] Suporte a múltiplas moedas.
- [ ] Histórico de conversas.
- [ ] Dashboard financeiro.
- [ ] Autenticação de usuários.
- [ ] Deploy em ambiente cloud.

---

# Este projeto foi desenvolvido para fins de estudo e experimentação com Inteligência Artificial aplicada a sistemas backend.
