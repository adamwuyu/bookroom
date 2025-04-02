import { Context } from "koa";
import { PassThrough } from "stream";

export type ThinkOptions = {
    is_stream?: boolean;
    logLevel?: boolean;
};

class Think {
    private messages: Array<any> | PassThrough | null = [];
    private logLevel?: boolean = true;
    constructor(options: ThinkOptions, ctx?: Context) {
        const { is_stream = false, logLevel = true } = options;
        this.logLevel = logLevel;
        if (is_stream && ctx) {
            const passThroughStream = new PassThrough();
            // 确保在所有数据推送完毕后才调用 end()
            passThroughStream.on('end', () => {
                ctx.res.end();
            })
            passThroughStream.pipe(ctx.res);
            this.messages = passThroughStream;
            ctx.res.on('finish', () => {
                this.end();
            });
        }
    }

    formattedMessage(args: any[]){
        const formattedMessage = args.map(arg => {
            if (typeof arg === 'object') {
                return JSON.stringify(arg, null, 2);
            }
            return arg;
        }).join('');
        return formattedMessage;
    }
    log(...args: any[]) {
        const formattedMessage = this.formattedMessage(args);
        if (!this.logLevel) {
            // console.log(formattedMessage);
            return;
        }
        this.push(formattedMessage);
    }
    output(...args: any[]) {
        const formattedMessage =this.formattedMessage(args)
        this.push(formattedMessage);
    }
    push(message: any) {
        if (this.messages instanceof Array) {
            this.messages.push(message);
        } else if (this.messages instanceof PassThrough) {
            // 判定是否为JSON字符串并写入流中
            if (typeof message === 'object') {
                try {
                    const jsonString = JSON.stringify(message);
                    this.messages.write(jsonString, 'utf8');
                } catch (error) {
                    console.error("写入流时出错:", error);
                }
            } else {
                this.messages.write(message, 'utf8');
            }
        }
    }

    getData() {
        return this.messages;
    }

    toString() {
        if (this.messages instanceof Array) {
            return this.messages.join('\n');
        }
        if (this.messages instanceof PassThrough) {
            return this.messages.read().toString('utf8');
        }
    }

    end() {
        if (this.messages instanceof PassThrough) {
            this.messages.end();
        }
    }
}

export default Think;