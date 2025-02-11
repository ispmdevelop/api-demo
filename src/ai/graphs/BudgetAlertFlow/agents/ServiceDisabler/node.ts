import { AgentStateChannels } from '../../state';
import { RunnableConfig, RunnableLike } from '@langchain/core/runnables';
import { AIMessage } from '@langchain/core/messages';
import { serviceDisablerChain } from './chain';

export const NodeName = 'service-disabler';

export const ServiceDisablerNode: RunnableLike<AgentStateChannels> = async (
  state: AgentStateChannels,
  config?: RunnableConfig
) => {
  const result = await serviceDisablerChain(state);
  return {
    messages: [new AIMessage({ content: result.message, name: NodeName })],
  };
};
