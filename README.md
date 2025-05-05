# Bom Dia Gabriel! 🏀⚾🏈

Um bot que consulta resultados de jogos das principais ligas esportivas americanas (NBA, MLB e NFL) e gera um resumo personalizado usando IA.

## 🚀 Funcionalidades

- Consulta automática de resultados de jogos da NBA, MLB e NFL
- Análise dos jogos de ontem e hoje
- Geração de resumo personalizado usando o Gemini AI
- Formato de mensagem amigável e conversacional

## 📋 Pré-requisitos

- Node.js (versão 14 ou superior)
- npm ou yarn
- Chave de API do Google Gemini

## 🔧 Instalação

1. Clone o repositório:
```bash
git clone https://github.com/seu-usuario/bom-dia-gabriel.git
cd bom-dia-gabriel
```

2. Instale as dependências:
```bash
npm install
# ou
yarn install
```

3. Crie um arquivo `.env` na raiz do projeto e adicione sua chave da API do Gemini:
```env
GEMINI_API_KEY=sua_chave_aqui
```

## 🎮 Como Usar

Execute o script com:
```bash
node index.js
```

O script irá:
1. Consultar as APIs da ESPN para obter os resultados dos jogos
2. Processar os dados usando o Gemini AI
3. Gerar um resumo personalizado dos jogos

## 📦 Dependências

- `@google/genai`: Para integração com a API do Gemini
- `dotenv`: Para gerenciamento de variáveis de ambiente
- `node-fetch`: Para requisições HTTP

## 📝 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 🙏 Agradecimentos

- ESPN por fornecer as APIs de dados esportivos
- Google por disponibilizar o Gemini AI 