import { ChatPromptTemplate } from '@langchain/core/prompts';
import { MessagesPlaceholder } from '@langchain/core/prompts';
import { BaseMessage } from '@langchain/core/messages';
import { getModel } from '../../utils';
import { AgentStateChannels } from '../../SourceConversionToCIR/state';

export async function chatQaChain(state: AgentStateChannels) {
  const { messages } = state;
  const model = getModel();

  const qaSystemPrompt = `
You are an assistant for question-answering tasks. Use
the following context to answer the user's question\n`;

  const qaPrompt = ChatPromptTemplate.fromMessages([
    ['system', qaSystemPrompt],
    new MessagesPlaceholder('chat_history'),
    ['human', '{input}'],
  ]);

  const chatHistory: BaseMessage[] =
    messages.slice(0, messages.length - 1) || [];

  const userInput = messages[messages.length - 1];

  const chain = qaPrompt.pipe(model);

  const res = await chain.invoke({
    chat_history: chatHistory,
    input: userInput,
  });

  return res;
}
