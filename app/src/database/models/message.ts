import mongoose, { Schema } from "mongoose";

interface IThread {
    subscriptionId: string,
    messages: IMessage[]
}

interface IMessage {
    userId?: string,
    agentId?: string,
    response: IMessageResponse,
}

interface IMessageResponse {
    type: 'text' | 'command' | 'error',
    response?: string,
}

const ThreadSchema = new Schema<IThread>({
    subscriptionId: String,
    messages: [{
        userId: String,
        agentId: String,
        response: {
            type: {
                type: String,
                enum: ['text', 'command', 'error']
            },
            response: String
        },
        createdAt: { type: Date, default: Date.now },
    }]
});

export const Thread = mongoose.model<IThread>('Thread', ThreadSchema);