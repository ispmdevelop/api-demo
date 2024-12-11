import { AgentStateChannels } from '../../SourceConversionToCIR/state';
import { RunnableConfig, RunnableLike } from '@langchain/core/runnables';
import { AIMessage } from '@langchain/core/messages';
import { policyLanguageTranslatorChain } from './chain';

export const NodeName = 'policy-language-translator';

export const PolicyLanguageTranslatorNode: RunnableLike<
  AgentStateChannels
> = async (state: AgentStateChannels, config?: RunnableConfig) => {
  const result = await policyLanguageTranslatorChain(state);
  return {
    messages: [new AIMessage({ content: result.message, name: NodeName })],
    translatedPolicy: result.policy || null,
  };
};
