#!/usr/bin/env node
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

// URLs corretas para as APIs (corrigindo os caminhos para NFL e NBA)
const apiUrls = {
    mlb: "https://site.api.espn.com/apis/site/v2/sports/baseball/mlb/scoreboard",
    nfl: "https://site.api.espn.com/apis/site/v2/sports/football/nfl/scoreboard",
    nba: "https://site.api.espn.com/apis/site/v2/sports/basketball/nba/scoreboard"
};

// Função para formatar a data no formato YYYYMMDD necessário para a API
function formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}${month}${day}`;
}

// Função para obter dados de uma API com base na data
async function fetchApiData(sportType, dateStr) {
    const url = `${apiUrls[sportType]}?dates=${dateStr}`;

    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Erro HTTP: ${response.status}`);
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error(`Erro ao buscar dados da API ${sportType}:`, error);
        return null;
    }
}

// Função principal para executar todas as consultas
async function fetchAllSportsData() {
    const results = {
        hoje: {},
        ontem: {},
        mensagem: ''
    };

    // Obter data atual e data de ontem
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const todayStr = formatDate(today);
    const yesterdayStr = formatDate(yesterday);

    // Array com todos os esportes para iterar
    const sports = ['mlb', 'nfl', 'nba'];

    // Buscar dados para o dia atual
    for (const sport of sports) {
        const data = await fetchApiData(sport, todayStr);
        results.hoje[sport] = data;
    }

    // Buscar dados para o dia anterior
    for (const sport of sports) {
        const data = await fetchApiData(sport, yesterdayStr);
        results.ontem[sport] = data;
    }

    return results;
}

// Função para enviar dados para a API do Gemini
async function sendToGemini(data) {
    try {
        const ai = new GoogleGenAI({
            apiKey: process.env.GEMINI_API_KEY
        });

        const config = {
            responseMimeType: 'text/plain',
        };

        if (!process.env.GEMINI_API_KEY) {
            return "Erro: GEMINI_API_KEY não encontrada nas variáveis de ambiente";
        }

        const model = 'gemini-2.5-flash-preview-04-17';

        const contents = [{
            role: 'user',
            parts: [{
                text: `
                    Olá! Por favor, analise os dados brutos de resultados de jogos fornecidos abaixo. Esses dados estão separados por "HOJE" e "ONTEM" e contêm informações da MLB, NFL e NBA, incluindo times, placares (ou placares parciais), status (Final, In Progress, Scheduled, Postponed) e horários para jogos agendados.

                    Com base nesses dados e **considerando o horário atual**, gere um texto em português no seguinte formato e estilo:

                    1.  **Tom Conversacional:** Escreva de forma natural e amigável, como se estivesse atualizando um amigo chamado "Gabriel". Comece com uma saudação ("Olá Gabriel! Tudo certo?", ou similar).
                    2.  **Estrutura Clara:** Separe nitidamente as informações de "ONTEM" das informações de "HOJE".
                    3.  **Resumo de Ontem:** Para cada liga (NBA, NFL, MLB):
                    * Informe os resultados finais dos jogos que aconteceram.
                    * Mencione explicitamente se não houve jogos (como na NFL, explicando brevemente o motivo - ex: entressafra).
                    * Mencione jogos adiados, se houver.
                    4.  **Atualização de Hoje:** Para cada liga (NBA, NFL, MLB):
                    * **Jogos Finalizados:** Informe os resultados finais.
                    * **Jogos em Andamento ('In Progress'):** Informe o placar parcial *que consta nos dados*, mas adicione uma observação indicando que este era o placar no momento da consulta e que o jogo pode já ter terminado ou estar em outra fase, *considerando o horário atual*.
                    * **Jogos Agendados ('Scheduled'):** Verifique o horário do jogo agendado.
                    * Se o horário do jogo já passou (baseado no horário atual), mencione que o jogo *deve ter começado* ou está *em andamento*.
                    * Se o horário ainda não chegou, informe que o jogo acontecerá mais tarde e especifique o **horário de início**.
                    * **NFL:** Reafirme que não há jogos.
                    5.  **Linguagem:** Use frases completas e fluidas. Não copie apenas os dados, reinterprete-os no formato de resumo conversacional.
                    6.  **Horário:** Inclua os horários de início dos jogos agendados.

                    ${JSON.stringify(data)}
                `
            }]
        }];

        const response = await ai.models.generateContentStream({
            model,
            config,
            contents,
        });

        let fullResponse = '';

        for await (const chunk of response) {
            fullResponse += chunk.text;
        }

        return fullResponse;
    } catch (error) {
        return "Erro ao gerar texto: " + error.message;
    }
}

async function bomDia() {
    const results = await fetchAllSportsData();

    const mensagem = await sendToGemini(results);

    results.mensagem = mensagem;

    console.log(results.mensagem);
}

bomDia();
