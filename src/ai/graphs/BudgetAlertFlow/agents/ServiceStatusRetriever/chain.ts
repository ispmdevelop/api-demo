import { AgentStateChannels } from '../../state';
import { GCPApiBlockerService } from '../../../../../services/GCPApiBlockerService';

const gcpApiBlockerService = new GCPApiBlockerService();

export async function serviceStatusChain(state: AgentStateChannels) {
  const disableService = await gcpApiBlockerService.getServiceStatus();
  return {
    message: 'Service status is: ' + disableService.data.state,
  };
}
