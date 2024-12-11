import { AgentStateChannels } from '../../SourceConversionToCIR/state';
import { RunnableConfig } from '@langchain/core/runnables';
import { RuleNameDescriptionDepartmentRiskLevelRuleTypeSuggesterChain } from './chain';
import { AIMessage } from '@langchain/core/messages';

export const NodeName =
  'rule_name_description_department_riskLevel_ruleType_violationScore_suggester';

export const RuleDetailSuggesterNode = async (
  state: AgentStateChannels,
  config?: RunnableConfig
) => {
  const result =
    await RuleNameDescriptionDepartmentRiskLevelRuleTypeSuggesterChain(state);
  console.log({ result });
  return {
    messages: [
      new AIMessage({
        content:
          result.chatResponse ||
          `The recommendations are ready see them in the details screen.`,
        name: NodeName,
      }),
    ],
    suggestions: { ...result },
  };
};
