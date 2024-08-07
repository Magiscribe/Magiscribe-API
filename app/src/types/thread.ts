export enum MessageResponseTypes {
  Text = 'text',
  Command = 'command',
  Error = 'error',
}

export interface Thread {
  subscriptionId: string;
  messages: Message[];
}

interface Message {
  userId?: string;
  agentId?: string;
  response: MessageResponse;
}

interface MessageResponse {
  type: MessageResponseTypes;
  response: string;
}
