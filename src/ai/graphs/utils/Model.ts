import { ChatOpenAI } from '@langchain/openai';

export interface OpenAIConfiguration {
  key: string;
  model: string;
  temperature: number;
  maxRetries: number;
}

function getOpenAIConfiguration(): OpenAIConfiguration {
  return JSON.parse(process.env.OPEN_AI_CONFIG || '{}');
}

export function getModel() {
  const config = getOpenAIConfiguration();

  const model = new ChatOpenAI({
    model: config.model,
    temperature: config.temperature,
    maxRetries: config.maxRetries,
    apiKey: config.key,
  });

  return model;
}
