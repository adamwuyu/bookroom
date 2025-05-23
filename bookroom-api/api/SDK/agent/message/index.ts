import { v4 as uuidv4 } from 'uuid';

export enum Role {
    USER = "user",
    ASSISTANT = "assistant",
    SYSTEM = "system",
    TOOL = "tool",
    FUNCTION = "function"
}


export interface MessageType {
    id?: string;
    name?: string; // 函数或者工具名
    role?: Role;
    content?: any;
    images?: any[];
    audios?: any[];
    videos?: any[];
    tool_calls?: Array<any>; // 工具调用数组
    tool_call_id?: string; // 工具调用ID
}

export type MessageArray = Array<MessageType>;

export const createUserMessage = (params: MessageType): MessageType => {
    const message: MessageType = {
        id: params?.id || uuidv4(),
        role: Role.USER,
        content: params?.content
    };
    if (params?.images) {
        message.images = params.images;
    }
    if (params?.audios) {
        message.audios = params.audios;
    }
    if (params?.videos) {
        message.videos = params.videos;
    }

    return message;
};

export const createAssistantMessage = (params: MessageType): MessageType => {
    const message: MessageType = {
        id: params?.id || uuidv4(),
        role: Role.ASSISTANT,
        content: params?.content,
    }
    if (params.tool_calls && Array.isArray(params.tool_calls)) {
        message.tool_calls = [
            ...params.tool_calls, // 这里需要处理一下，因为tool_calls是一个数组，不能直接结构
        ];
    }
    return message
};

export const createSystemMessage = (params: MessageType): MessageType => {
    return {
        id: params?.id || uuidv4(),
        role: Role.SYSTEM,
        content: params?.content
    };
};


export const createToolMessage = (params: MessageType): MessageType => {
    return {
        id: params?.id || uuidv4(),
        name: params.name,
        role: Role.TOOL,
        tool_call_id: params.tool_call_id,
        content: params.content,
    };
};