import { DynamicStructuredTool } from '@langchain/core/tools';
import { DBService } from '../../../../../services/dbService';
import { z } from 'zod';

const toolName = 'Get Max Violation Score available';

const description =
  'Get Max available Violation score to create a rule in a table';

const inputSchema = z.object({
  migrationId: z.string(),
  tableName: z.string(),
});

interface Param {
  migrationId: string;
  tableName: string;
}

const fn = async ({ migrationId, tableName }: Param): Promise<string> => {
  try {
    if (tableName == '' || migrationId == '') {
      return 'Range could not be determined';
    }
    const maxViolationScore = await DBService.getMaxViolationScoreAllowed(
      migrationId,
      tableName
    );
    return `[0, ${maxViolationScore}]`;
  } catch (err) {
    console.log(err);
    return 'Error fetching Rule Departments';
  }
};

const tool = new DynamicStructuredTool({
  name: toolName,
  description: description,
  schema: inputSchema,
  func: fn,
});

export { toolName, description, fn, tool };
