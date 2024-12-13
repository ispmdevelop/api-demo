import { ChatPromptTemplate } from '@langchain/core/prompts';
import { MessagesPlaceholder } from '@langchain/core/prompts';
import { getModel } from '../../utils';
import { AgentStateChannels } from '../../SourceConversionToCIR/state';
import { PolicyRepository } from '../../../../repository/Policy.repository';
import { JsonOutputToolsParser } from '@langchain/core/output_parsers/openai_tools';
import { ToolDefinition } from '@langchain/core/language_models/base';
import { cleanMessageHistory } from '../../utils/CleanMessage';

const policyRepository = new PolicyRepository();

const extractionFunctionSchema = {
  name: 'extractor',
  description: 'Extracts fields from the input.',
  parameters: {
    type: 'object',
    properties: {
      policyId: {
        type: 'string',
        description: 'The policy id to get/retrieve/extract',
      },
    },
    required: ['policyId'],
  },
};

const extractionTool: ToolDefinition = {
  type: 'function',
  function: extractionFunctionSchema,
};

export async function policyRetrieverChain(state: AgentStateChannels) {
  const { messages } = state;
  const model = getModel();

  const jsonParser = new JsonOutputToolsParser();

  const runnable = model.bindTools([extractionTool], {
    tool_choice: extractionTool.function.name,
  });

  const systemPrompt = `You are an assistant to retrieve policies, get the id of the policy Id`;

  const prompt = ChatPromptTemplate.fromMessages([
    ['system', systemPrompt],
    new MessagesPlaceholder('chat_history'),
  ]);

  const chain = prompt.pipe(runnable).pipe(jsonParser);

  const res = (await chain.invoke({
    chat_history: messages,
  })) as any;

  const policyId = res[0].args.policyId;
  const policy = policyRepository.getById(policyId);

  return {
    policy: policy,
    message: policy
      ? `Here is the policy you requested: ${JSON.stringify(policy)}`
      : 'Sorry, I could not find the policy you requested',
  };
}
