import { AgentStateChannels } from '../../state';
import { RunnableConfig, RunnableLike } from '@langchain/core/runnables';
import { AIMessage } from '@langchain/core/messages';
import { serviceStatusChain } from './chain';

export const NodeName = 'service-status-retriever';

export const ServiceStatusRetrieverNode: RunnableLike<
  AgentStateChannels
> = async (state: AgentStateChannels, config?: RunnableConfig) => {
  const result = await serviceStatusChain(state);
  return {
    messages: [new AIMessage({ content: result.message, name: NodeName })],
  };
};
