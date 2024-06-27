import mongoose, { Document, Schema } from "mongoose"

interface IMessage extends Document {
    message: string,
    response: IMessageResponse
}

interface IMessageResponse extends Document {
    message: IMessage,
    status: string,
    commandsExecuted: JSON[]
}

const MessageResponseSchema = new Schema<IMessageResponse>({
    message: String, 
    //TO-DO: clarify what this status means. This field tells us whether something is deleted or active but we should just have this on an element object
    status: String, 
    commandsExecuted: [Schema.Types.Mixed] 
});

const MessageSchema = new Schema<IMessage>({
    message: String, 
    response: MessageResponseSchema,
}, {timestamps: true}
);

export const Message = mongoose.model<IMessage>('Message', MessageSchema);
export const MessageResponse = mongoose.model<IMessageResponse>('MessageResponse', MessageResponseSchema);
