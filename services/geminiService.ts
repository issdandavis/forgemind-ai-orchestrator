
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { ResearchOutput, CodeImplementation, TestSuite } from "../types";

// Initialize the API client
const getAi = () => new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const conductResearch = async (topic: string): Promise<ResearchOutput> => {
  const ai = getAi();
  
  const response: GenerateContentResponse = await ai.models.generateContent({
    model: "gemini-2.5-flash-lite-latest",
    contents: `Conduct a comprehensive technical research on the following topic for an automated code generation agent: "${topic}". 
    Focus on architectural patterns, API integration details, and common pitfalls. 
    Format the response as clear sections: Summary, Key Findings, and Technical Requirements.`,
    config: {
      tools: [{ googleSearch: {} }],
    },
  });

  const text = response.text || "No research data gathered.";
  const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
  
  const sources = groundingChunks
    .filter((chunk: any) => chunk.web)
    .map((chunk: any) => ({
      title: chunk.web.title,
      uri: chunk.web.uri,
    }));

  const keyFindingsMatch = text.match(/Key Findings:([\s\S]*?)(Technical Requirements:|$)/i);
  const keyFindings = keyFindingsMatch 
    ? keyFindingsMatch[1].split('\n').filter(line => line.trim().startsWith('-')).map(line => line.replace(/^- /, '').trim())
    : ["Research completed successfully."];

  return {
    summary: text,
    sources,
    keyFindings,
  };
};

export const generateCode = async (topic: string, research: ResearchOutput): Promise<CodeImplementation> => {
  const ai = getAi();
  
  const prompt = `
    Using the following research data:
    ---
    SUMMARY: ${research.summary}
    KEY FINDINGS: ${research.keyFindings.join(', ')}
    ---
    
    Generate three distinct code implementations for the topic: "${topic}".
    
    1. Firebase: A complete backend configuration and Cloud Function snippet (TypeScript).
    2. AI Studio: A prompt engineering template and Gemini SDK integration code (Node.js).
    3. Replit: A standalone interactive demo script (Python or Node.js).
    
    Format the output as a valid JSON object with keys "firebase", "aiStudio", and "replit". Each value should be the raw code string.
  `;

  const response: GenerateContentResponse = await ai.models.generateContent({
    model: "gemini-3-pro-preview",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      thinkingConfig: { thinkingBudget: 32768 }
    },
  });

  try {
    const rawJson = response.text || "{}";
    const cleanedJson = rawJson.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(cleanedJson);
  } catch (err) {
    console.error("Failed to parse code gen JSON", err);
    return {
      firebase: "// Error generating Firebase code",
      aiStudio: "// Error generating AI Studio code",
      replit: "# Error generating Replit code",
    };
  }
};

export const generateTests = async (topic: string, research: ResearchOutput, code: CodeImplementation): Promise<TestSuite> => {
  const ai = getAi();

  const prompt = `
    Based on the topic "${topic}" and the following code implementations, generate a comprehensive unit test suite.
    
    RESEARCH SUMMARY: ${research.summary}
    
    CODE IMPLEMENTATIONS:
    ---
    FIREBASE: ${code.firebase}
    AI STUDIO: ${code.aiStudio}
    REPLIT: ${code.replit}
    ---
    
    1. Determine the best testing framework (e.g., Jest for Node.js/TS, Pytest for Python).
    2. Generate tests that cover critical paths, error handling, and expected behaviors.
    
    Format the output as a JSON object with keys "framework" (string) and "testCode" (string).
  `;

  const response: GenerateContentResponse = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
    },
  });

  try {
    const rawJson = response.text || "{}";
    const cleanedJson = rawJson.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(cleanedJson);
  } catch (err) {
    console.error("Failed to parse test gen JSON", err);
    return {
      framework: "Jest",
      testCode: "// Error generating unit tests",
    };
  }
};
