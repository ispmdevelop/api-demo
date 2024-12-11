import { DynamicTool } from '@langchain/core/tools';
import { DBService } from '../../../../../services/dbService';
import { RuleType } from '../../../../../types/RuleType';

const toolName = 'Get Rule Types';

const description = 'Get Rule Type Options';

const fn = async (): Promise<string> => {
  try {
    const ruleTypes = await DBService.getRuleTypes();
    const ruleTypeOptions = ruleTypes.map((ruleType: RuleType) => {
      return {
        value: ruleType.name,
        label: ruleType.label,
      };
    });
    return JSON.stringify(ruleTypeOptions, null, 2);
  } catch (err) {
    console.log(err);
    return 'Error fetching Rule Types';
  }
};

const tool = new DynamicTool({
  name: toolName,
  description: description,
  func: fn,
});

export { toolName, description, fn, tool };
