import { AgentStateChannels } from '../../state';
import { RunnableConfig, RunnableLike } from '@langchain/core/runnables';
import { AIMessage } from '@langchain/core/messages';
import { serviceEnablerChain } from './chain';

export const NodeName = 'service-enabler';

export const ServiceEnablerNode: RunnableLike<AgentStateChannels> = async (
  state: AgentStateChannels,
  config?: RunnableConfig
) => {
  const result = await serviceEnablerChain(state);
  return {
    messages: [new AIMessage({ content: result.message, name: NodeName })],
  };
};
