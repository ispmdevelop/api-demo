import { AgentStateChannels } from '../../SourceConversionToCIR/state';
import { RunnableConfig, RunnableLike } from '@langchain/core/runnables';
import { AIMessage } from '@langchain/core/messages';
import { policyRegistererChain } from './chain';

export const NodeName = 'policy-register-deliverer';

export const PolicyRegisterNode: RunnableLike<AgentStateChannels> = async (
  state: AgentStateChannels,
  config?: RunnableConfig
) => {
  const result = await policyRegistererChain(state);
  return {
    messages: [new AIMessage({ content: result.message, name: NodeName })],
    generatedPolicy: result || null,
  };
};
