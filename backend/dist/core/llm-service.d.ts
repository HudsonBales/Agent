export declare class LLMService {
    private openai;
    constructor(apiKey: string);
    generateCompletion(prompt: string, systemPrompt?: string, model?: string): Promise<string>;
    generateStructuredOutput<T>(prompt: string, systemPrompt: string, model?: string): Promise<T>;
}
//# sourceMappingURL=llm-service.d.ts.map