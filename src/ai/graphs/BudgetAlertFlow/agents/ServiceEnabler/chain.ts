import { AgentStateChannels } from '../../state';
import { GCPApiBlockerService } from '../../../../../services/GCPApiBlockerService';

const gcpApiBlockerService = new GCPApiBlockerService();

export async function serviceEnablerChain(state: AgentStateChannels) {
  const disableService = await gcpApiBlockerService.enableService();
  return {
    message: 'Service has been enabled successfully',
  };
}
