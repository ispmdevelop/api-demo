import {
  CloudTrailClient,
  LookupEventsCommand,
  LookupEventsCommandInput,
} from "@aws-sdk/client-cloudtrail";

type CloudTrailFilter = {
  key: string;
  value: string;
};

type GetCloudTrailEventsParams = {
  startTime?: string;
  endTime?: string;
  filters: CloudTrailFilter[];
  fetchLastMinutes: number;
};

const minutesInMilliseconds = 60000;

export class AWSCloudTrailRetriever {
  client: CloudTrailClient;

  constructor() {
    this.client = new CloudTrailClient({ region: "us-east-1" });
  }

  async getCloudTrailEvents(params: GetCloudTrailEventsParams) {
    let startTime = params.startTime ? new Date(params.startTime) : undefined;
    let endTime = params.endTime ? new Date(params.endTime) : undefined;

    if (!startTime) {
      startTime = new Date(
        Date.now() - (params.fetchLastMinutes || 5) * minutesInMilliseconds,
      );
    }

    if (!endTime) {
      endTime = new Date(Date.now());
    }

    const filters = params.filters || [];
    const lookupAttributes = filters.map((filter) => {
      return { AttributeKey: filter.key, AttributeValue: filter.value };
    });

    const commandParams: LookupEventsCommandInput = {
      StartTime: startTime,
      EndTime: endTime,
      LookupAttributes: lookupAttributes as any,
    };

    console.log("cloudtrails params: ", commandParams);

    const command = new LookupEventsCommand(commandParams);
    const response = await this.client.send(command);

    const events = response.Events;

    return events;
  }
}
