import { Budgets } from 'aws-sdk';
import {
  DescribeBudgetsRequest,
  DescribeNotificationsForBudgetResponse,
} from 'aws-sdk/clients/budgets';

const budgets = new Budgets({ region: 'us-east-1' });
const accountId = process.env.AWS_ACCOUNT_ID || '';

export class AWSBudgetRetriever {
  async retrieveBudgetNotifications() {
    const budgetMap: { [x: string]: any } = {};
    try {
      // 1. Describe all budgets for the account
      const describeBudgetsParams: DescribeBudgetsRequest = {
        AccountId: accountId,
      };

      const budgetsData = await budgets
        .describeBudgets(describeBudgetsParams)
        .promise();
      const budgetList = budgetsData.Budgets || [];

      if (budgetList.length === 0) {
        console.log('No budgets found for this account.');
        return;
      }

      // 2. For each budget, describe notifications
      for (const budget of budgetList) {
        const budgetName = budget.BudgetName;

        // Prepare params for describing notifications for this budget
        const describeNotificationsParams = {
          AccountId: accountId,
          BudgetName: budgetName,
        };

        try {
          const notificationData: DescribeNotificationsForBudgetResponse =
            await budgets
              .describeNotificationsForBudget(describeNotificationsParams)
              .promise();

          budgetMap[budgetName] = notificationData;
        } catch (notifErr) {
          console.error(
            `Error describing notifications for budget "${budgetName}":`,
            notifErr
          );
        }
      }
    } catch (err) {
      console.error('Error describing budgets:', err);
    }

    return budgetMap;
  }
}
