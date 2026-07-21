# Voice-Driven Budgeting API

Uma API REST desenvolvida em **Java + Spring Boot** para gerenciamento de transações financeiras pessoais utilizando **Inteligência Artificial**, **Processamento de Linguagem Natural (NLP)** e **comandos de voz**.

---

## Visão Geral

O projeto foi desenvolvido seguindo uma arquitetura modular, integrando modelos de IA para automatizar todo o fluxo de entrada de dados financeiros.

O pipeline permite que o usuário registre movimentações financeiras apenas falando, enquanto a aplicação é responsável por:

- Transcrever o áudio enviado;
- Interpretar a intenção do usuário utilizando LLMs;
- Executar automaticamente as regras de negócio com validações de segurança;
- Retornar uma confirmação por voz da operação realizada.

---

## Pipeline de Inteligência Artificial

O processamento ocorre de forma assíncrona em três etapas principais.

### 1. Transcrição

- Conversão de arquivos de áudio em texto.
- Utilização do modelo **OpenAI Whisper**.

### 2. Orquestração e Processamento

- Integração com **GPT-4o** através do **Spring AI**.
- Utilização de **Tool Calling** para converter intenções do usuário em chamadas para funções Java (como persistência e cálculo de totais por categoria).
- Execução dinâmica das regras de negócio protegidas por cláusulas de guarda.

### 3. Síntese de Voz

- Geração de respostas utilizando modelos **Text-to-Speech (TTS)**.
- Confirmação audível das operações executadas.

---

## Stack Tecnológica

| Tecnologia | Descrição |
|------------|-----------|
| Java 17 | Linguagem principal |
| Spring Boot 3.2.5 | Framework backend |
| Spring AI 1.0.0-M1 | Integração com modelos de IA |
| JUnit 5 & Mockito | Testes unitários e mocks |
| MySQL | Banco de dados |
| Docker Compose | Infraestrutura do banco |
| Gradle | Gerenciamento de dependências |

---

## Configuração e Execução

### Pré-requisitos

Antes de executar o projeto, certifique-se de possuir:

- Java JDK 17 ou superior;
- Docker;
- Docker Compose;
- Uma API Key da OpenAI.

### Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto (não versionado):

```env
OPENAI_API_KEY=sua_chave_aqui
```

### Inicialização

#### 1. Carregar as variáveis de ambiente (PowerShell)

```powershell
Get-Content .env | Where-Object { $_.Trim() -ne '' } | Foreach-Object {
    $var = $_.Split('=', 2)
    [Environment]::SetEnvironmentVariable($var[0].Trim(), $var[1].Trim(), "Process")
}
```

#### 2. Executar a aplicação

```bash
./gradlew bootRun
```

#### 3. Executar os testes automatizados

```bash
./gradlew test
```

---

## Arquitetura

O projeto segue princípios de **Clean Architecture**, promovendo separação de responsabilidades entre as camadas.

```text
src
├── application
│   ├── usecases
│   └── functions
│
├── domain
│   ├── entities
│   └── repositories
│
└── infrastructure
    ├── controllers
    ├── persistence
    └── configurations
```

### Application

Responsável pelos casos de uso da aplicação, validações de regras de negócio (cláusulas de guarda) e pelas implementações da interface `Function`, permitindo que a IA interaja diretamente com as operações do sistema.

### Domain

Contém as entidades e os contratos de repositório, representando o núcleo da aplicação.

### Infrastructure

Implementa os adaptadores externos, incluindo:

- Controllers REST com suporte a CORS;
- Persistência de dados utilizando Spring Data JPA;
- Configurações e integrações com serviços externos.

---

## Funcionalidades Implementadas

- Cadastro e persistência de transações via voz protegidos por regras de validação (impedindo valores zerados ou negativos);
- Consulta de totais por categoria utilizando **Tool Calling**;
- Transcrição automática utilizando **Whisper**;
- Interpretação de comandos utilizando **GPT-4o**;
- Persistência em **MySQL**;
- Resposta por voz utilizando **Text-to-Speech (TTS)**;
- Cobertura de testes unitários com **JUnit** e **Mockito** para os casos de uso críticos.

---

## Roadmap

- [x] Implementar testes unitários.
- [ ] Desenvolver interface Web utilizando Web Audio API (Next.js).
- [ ] Suporte a múltiplas moedas.
- [ ] Histórico de conversas.
- [ ] Dashboard financeiro.
- [ ] Autenticação de usuários.
- [ ] Deploy em ambiente cloud.

---

## Observações

Este projeto foi desenvolvido para fins de estudo e experimentação com Inteligência Artificial aplicada a sistemas backend.
