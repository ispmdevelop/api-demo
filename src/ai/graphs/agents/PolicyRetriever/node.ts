import { AgentStateChannels } from '../../SourceConversionToCIR/state';
import { RunnableConfig, RunnableLike } from '@langchain/core/runnables';
import { AIMessage } from '@langchain/core/messages';
import { policyRetrieverChain } from './chain';

export const NodeName = 'policy-retriever';

export const PolicyRetrieverNode: RunnableLike<AgentStateChannels> = async (
  state: AgentStateChannels,
  config?: RunnableConfig
) => {
  const result = await policyRetrieverChain(state);
  return {
    messages: [new AIMessage({ content: result.message, name: NodeName })],
    sourcePolicy: result.policy || null,
  };
};
