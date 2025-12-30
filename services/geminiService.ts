
import { GoogleGenAI, Type } from "@google/genai";
import { ROIDiagnostic } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Auditoría Estructurada de Valor en IA
 * Genera un diagnóstico basado en impacto financiero y eficiencia operativa.
 */
export async function analyzeAIUseCase(useCase: string): Promise<ROIDiagnostic> {
  const model = 'gemini-3-flash-preview';
  
  const prompt = `
Actúa como un Auditor Senior de Estrategia de IA Corporativa. Evalúa esta iniciativa: "${useCase}"

Criterios de Evaluación:
1. Impacto EBITDA: ¿Genera ahorro real o aumento de ingresos?
2. Soberanía Técnica: ¿Crea un activo propio o es un gasto recurrente en herramientas de terceros?
3. Integración Operativa: ¿Se conecta con procesos core o es una isla táctica?

Genera un JSON con:
- category: 'VALUE' (Inversión estratégica con retorno) o 'LEAKAGE' (Gasto táctico con retorno nulo o negativo).
- roiEstimate: Término técnico de impacto (ej: "DILUCIÓN_DE_CAPITAL", "RETORNO_A_6_MESES", "PASIVO_OPERATIVO").
- reasoning: Análisis breve del por qué de la clasificación centrada en el presupuesto.
- recommendation: Paso a seguir para optimizar la inversión.
`;

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: [{ parts: [{ text: prompt }] }],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            category: { type: Type.STRING, enum: ['VALUE', 'LEAKAGE'] },
            roiEstimate: { type: Type.STRING },
            reasoning: { type: Type.STRING },
            recommendation: { type: Type.STRING },
          },
          required: ['category', 'roiEstimate', 'reasoning', 'recommendation']
        }
      }
    });

    const result = JSON.parse(response.text || "{}");
    return result as ROIDiagnostic;
  } catch (error) {
    console.error("Auditoría fallida:", error);
    return {
      category: 'LEAKAGE',
      roiEstimate: "FALLA_ANALISIS",
      reasoning: "El motor de auditoría no pudo procesar la solicitud debido a una interrupción en el handshake estratégico.",
      recommendation: "Reintentar el análisis con una descripción más detallada del flujo operativo."
    };
  }
}