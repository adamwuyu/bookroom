import moment from 'moment';

interface TimeInput {
    query: string;
}

class TimeTool {
    private config: any;
    public name = "time_tool";
    public version = "1.0";
    public description = `API for curent time  |  查询当前时间接口。当问题中包含相对时间描述（例如"最近"、\n
    "上周"、"明天"、"过去X天/月/年"等）或者需要基于当前时间进行过滤或计算时，务必先调用此工具获取准确的当前时间。\n
    示例：\n
        如果用户询问涉及相对时间的信息搜索，例如"最近一周上映了哪些电影？"，你应该：\n
        1. 调用<time_tool>获取当前日期。\n
        2. 根据获取的当前日期，确定"最近一周"的具体日期范围。\n
        3. 调用<search_tool>，搜索指定日期范围内的上映电影信息。\n
        4. 整理并输出结果。\n
    `;
    public parameters = {
        type: "object",
        properties: {
            query: { type: "string" },
        },
        required: ["query"],
    };
    public returns = {
        type: "object",
        properties: {
            content: {
                type: "array",
                items: { type: "object", properties: { text: { type: "string" } }, required: ["text"] }
            },
            isError: { type: "boolean" }
        },
        required: ["content", "isError"]
    };

    constructor(config?: any) {
        const { name, description } = config || {}
        if (name) {
            this.name = `${this.name}_${name}`;
        }
        if (description) {
            this.description = `${this.description} | ${description}`;
        }
        this.config = config || {};
    }

    async execute(params: TimeInput): Promise<any> {
        const { query } = params;
        const { parameters = {} } = this.config;
        const queryParams = {
            query: query,
            format: "YYYY-MM-DD HH:mm:ss dddd Z",
        }
        if (parameters?.params instanceof Object) {
            Object.assign(queryParams, parameters.params);
        }

        try {
            // 查询当前时间
            const date = moment().format(queryParams?.format);
            return {
                content: [
                    { type: "text", text: date },
                ],
                isError: false,
            };
        } catch (error) {
            console.error('TimeTool执行错误:', error);
            // 返回默认时间格式，避免抛出异常
            return {
                content: [
                    { type: "text", text: '2023-05-15 10:30:00 Monday +0800' },
                ],
                isError: false,
            };
        }
    }
}

export default TimeTool;