// Note: Any model prefixed with "" is a cross-region inference model.
//       Cross-region inference uses inference profiles to increase throughput and
//       improve resiliency (hopefully) by routing your requests across multiple AWS Regions
//       during peak utilization bursts.
//
//       During peak usage, these models may be more expensive than models that are not
//       prefixed with "" as they incur additional costs for cross-region data transfer.
//       Latency will also be higher for cross-region models when they get routed to a
//       different region.
//
//       For more information, see https://docs.aws.amazon.com/bedrock/latest/userguide/cross-region-inference.html.

export const LLM_MODELS_VERSION = {
  CLAUDE_3_HAIKU: {
    id: 'anthropic.claude-3-haiku-20240307-v1:0',
    name: 'Claude 3 Haiku',
    region: 'us-east-1',
  },
  CLAUDE_3_5_HAIKU: {
    id: 'anthropic.claude-3-5-haiku-20241022-v1:0',
    name: 'Claude 3.5 Haiku',
    region: 'us-west-2',
  },
  CLAUDE_3_5_SONNET: {
    id: 'anthropic.claude-3-5-sonnet-20240620-v1:0',
    name: 'Claude 3.5 Sonnet',
    region: 'us-east-1',
  },
  CLAUDE_3_5_SONNET_V2: {
    id: 'anthropic.claude-3-5-sonnet-20241022-v2:0',
    name: 'Claude 3.5 Sonnet v2',
    region: 'us-east-1',
  },
  REGIONAL_CLAUDE_3_HAIKU: {
    id: 'us.anthropic.claude-3-haiku-20240307-v1:0',
    name: 'Regional Claude 3 Haiku',
    region: 'us-east-1',
  },
  REGIONAL_CLAUDE_3_5_HAIKU: {
    id: 'us.anthropic.claude-3-5-haiku-20241022-v1:0',
    name: 'Regional Claude 3.5 Haiku',
    region: 'us-east-1',
  },
  REGIONAL_CLAUDE_3_5_SONNET: {
    id: 'us.anthropic.claude-3-5-sonnet-20240620-v1:0',
    name: 'Regional Claude 3.5 Sonnet',
    region: 'us-east-1',
  },
  REGIONAL_CLAUDE_3_5_SONNET_V2: {
    id: 'us.anthropic.claude-3-5-sonnet-20241022-v2:0',
    name: 'Regional Claude 3.5 Sonnet v2',
    region: 'us-east-1',
  },
  REGIONAL_CLAUDE_4_SONNET: {
    id: 'us.anthropic.claude-sonnet-4-20250514-v1:0',
    name: 'Regional Claude 4 Sonnet',
    region: 'us-east-1',
  },
  LLAMA_3_2_1B_INSTRUCT: {
    id: 'meta.llama3-2-3b-instruct-v1:0',
    name: 'Llama 3.2 1B Instruct',
    region: 'us-east-1',
  },
  LLAMA_3_2_3B_INSTRUCT: {
    id: 'meta.llama3-2-3b-instruct-v1:0',
    name: 'Llama 3.2 3B Instruct',
    region: 'us-east-1',
  },
  LLAMA_3_2_11B_INSTRUCT: {
    id: 'meta.llama3-2-11b-instruct-v1:0',
    name: 'Llama 3.2 11B Instruct',
    region: 'us-east-1',
  },
  LLAMA_3_2_90B_INSTRUCT: {
    id: 'meta.llama3-2-90b-instruct-v1:0',
    name: 'Llama 3.2 90B Instruct',
    region: 'us-east-1',
  },
  MISTRAL_7B_INSTRUCT: {
    id: 'mistral.mistral-7b-instruct-v0:2',
    name: 'Mistral 7B Instruct',
    region: 'us-east-1',
  },
  MISTRAL_8X7B_INSTRUCT: {
    id: 'mistral.mixtral-8x7b-instruct-v0:1',
    name: 'Mistral 8x7B Instruct',
    region: 'us-east-1',
  },
  MISTRAL_LARGE: {
    id: 'mistral.mistral-large-2402-v1:0',
    name: 'Mistral Large',
    region: 'us-east-1',
  },
  MISTRAL_SMALL: {
    id: 'mistral.mistral-small-2402-v1:0',
    name: 'Mistral Small',
    region: 'us-east-1',
  },
};
