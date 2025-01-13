import { ChatPromptTemplate } from '@langchain/core/prompts';
import { MessagesPlaceholder } from '@langchain/core/prompts';
import { getModel } from '../../utils';
import { AgentStateChannels } from '../../SourceConversionToCIR/state';
import { JsonOutputFunctionsParser } from 'langchain/output_parsers';
import { PolicyRepository } from '../../../../repository/Policy.repository';
import { JsonOutputToolsParser } from '@langchain/core/output_parsers/openai_tools';
import crypto from 'crypto';
import { ToolDefinition } from '@langchain/core/language_models/base';
import { cleanMessageHistory } from '../../utils/CleanMessage';

function generateUUID(length: number) {
  return crypto.randomBytes(length / 2).toString('hex');
}

const policyRepository = new PolicyRepository();

const extractionFunctionSchema = {
  name: 'extractor',
  description: 'Extracts fields from the input.',
  parameters: {
    type: 'object',
    properties: {
      policyId: {
        type: 'string',
        description: 'The policy id passed from the user',
      },
      name: {
        type: 'string',
        description: 'The name of the policy',
      },
      description: {
        type: 'string',
        description: 'The description of the policy',
      },
      conditions: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            key: {
              type: 'string',
              description: 'The condition key',
            },
            value: {
              type: 'string',
              description: 'The condition value',
            },
          },
          required: ['key', 'value'],
        },
        description: 'The conditions of the policy',
      },
      actions: {
        type: 'array',
        items: {
          type: 'string',
        },
        description: 'The actions of the policy',
      },
      resources: {
        type: 'array',
        items: {
          type: 'string',
        },
        description: 'The resources of the policy',
      },
      severity: {
        type: 'string',
        description: 'The severity of the policy',
      },
      policyType: {
        type: 'string',
        description: 'The type of the policy',
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

const extractionTool: ToolDefinition = {
  type: 'function',
  function: extractionFunctionSchema,
};

export async function policyRegistererChain(state: AgentStateChannels) {
  const { messages, translatedPolicy, sourcePolicy } = state;
  const model = getModel();

  const jsonParser = new JsonOutputToolsParser();

  const runnable = model.bindTools([extractionTool], {
    tool_choice: extractionTool.function.name,
  });

  const systemPrompt = `You are an assistant to generate JSON policies, based on the policy provided return it in JSON format, and assign the id assigned from the user`;

  const prompt = ChatPromptTemplate.fromMessages([
    ['system', systemPrompt],
    [
      'human',
      `I want to generate a policy based on this one: {policy}, with the new id: target-${generateUUID(
        16
      )}`,
    ],
  ]);

  const chain = prompt.pipe(runnable).pipe(jsonParser);

  const res = (await chain.invoke({
    chat_history: messages,
    policy: translatedPolicy || sourcePolicy,
  })) as any;

  const policy = res[0].args;

  try {
    await policyRepository.create(policy);
    return {
      policy: res,
      message: `Policy created successfully with id: ${policy.policyId}`,
    };
  } catch (e: any) {
    return {
      policy: null,
      message: `Error creating policy: ${e.message}`,
    };
  }
}
