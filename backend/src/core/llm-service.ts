import OpenAI from "openai";

export class LLMService {
  private openai: OpenAI;

  constructor(apiKey: string) {
    this.openai = new OpenAI({
      apiKey: apiKey
    });
  }

  async generateCompletion(prompt: string, systemPrompt?: string, model: string = "gpt-4o-mini"): Promise<string> {
    const messages = systemPrompt 
      ? [{ role: "system" as const, content: systemPrompt }, { role: "user" as const, content: prompt }]
      : [{ role: "user" as const, content: prompt }];

    const response = await this.openai.chat.completions.create({
      model,
      messages,
      temperature: 0.7,
      max_tokens: 1000
    });

    return response.choices[0]?.message?.content || "";
  }

  async generateStructuredOutput<T>(prompt: string, systemPrompt: string, model: string = "gpt-4o-mini"): Promise<T> {
    const response = await this.openai.chat.completions.create({
      model,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: prompt }
      ],
      temperature: 0.7,
      response_format: { type: "json_object" }
    });

    const content = response.choices[0]?.message?.content || "{}";
    return JSON.parse(content) as T;
  }
}