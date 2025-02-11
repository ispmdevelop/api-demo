import { START, StateGraph } from '@langchain/langgraph';
import { AgentStateChannels, agentStateChannels } from './state';
import {
  NodeName as ServiceDisablerName,
  ServiceDisablerNode,
} from './agents/ServiceDisabler';
import {
  NodeName as ServiceStatusRetrieverName,
  ServiceStatusRetrieverNode,
} from './agents/ServiceStatusRetriever';
import {
  NodeName as ServiceStatusEnablerName,
  ServiceEnablerNode,
} from './agents/ServiceEnabler';
import { getSupervisorChain } from './supervisorChain';

export const getGraph = async () => {
  const members: any[] = [
    ServiceStatusRetrieverName,
    ServiceDisablerName,
    ServiceStatusEnablerName,
  ];

  const supervisorChain = await getSupervisorChain(members);

  const workflow = new StateGraph({
    channels: agentStateChannels,
  })
    .addNode(ServiceStatusRetrieverName, ServiceStatusRetrieverNode)
    .addNode(ServiceDisablerName, ServiceDisablerNode)
    .addNode(ServiceStatusEnablerName, ServiceEnablerNode)
    .addNode('supervisor', supervisorChain);

  workflow.addEdge(START, 'supervisor');

  workflow.addConditionalEdges('supervisor', (x: AgentStateChannels) => x.next);

  members.forEach((member) => {
    workflow.addEdge(member, 'supervisor');
  });

  const graph = workflow.compile({});

  return graph;
};
