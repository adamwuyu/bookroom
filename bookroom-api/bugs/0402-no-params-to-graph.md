**参数传递问题**：从前端到图谱查询时可能存在参数丢失，请验证

## Bug分析与修复过程总结 (2025-04-02)

### 问题现象
在知识图谱问答功能中，当用户提问需要调用 `graph_db_tool` 时，传递给该工具的参数（特别是 `query`）偶尔会丢失或变成空对象 `{}`。通过前端页面和后端日志观察到：
1.  前端请求时参数看起来是正常的。
2.  后端 Agent 处理流程的日志中，多次出现 `"arguments":"{}"` 的记录。
3.  最终执行 `graph_db_tool` 时，有时参数是正确的（如 `{"query":"冰山模型在心理咨询中的应用"}`），但有时是空的或不完整的。
4.  此问题主要在启用**流式输出 (streaming)** 时出现。

### 根本原因
问题的核心在于 **LLM 流式输出工具调用 (Tool Call) JSON 的机制** 与 **Agent 处理流式响应的逻辑** 之间的交互：

1.  **流式 JSON 片段**：当 LLM 决定调用工具时，它会通过流式接口逐步生成工具调用的 JSON 结构，例如 `{"name": "graph_db_tool", "arguments": {"query": "..."}}`。这个 JSON 会被拆分成多个小片段（chunk）发送。
2.  **不完整的片段**：后端 Agent 的 `getStreamToolCallList` 方法在接收到这些片段时，可能只收到了部分 JSON 字符串，例如 `"arguments":"{"` 或 `"query": "冰山"`。这些片段本身并不是有效的 JSON。
3.  **过早的解析尝试**：`getStreamToolCallList` 或后续的 `handleToolCalls` 方法在尝试处理这些不完整的片段时，进行 JSON 解析会失败。
4.  **触发降级/修复逻辑**：解析失败导致代码中的参数修复逻辑被触发：
    *   尝试将非 JSON 字符串包装成 `{"query": "..."}`。
    *   如果修复失败或参数为空，则使用从上下文中提取的查询（如 `extractedQuery`）。
    *   如果仍然失败，则使用默认查询或空对象 `{}`。
    *   这就是日志中出现多个 `"arguments":"{}"` 以及最终可能使用默认查询的原因。

### 调试过程（引入了代码污染）
为了定位问题，我们执行了以下步骤，其中一些修改（尤其是大量日志）在最终解决方案中应被移除：

1.  **添加全链路日志**：在前端（React 组件）、后端 Controller (`AIGraphController`)、后端 SDK (`LightragAPI`) 以及 Agent (`ToolCallApi`) 的关键路径上添加了详细的日志，追踪参数的传递过程。
2.  **检查参数命名与类型**：验证了前端（驼峰 `topK`, `isStream`）到后端（蛇形 `top_k`, `is_stream`）的参数名映射，并在后端 Controller 中添加了显式的类型转换（确保 `top_k` 为数字，布尔值为布尔值）。
3.  **修复前端编译错误**：解决了在添加日志和修改代码过程中引入的前端导入路径错误和类型问题。
4.  **尝试修改流处理逻辑**：
    *   **方案一（污染）**：修改 `loopToolCalls`，试图根据用户消息关键词（如"查询"、"知识图谱"）动态地将 `is_stream` 切换为 `false`，强制 LLM 非流式返回工具调用。
    *   **方案二（污染）**：修改 `getStreamToolCallList`，增加更复杂的逻辑来缓存和拼接流式 JSON 片段，直到形成有效的 JSON 再进行解析。

### 精准解决方案（推荐）
在还原被污染的代码后，推荐采用以下**最直接且副作用最小**的方案来解决此问题：

**核心思想**：当预期 LLM 可能返回工具调用时，**临时关闭**该次 LLM 请求的流式输出，以获取完整的、非分片的工具调用 JSON。

**实施步骤**：
1.  **定位修改点**：在 `bookroom-api/api/SDK/agent/tool_call/index.ts` 文件中的 `loopToolCalls` 方法内。
2.  **修改逻辑**：
    *   在调用 `this.handleChatCompletion` **之前**。
    *   检查 `params.is_stream` 是否为 `true` **并且** 是否存在 `tools`。
    *   **如果满足以上条件**：创建一个临时的请求参数对象 `requestParams = { ...params }`，并将 `requestParams.is_stream` 设置为 `false`。
    *   调用 `handleChatCompletion` 时传入修改后的 `requestParams`。
    *   **如果 `params.is_stream` 本身就是 `false` 或没有 `tools`**：则直接使用原始的 `params` 调用 `handleChatCompletion`。
3.  **处理响应**：
    *   由于工具调用请求是以非流式发出的，响应会直接进入 `else { ... }` 分支（处理非流式响应）。
    *   该分支可以直接从 `response?.choices?.[0]?.message` 中获取完整的 `tool_calls` 数组，无需处理流式片段。
    *   对于非工具调用的普通文本生成，请求仍将以流式进行（如果原始 `params.is_stream` 为 `true`），保持用户体验。

**代码示例 (在 `loopToolCalls` 中)**：

```typescript
// ... 在 while 循环内，调用 handleChatCompletion 之前 ...

const requestParams = { ...params }; // 创建副本

// 关键逻辑：如果原始请求是流式的，并且有工具，则本次LLM调用强制为非流式
if (params?.is_stream && tools && tools.length > 0) {
    this.think.log("检测到工具存在，临时关闭流式输出以获取完整工具调用参数", "\n\n");
    requestParams.is_stream = false;
}

const response = await this.handleChatCompletion(messages, {
    ...requestParams, // 使用可能已修改的参数
    tools: tools
});

let toolCalls: any[] = [];
let content = "";

// 如果原始请求是流式的，并且响应是流式迭代器 (说明这次调用没有强制关闭流式，是纯文本生成)
if (params?.is_stream && !requestParams.is_stream && (response?.itr || response?.iterator)) { // 注意这里的判断逻辑调整
    // ... 处理流式文本响应 ...
     for await (const chunk of response) {
        // ... (原有流式文本处理逻辑)
        content += chunk.choices[0]?.delta?.content || '';
        this.think.log(chunk.choices[0]?.delta?.content || '');
     }
} else {
    // 处理非流式响应（包括强制关闭流式获取到的工具调用，或原本就非流式的请求）
    const message = response?.choices?.[0]?.message;
    toolCalls = message?.tool_calls || []; // 直接获取完整的工具调用
    content = message?.content || '';
    if (toolCalls.length > 0) {
         this.think.log(`获取到完整工具调用: ${JSON.stringify(toolCalls)}`, "\n\n");
    }
     this.think.log(content); // 输出非流式文本内容
}

// ... 后续处理 toolCalls 和 content 的逻辑不变 ...
```

**优点**：
*   精准解决问题根源（流式 JSON 解析困难）。
*   不影响普通文本回复的流式体验。
*   避免了复杂的流式 JSON 拼接和修复逻辑，代码更简洁健壮。
*   无需在多个文件添加大量临时日志。