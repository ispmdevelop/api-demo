import { DynamicTool } from '@langchain/core/tools';
import { DBService } from '../../../../../services/dbService';
import { RuleRiskLevel } from '../../../../../types/RuleRiskLevel';

const toolName = 'Get Rule Risk Level';

const description = 'Get Rule Risk Level Options';

const fn = async (): Promise<string> => {
  try {
    const riskLevels = await DBService.getRuleRiskLevels();
    const riskLevelOptions = riskLevels.map((department: RuleRiskLevel) => {
      return {
        value: department.name,
        label: department.label,
      };
    });
    return JSON.stringify(riskLevelOptions, null, 2);
  } catch (err) {
    console.log(err);
    return 'Error fetching Rule Risks';
  }
};

const tool = new DynamicTool({
  name: toolName,
  description: description,
  func: fn,
});

export { toolName, description, fn, tool };
