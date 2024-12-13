import { START, StateGraph } from '@langchain/langgraph';
import { AgentStateChannels, agentStateChannels } from './state';
import { NodeName as QANodeName, QANode } from '../agents/QAAgent';
import {
  NodeName as PolicyRegisterName,
  PolicyRegisterNode,
} from '../agents/PolicyRegister';
import {
  NodeName as PolicyLanguageTranslatorName,
  PolicyLanguageTranslatorNode,
} from '../agents/PolicyTranslator';
import {
  NodeName as PolicyRetrieverName,
  PolicyRetrieverNode,
} from '../agents/PolicyRetriever';
import { getSupervisorChain } from './supervisorChain';

export const getGraph = async () => {
  const members: any[] = [
    QANodeName,
    PolicyRetrieverName,
    PolicyLanguageTranslatorName,
    PolicyRegisterName,
  ];

  const supervisorChain = await getSupervisorChain(members);

  const workflow = new StateGraph({
    channels: agentStateChannels,
  })
    .addNode(QANodeName, QANode)
    .addNode(PolicyRetrieverName, PolicyRetrieverNode)
    .addNode(PolicyLanguageTranslatorName, PolicyLanguageTranslatorNode)
    .addNode(PolicyRegisterName, PolicyRegisterNode)
    .addNode('supervisor', supervisorChain);

  workflow.addEdge(START, 'supervisor');

  workflow.addConditionalEdges('supervisor', (x: AgentStateChannels) => x.next);

  members.forEach((member) => {
    workflow.addEdge(member, 'supervisor');
  });

  const graph = workflow.compile({});

  return graph;
};
