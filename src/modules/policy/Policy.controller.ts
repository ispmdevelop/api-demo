import { Policy } from '../../types/Policy';
import { PolicyRepository } from '../../repository/Policy.repository';
import { Request, Response } from 'express';
import { NetworkResponse } from '../../classes/NetworkReponse';

const policyRepository = new PolicyRepository();

export class PolicyController {
  get(req: Request, res: Response) {
    const policyId = req.query.policy_id as string;
    if (!policyId) {
      return res
        .status(400)
        .json(
          NetworkResponse.CreateErrorResponse('Policy ID is required.', 400)
        );
    }
    const policy = policyRepository.getById(policyId);
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

  create(req: Request, res: Response) {
    const policy = req.body;
    if (!policy) {
      return res
        .status(400)
        .json(
          NetworkResponse.CreateErrorResponse('Please provide a policy', 400)
        );
    }
    const count = policyRepository.create(policy);
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
