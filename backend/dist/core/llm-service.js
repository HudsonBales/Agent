"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LLMService = void 0;
const openai_1 = __importDefault(require("openai"));
class LLMService {
    constructor(apiKey) {
        this.openai = new openai_1.default({
            apiKey: apiKey
        });
    }
    async generateCompletion(prompt, systemPrompt, model = "gpt-4o-mini") {
        const messages = systemPrompt
            ? [{ role: "system", content: systemPrompt }, { role: "user", content: prompt }]
            : [{ role: "user", content: prompt }];
        const response = await this.openai.chat.completions.create({
            model,
            messages,
            temperature: 0.7,
            max_tokens: 1000
        });
        return response.choices[0]?.message?.content || "";
    }
    async generateStructuredOutput(prompt, systemPrompt, model = "gpt-4o-mini") {
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
        return JSON.parse(content);
    }
}
exports.LLMService = LLMService;
//# sourceMappingURL=llm-service.js.map