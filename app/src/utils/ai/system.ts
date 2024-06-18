import { Agent, Capability } from '@database/models/agent';
import log from '@log';

export async function getReasoningPrompt() {
  // TODO: Don't fucking hardcode this.
  log.warn(
    'Getting the Default Agent reasoning prompt. Please deprecate this.',
  );
  const result = await Agent.findOne({ name: 'Default Agent' });
  return {
    system: result?.reasoningPrompt,
    model: result?.reasoningLLMModel,
  };
}

export async function getCapabilityPrompt(alias: string) {
  const result = await Capability.findOne({ alias }).populate('prompts');
  return {
    system: result?.prompts.map((c) => c.text).join('\n'),
    model: result?.llmModel,
  };
}
