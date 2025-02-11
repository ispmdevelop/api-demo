import { AWSBudgetRetriever } from '../../services/AWSBudgetRetriever';
import { getGraph } from '../../ai/graphs/BudgetAlertFlow/index';
import { HumanMessage } from '@langchain/core/messages';
import { GCPApiBlockerService } from '../../services/GCPApiBlockerService';
import { cleanMessageHistory } from '../../ai/graphs/utils/CleanMessage';
const gcpApiBlockerService = new GCPApiBlockerService();

import fs from 'node:fs';

export class BudgetTracker {
  static instance: BudgetTracker;
  isBudgetAlarmActive: boolean | undefined;
  public notificationHistory: any[] = [];

  // implement singleton pattern
  constructor(private readonly awsBudgetRetriever: AWSBudgetRetriever) {
    if (BudgetTracker.instance) {
      return BudgetTracker.instance;
    }
    BudgetTracker.instance = this;
  }

  activeBudgetListener(intervalInMs: number = 60000) {
    console.log('Activating budget listener...');
    setInterval(() => {
      this.processBudgetNotifications();
    }, intervalInMs);
  }

  async processBudgetNotifications() {
    const notificationByBudgetName =
      await this.awsBudgetRetriever.retrieveBudgetNotifications();

    console.log(
      'Processing budget notifications...',
      JSON.stringify(notificationByBudgetName, null, 2)
    );

    for (const budgetName in notificationByBudgetName) {
      const notifications = notificationByBudgetName[budgetName].Notifications;
      if (notifications) {
        for (const notification of notifications) {
          if (notification.NotificationType === 'ACTUAL') {
            this.notificationHistory.push({
              notification,
              time: new Date().toISOString(),
            });
            if (notification.NotificationState) {
              if (notification.NotificationState === 'ALARM') {
                console.log(`Budget ${budgetName} is active`);
                this.isBudgetAlarmActive = true;
              } else {
                console.log(`Budget ${budgetName} is not active`);
                this.isBudgetAlarmActive = false;
              }
              return await this.takeAIaction(notification);
            }
          }
        }
      }
    }
  }

  async takeAIaction(notification: any) {
    if (notification.NotificationState === 'ALARM') {
      await gcpApiBlockerService.disableService();
    } else {
      await gcpApiBlockerService.enableService();
    }
    // const graph = await getGraph();
    // const prompt = `
    // You have a budget alert analyze the following
    // * If the alert NotificationState equals to "ALARM" Disable the service (service-disabler)
    // * If the alert NotificationState equals to "OK" Enable the service (service-enabler)
    // * Other wise do nothing
    // * Always check current state of the service before taking any disable/enable action (service-status-retriever)
    // * Budget Notification: ${JSON.stringify(notification, null, 2)}`;
    // const result = await graph.invoke({
    //   messages: [new HumanMessage(prompt)],
    //   notificationPayload: notification,
    // });
    // console.log('AI Action Result:', result);
    // return result;
  }
}
