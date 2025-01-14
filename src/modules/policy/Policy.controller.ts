import { PolicyRepository } from '../../repository/Policy.repository';
import { Request, Response } from 'express';
import { NetworkResponse } from '../../classes/NetworkResponse';
import { getGraph } from '../../ai/graphs/SourceConversionToCIR';
import { BaseMessage, HumanMessage } from '@langchain/core/messages';

const policyRepository = new PolicyRepository();

export class PolicyController {
  async conversion(req: Request, res: Response) {
    const graph = await getGraph();
    const completion = await graph.invoke({
      messages: [new HumanMessage(req.body.userInput)],
    });
    const messages = completion.messages as BaseMessage[];
    const formattedMessages = messages.map((message) => {
      return {
        type: message.getType(),
        text: message.content,
      };
    });
    return res.status(200).json(
      NetworkResponse.CreateSuccessResponse(
        {
          messages: formattedMessages,
          sourcePolicy: completion.sourcePolicy,
          translatedPolicy: completion.translatedPolicy,
          deliverPolicy: completion.generatedPolicy,
        },
        'Conversion successful.',
        200
      )
    );
  }

  async get(req: Request, res: Response) {
    const policyId = req.query.policy_id as string;
    if (!policyId) {
      return res
        .status(400)
        .json(
          NetworkResponse.CreateErrorResponse('Policy ID is required.', 400)
        );
    }
    console.log('policyId', policyId);
    const policy = await policyRepository.getById(policyId);
    if (!policy) {
      return res
        .status(404)
        .json(NetworkResponse.CreateErrorResponse('Policy not found.', 404));
    }

    return res
      .status(200)
      .json(
        NetworkResponse.CreateSuccessResponse(policy, 'Policy found.', 200)
      );
  }

  async create(req: Request, res: Response) {
    console.log('params', req.params);
    const cloudType = req.params.cloudType as string;
    const policy = req.body;
    if (!policy) {
      return res
        .status(400)
        .json(
          NetworkResponse.CreateErrorResponse('Please provide a policy', 400)
        );
    }
    const count = await policyRepository.create(policy, cloudType);
    return res
      .status(201)
      .json(
        NetworkResponse.CreateSuccessResponse(
          { count: count },
          'Policy created.',
          201
        )
      );
  }
}
