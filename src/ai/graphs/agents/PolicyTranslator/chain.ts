import { ChatPromptTemplate } from '@langchain/core/prompts';
import { MessagesPlaceholder } from '@langchain/core/prompts';
import { getModel } from '../../utils';
import { AgentStateChannels } from '../../SourceConversionToCIR/state';
import { JsonOutputFunctionsParser } from 'langchain/output_parsers';
import { Policy } from '../../../../types/Policy';

const extractionFunctionSchema = {
  name: 'extractor',
  description: 'Extracts fields from the input.',
  parameters: {
    type: 'object',
    properties: {
      policyId: {
        type: 'string',
        description:
          'The policy id to get/retrieve/extract (in the requested translation language)',
      },
      name: {
        type: 'string',
        description:
          'The name of the policy (in the requested translation language)',
      },
      description: {
        type: 'string',
        description:
          'The description of the policy (in the requested translation language)',
      },
      conditions: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            key: {
              type: 'string',
              description:
                'The condition key (in the requested translation language)',
            },
            value: {
              type: 'string',
              description:
                'The condition value (in the requested translation language)',
            },
          },
          required: ['key', 'value'],
        },
        description:
          'The conditions of the policy (in the requested translation language)',
      },
      actions: {
        type: 'array',
        items: {
          type: 'string',
        },
        description:
          'The actions of the policy (in the requested translation language)',
      },
      resources: {
        type: 'array',
        items: {
          type: 'string',
        },
        description:
          'The resources of the policy (in the requested translation language)',
      },
      severity: {
        type: 'string',
        description:
          'The severity of the policy (in the requested translation language)',
      },
      policyType: {
        type: 'string',
        description:
          'The type of the policy (in the requested translation language)',
      },
      complianceMetadata: {
        type: 'array',
        items: {
          type: 'string',
        },
        description:
          'The compliance metadata of the policy (in the requested translation language)',
      },
    },
    required: [
      'policyId',
      'name',
      'description',
      'conditions',
      'actions',
      'resources',
      'severity',
      'policyType',
      'complianceMetadata',
    ],
  },
};

interface ChainResponse {
  policy: Policy;
}

export async function policyLanguageTranslatorChain(state: AgentStateChannels) {
  const { messages, sourcePolicy } = state;
  const model = getModel();

  const jsonParser = new JsonOutputFunctionsParser();

  const runnable = model.bind({
    functions: [extractionFunctionSchema],
    function_call: { name: 'extractor' },
  });

  const systemPrompt = `You are a policy translator you are going to be given a policy to translate to a different language specified by the use only the values`;

  const prompt = ChatPromptTemplate.fromMessages([
    ['system', systemPrompt],
    new MessagesPlaceholder('chat_history'),
    [
      'human',
      `Translate the policy to the specified language policy: {policy}`,
    ],
  ]);

  const chain = prompt.pipe(runnable).pipe(jsonParser);

  const res = (await chain.invoke({
    chat_history: messages,
    policy: sourcePolicy,
  })) as ChainResponse;

  return {
    policy: res,
    message: `Policy translated successfully ${JSON.stringify(res)}`,
  };
}
