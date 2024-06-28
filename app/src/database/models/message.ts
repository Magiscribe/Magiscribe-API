import mongoose, { Document, Schema } from "mongoose"

interface IMessage extends Document {
    message: string,
    response: IMessageResponse
}

interface IMessageResponse extends Document {
    message: IMessage,
    commandsExecuted: JSON[]
}

const MessageResponseSchema = new Schema<IMessageResponse>({
    message: { type: String, required: true },
    commandsExecuted: [{ type: Schema.Types.Mixed, required: true}] 
});

const MessageSchema = new Schema<IMessage>({
    message: { type: String, required: true }, 
    response: { type: Schema.Types.ObjectId, ref: "MessageResponseSchema", required: true },
}, {timestamps: true}
);

export const Message = mongoose.model<IMessage>('Message', MessageSchema);
export const MessageResponse = mongoose.model<IMessageResponse>('MessageResponse', MessageResponseSchema);
