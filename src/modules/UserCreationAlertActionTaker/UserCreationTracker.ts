import { AWSCloudTrailRetriever } from "../../services/AWSCloudTrailRetriever";
import { AWSIamUserRetriever } from "../../services/AWSIamUserRetriever";
import { GCPRoleBindingBlocker } from "../../services/GCPBRoleBindingBlocker";

const ControledPolicies = ["AdministratorAccess"];

export class UserCreationTracker {
  static instance: UserCreationTracker;
  public eventHistory: any[] = [];
  public eventIdProcessed = new Set();

  constructor(
    private readonly awsCloudTrailRetriever: AWSCloudTrailRetriever,
    private readonly awsIamUserRetriever: AWSIamUserRetriever,
    private readonly gcpRoleBindingBlocker: GCPRoleBindingBlocker,
  ) {
    if (UserCreationTracker.instance) {
      return UserCreationTracker.instance;
    }
    UserCreationTracker.instance = this;
  }

  activate(intervalInMs: number = 60000) {
    console.log("Activating userCreationTracker listener...");
    //First fast execution
    setTimeout(() => {
      this.process();
    }, 1000);

    //Following executions
    setInterval(() => {
      this.process();
    }, intervalInMs);
  }

  async process() {
    console.log("process user creation tracker");
    const events =
      (await this.awsCloudTrailRetriever.getCloudTrailEvents({
        fetchLastMinutes: 1440 * 2,
        filters: [{ key: "EventName", value: "CreateUser" }],
      })) || [];

    for (const event of events) {
      console.log("Event: ", event);
      const userResource = event["Resources"]?.find((record) =>
        record.ResourceName?.includes("arn:"),
      );

      if (!userResource?.ResourceName) {
        continue;
      }

      const policies = await this.awsIamUserRetriever.getUserByArn(
        userResource.ResourceName,
      );

      console.log("Policies found: ", policies);

      const assignedControlledPolicies = policies.filter((policy) => {
        return ControledPolicies.includes(policy.PolicyName || "");
      });

      if (assignedControlledPolicies.length <= 0) {
        continue;
      }

      if (this.eventIdProcessed.has(event.EventId)) {
        continue;
      }

      this.eventIdProcessed.add(event.EventId);

      console.log(
        "Found controlled policies on new User:",
        assignedControlledPolicies,
      );

      this.eventHistory.push({
        message: "Found Controlled policies on new User",
        policies: assignedControlledPolicies,
        userResource: userResource,
        cloudEvent: event,
      });

      return await this.takeAction(event, userResource);
    }
  }

  async takeAction(event: any, userResource: any) {
    console.log("taking action");
    await this.gcpRoleBindingBlocker.blockIamBindigsWithPermissions({
      eventId: event.EventId,
    });
  }
}
