import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { StudioView, AchievementName, GroundingSource } from '../types';

interface GeminiResponse {
  text: string;
  action?: {
    type: 'setView';
    view: StudioView;
  };
  grounding?: GroundingSource[];
}

// Assume que process.env.API_KEY está configurado no ambiente de execução.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getGeminiResponse = async (prompt: string, achievement: AchievementName | null): Promise<GeminiResponse> => {
    
    const systemInstruction = `Você é a "Writer University AI", uma inteligência artificial assistente de reforço escolar, especializada no currículo do Ensino Fundamental do Brasil. Sua principal missão é ajudar os alunos a entenderem os tópicos de forma clara, divertida e eficaz.

Regras:
1.  **Linguagem Simples:** Use uma linguagem simples, apropriada para crianças e adolescentes (6 a 14 anos). Evite jargões complexos.
2.  **Seja Encorajador:** Mantenha um tom positivo e encorajador. Elogie o esforço do aluno.
3.  **Foco no Ensino Fundamental:** Suas respostas devem ser focadas nas matérias do Ensino Fundamental: Matemática, Português, Ciências, Geografia, História, Inglês, Artes e Educação Física.
4.  **Use a Busca:** Utilize a busca na web (ferramenta Google Search) para obter informações atualizadas e exemplos relevantes, mas sempre adapte o conteúdo para o nível de ensino do aluno.
5.  **Interativo:** Faça perguntas para estimular o raciocínio do aluno.
6.  **Respostas Diretas:** Responda diretamente à pergunta do aluno antes de adicionar mais informações.
7.  **Segurança:** Nunca forneça informações pessoais ou links para sites não seguros. Priorize fontes educacionais confiáveis.`;

    let userPrompt = prompt;
    if (achievement) {
      let responsePrefix = '';
      switch (achievement) {
          case 'math':
              responsePrefix = 'Com meus super-poderes de Mestre da Matemática, vamos resolver isso! ';
              break;
          case 'space':
              responsePrefix = 'Ativando modo Explorador Espacial! ';
              break;
          case 'history':
              responsePrefix = 'Consultando os arquivos da história... ';
              break;
          case 'grammar':
              responsePrefix = 'Com a precisão de um Gênio da Gramática, eu afirmo: ';
              break;
      }
      userPrompt = responsePrefix + userPrompt;
    }
    
    try {
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: userPrompt,
            config: {
                systemInstruction: systemInstruction,
                tools: [{googleSearch: {}}],
            },
        });

        const text = response.text;
        
        const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
        
        const grounding: GroundingSource[] = groundingChunks
            .map((chunk: any) => {
                if (chunk.web) {
                    return {
                        title: chunk.web.title || 'Fonte da Web',
                        url: chunk.web.uri,
                    };
                }
                return null;
            })
            .filter((source): source is GroundingSource => source !== null);

        // Lógica simples para sugerir ferramentas sem uma chamada de função completa
        const lowerCaseText = text.toLowerCase();
        let action;
        if (lowerCaseText.includes('calculadora') || lowerCaseText.includes('calcular')) {
          action = { type: 'setView' as const, view: 'calculator' as const };
        } else if (lowerCaseText.includes('mapa')) {
          action = { type: 'setView' as const, view: 'map' as const };
        } else if (lowerCaseText.includes('livro') || lowerCaseText.includes('e-book') || lowerCaseText.includes('leitura')) {
          action = { type: 'setView' as const, view: 'ebook' as const };
        }

        return {
            text,
            grounding: grounding.length > 0 ? grounding : undefined,
            action,
        };

    } catch (error) {
        console.error("Error calling Gemini API:", error);
        return {
            text: "Ops! Parece que tive um problema para me conectar. Por favor, verifique sua conexão com a internet e tente novamente."
        };
    }
};