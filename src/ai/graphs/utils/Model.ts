import { ChatOpenAI } from '@langchain/openai';
import { ChatBedrockConverse } from '@langchain/aws';

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

  if (
    process.env.PREFER_BEDROCK_MODEL &&
    process.env.BEDROCK_AWS_ACCESS_KEY_ID &&
    process.env.BEDROCK_AWS_SECRET_ACCESS_KEY
  ) {
    const modelName = process.env.PREFER_BEDROCK_MODEL;
    console.log('Using Bedrock model', modelName);
    return new ChatBedrockConverse({
      model: modelName,
      region: process.env.BEDROCK_AWS_REGION ?? 'us-east-1',
      credentials: {
        accessKeyId: process.env.BEDROCK_AWS_ACCESS_KEY_ID || '',
        secretAccessKey: process.env.BEDROCK_AWS_SECRET_ACCESS_KEY || '',
      },
      temperature: config.temperature,
      maxRetries: config.maxRetries,
    });
  } else {
    console.log('Using Open AI model', config.model);
    return new ChatOpenAI({
      model: config.model,
      temperature: config.temperature,
      maxRetries: config.maxRetries,
      apiKey: config.key,
    });
  }
}
