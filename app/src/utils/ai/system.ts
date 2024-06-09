import { Agent } from '@database/models/agent';

export async function getAgentPrompt(agent: string) {
  const result = await Agent.findOne({ name: agent }).populate('capabilities');
  return {
    prompt: result?.capabilities.map((c) => c.prompt).join('\n'),
    model: result?.aiModel,
  };
}
