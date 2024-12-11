import { DynamicTool } from '@langchain/core/tools';
import { DBService } from '../../../../../services/dbService';
import { RuleDepartment } from '../../../../../types/RuleDeparment';

const toolName = 'Get Rule Departments';

const description = 'Get Rule Departments Options';

const fn = async (): Promise<string> => {
  try {
    const departments = await DBService.getRuleDepartments();
    const departmentOptions = departments.map((department: RuleDepartment) => {
      return {
        value: department.name,
        label: department.label,
      };
    });
    return JSON.stringify(departmentOptions, null, 2);
  } catch (err) {
    console.log(err);
    return 'Error fetching Rule Departments';
  }
};

const tool = new DynamicTool({
  name: toolName,
  description: description,
  func: fn,
});

export { toolName, description, fn, tool };
