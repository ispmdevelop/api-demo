import { AgentStateChannels } from '../../SourceConversionToCIR/state';
import { RunnableConfig, RunnableLike } from '@langchain/core/runnables';
import { AIMessage } from '@langchain/core/messages';
import { chatQaChain } from './chain';

export const NodeName = 'question_answer_responder';

export const QANode: RunnableLike<AgentStateChannels> = async (
  state: AgentStateChannels,
  config?: RunnableConfig
) => {
  const result = await chatQaChain(state);
  return {
    messages: [new AIMessage({ content: result.content, name: NodeName })],
  };
};
