import mongoose, { Document, Schema } from "mongoose"

interface IMessage extends Document {
    message: string,
    response: mongoose.Types.ObjectId | IMessageResponse
}

interface IMessageResponse extends Document {
    message: IMessage,
    status: string,
    commandsExecuted: JSON[]
}

const MessageResponseSchema = new Schema({
    message: String, 
    status: String,
});

const MessageSchema = new Schema<IMessage>({
    message: String, 
    response: MessageResponseSchema,
}, {timestamps: true}
);

export const Message = mongoose.model<IMessage>('Message', MessageSchema);
export const MessageResponse = mongoose.model<IMessageResponse>('MessageResponse', MessageResponseSchema);
