import { Agent, Capability } from '@database/models/agent';
import log from '@log';

export async function getReasoningPrompt() {
  // TODO: Don't fucking hardcode this.
  log.warn(
    'Getting the Default Agent reasoning prompt. Please deprecate this.',
  );
  const result = await Agent.findOne({ name: 'Default Agent' });
  return result?.reasoningPrompt;
}

export async function getCapabilityPrompt(alias: string) {
  const result = await Capability.findOne({ alias }).populate('prompts');
  return result?.prompts.map((c) => c.text).join('\n');
}
