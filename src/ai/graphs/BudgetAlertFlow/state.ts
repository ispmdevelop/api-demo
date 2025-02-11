import { END, StateGraphArgs } from '@langchain/langgraph';
import { BaseMessage } from '@langchain/core/messages';
import _ from 'lodash';
import { Policy } from '../../../types/Policy';

export interface AgentStateChannels {
  messages: BaseMessage[];
  notificationPayload: any | null;
  next: string;
}

export const agentStateChannels: StateGraphArgs<AgentStateChannels>['channels'] =
  {
    messages: {
      value: (x?: BaseMessage[], y?: BaseMessage[]) =>
        (x ?? []).concat(y ?? []),
      default: () => [],
    },
    notificationPayload: {
      value: (x?: any | null, y?: Policy | null) => y ?? x ?? null,
      default: () => null,
    },
    next: {
      value: (x?: string, y?: string) => y ?? x ?? END,
      default: () => END,
    },
  };
