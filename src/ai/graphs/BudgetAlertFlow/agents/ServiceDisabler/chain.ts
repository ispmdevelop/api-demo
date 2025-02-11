import { AgentStateChannels } from '../../state';
import { GCPApiBlockerService } from '../../../../../services/GCPApiBlockerService';

const gcpApiBlockerService = new GCPApiBlockerService();

export async function serviceDisablerChain(state: AgentStateChannels) {
  await gcpApiBlockerService.disableService();

  setTimeout(() => {
    gcpApiBlockerService.enableService();
  }, 30000);

  return {
    message: 'Service has been disable successfully',
  };
}
