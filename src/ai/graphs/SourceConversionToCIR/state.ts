import { END, StateGraphArgs } from '@langchain/langgraph';
import { BaseMessage } from '@langchain/core/messages';
import _ from 'lodash';
import { Policy } from '../../../types/Policy';
import { cleanMessageHistory } from '../utils/CleanMessage';

export interface AgentStateChannels {
  messages: BaseMessage[];
  sourcePolicy: Policy | null;
  generatedPolicy: Policy | null;
  translatedPolicy: Policy | null;
  next: string;
}

export const agentStateChannels: StateGraphArgs<AgentStateChannels>['channels'] =
  {
    messages: {
      value: (x?: BaseMessage[], y?: BaseMessage[]) =>
        (x ?? []).concat(y ?? []),
      default: () => [],
    },
    sourcePolicy: {
      value: (x?: Policy | null, y?: Policy | null) => y ?? x ?? null,
      default: () => null,
    },
    generatedPolicy: {
      value: (x?: Policy | null, y?: Policy | null) => y ?? x ?? null,
      default: () => null,
    },
    translatedPolicy: {
      value: (x?: Policy | null, y?: Policy | null) => y ?? x ?? null,
      default: () => null,
    },
    next: {
      value: (x?: string, y?: string) => y ?? x ?? END,
      default: () => END,
    },
  };
