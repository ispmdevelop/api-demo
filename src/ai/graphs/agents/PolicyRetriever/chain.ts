import { ChatPromptTemplate } from '@langchain/core/prompts';
import { MessagesPlaceholder } from '@langchain/core/prompts';
import { getModel } from '../../utils';
import { AgentStateChannels } from '../../SourceConversionToCIR/state';
import { JsonOutputFunctionsParser } from 'langchain/output_parsers';
import { PolicyRepository } from '../../../../repository/Policy.repository';

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

interface ChainResponse {
  policyId: string;
}

export async function policyRetrieverChain(state: AgentStateChannels) {
  const { messages } = state;
  const model = getModel();

  const jsonParser = new JsonOutputFunctionsParser();

  const runnable = model.bind({
    functions: [extractionFunctionSchema],
    function_call: { name: 'extractor' },
  });

  const systemPrompt = `You are an assistant to retrieve policies, get the id of the policy Id`;

  const prompt = ChatPromptTemplate.fromMessages([
    ['system', systemPrompt],
    new MessagesPlaceholder('chat_history'),
  ]);

  const chain = prompt.pipe(runnable).pipe(jsonParser);

  const res = (await chain.invoke({
    chat_history: messages,
  })) as ChainResponse;

  const policy = policyRepository.getById(res.policyId);

  return {
    policy: policy,
    message: policy
      ? `Here is the policy you requested: ${JSON.stringify(policy)}`
      : 'Sorry, I could not find the policy you requested',
  };
}
