import { JsonOutputToolsParser } from '@langchain/core/output_parsers/openai_tools';
import { END } from '@langchain/langgraph';
import {
  ChatPromptTemplate,
  MessagesPlaceholder,
} from '@langchain/core/prompts';
import { getModel } from '../utils/';

export const getSupervisorChain = async (members: string[]) => {
  const systemPrompt =
    'You are a supervisor tasked with managing a conversation between the' +
    ' following workers: {members}. Given the following user request,' +
    ' respond with the worker to act next. Each worker will perform a' +
    ' task and respond with their results and status. When finished,' +
    ' respond with FINISH.' +
    ' Chat history: ${messages}';
  const options = [END, ...members];

  // Define the routing function
  const functionDef = {
    name: 'route',
    description: 'Select the next role.',
    parameters: {
      title: 'routeSchema',
      type: 'object',
      properties: {
        next: {
          title: 'Next',
          anyOf: [{ enum: options }],
        },
      },
      required: ['next'],
    },
  };

  const toolDef = {
    type: 'function',
    function: functionDef,
  } as const;

  const prompt = ChatPromptTemplate.fromMessages([
    ['system', systemPrompt],
    [
      'user',
      'Given the conversation above, who should act next?' +
        ' Or should we FINISH? Select one of: {options}',
    ],
  ]);

  const formattedPrompt = await prompt.partial({
    options: options.join(', '),
    members: members.join(', '),
  });

  const llm = getModel();

  const supervisorChain = formattedPrompt
    .pipe(
      llm.bindTools([toolDef], {
        tool_choice: toolDef.function.name,
      })
    )
    .pipe(new JsonOutputToolsParser())
    .pipe((x: any) => {
      console.log('Supervisor chain output:', x);
      return x[0].args;
    });

  return supervisorChain;
};
