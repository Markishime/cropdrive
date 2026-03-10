declare module '@google/generative-ai' {
  export interface GenerationConfig {
    temperature?: number;
    maxOutputTokens?: number;
    [key: string]: any;
  }

  export interface GenerativeModelConfig {
    model: string;
    generationConfig?: GenerationConfig;
  }

  export interface ChatHistoryMessage {
    role: 'user' | 'model';
    parts: { text: string }[];
  }

  export interface StartChatOptions {
    history?: ChatHistoryMessage[];
    generationConfig?: GenerationConfig;
  }

  export interface GenerateContentResponse {
    text(): string;
    [key: string]: any;
  }

  export interface GenerateContentResult {
    response: GenerateContentResponse | Promise<GenerateContentResponse>;
  }

  export interface ChatSession {
    sendMessage(
      input: string | { text: string } | Array<{ text: string }>
    ): Promise<GenerateContentResult>;
  }

  export interface GenerativeModel {
    startChat(options?: StartChatOptions): ChatSession;
    generateContent(
      input: string | { text: string } | Array<{ text: string }>
    ): Promise<GenerateContentResult>;
  }

  export class GoogleGenerativeAI {
    constructor(apiKey: string);
    getGenerativeModel(config: GenerativeModelConfig): GenerativeModel;
  }
}
