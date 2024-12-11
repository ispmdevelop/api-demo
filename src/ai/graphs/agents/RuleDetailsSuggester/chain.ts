import { AgentStateChannels } from '../../SourceConversionToCIR/state';
import { getModel } from '../../utils';
import {
  ChatPromptTemplate,
  MessagesPlaceholder,
} from '@langchain/core/prompts';
import { JsonOutputFunctionsParser } from 'langchain/output_parsers';
import { fn as getDepartments } from './tools/getDepartments';
import { fn as getRiskLevels } from './tools/getRiskLevels';
import { fn as getRuleTypes } from './tools/getRuleTypes';
import { fn as getMaxViolationScore } from './tools/getMaxViolationScore';

const extractionFunctionSchema = {
  name: 'extractor',
  description: 'Extracts fields from the input.',
  parameters: {
    type: 'object',
    properties: {
      ruleName: {
        type: 'string',
        description: 'The Rule Name recommended',
      },
      description: {
        type: 'string',
        description: 'The Rule Description recommended',
      },
      department: {
        type: 'string',
        description: 'The rule department (value) recommended',
      },
      riskLevel: {
        type: 'string',
        description: 'The risk level (value) recommended',
      },
      ruleType: {
        type: 'string',
        description: 'The rule type (value) recommended',
      },
      violationScore: {
        type: 'number',
        description: 'The violation score recommended',
      },
      chatResponse: {
        type: 'string',
        description: 'A human-readable response to the user',
      },
    },
    required: ['table', 'chat_response'],
  },
};

interface ChainResponse {
  ruleName: string;
  description: string;
  department: string;
  riskLevel: string;
  ruleType: string;
  chatResponse: string;
}

export const RuleNameDescriptionDepartmentRiskLevelRuleTypeSuggesterChain =
  async (state: AgentStateChannels): Promise<ChainResponse> => {
    const { messages } = state;
    const llm = getModel();

    const [
      departmentsOptions,
      riskLevelOptions,
      ruleTypeOptions,
      violationScoreRange,
    ] = await Promise.all([
      getDepartments(),
      getRiskLevels(),
      getRuleTypes(),
      getMaxViolationScore({
        migrationId: '',
        tableName: '',
      }),
    ]);

    const systemPrompt = `You are a rule creation assistant of customer city (A data quality software that creates SQL like rules that helps to improve client's data quality)
  Base on the following chat history, department options, risk level options and rule type options, 
  Please Recommend the following: RuleName, Description, Department, Risk Level, Rule Type and violation score.
  If the client has not given any context of what the rule is about, you can ask the client for more information and do not make recommendations until you have enough information.
  Departments options: {departments}
  Risk options: {riskLevels}
  Rule Types: {ruleTypes}
  Violation Score Range: {violationScoreRange}`;

    const jsonParser = new JsonOutputFunctionsParser();

    const runnable = llm.bind({
      functions: [extractionFunctionSchema],
      function_call: { name: 'extractor' },
    });

    const prompt = ChatPromptTemplate.fromMessages([
      ['system', systemPrompt],
      new MessagesPlaceholder('chat_history'),
    ]);

    const chain = prompt.pipe(runnable).pipe(jsonParser);

    return chain.invoke({
      chat_history: messages,
      departments: departmentsOptions,
      riskLevels: riskLevelOptions,
      ruleTypes: ruleTypeOptions,
      violationScoreRange: violationScoreRange,
    }) as Promise<ChainResponse>;
  };
