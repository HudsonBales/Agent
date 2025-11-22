"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MCPClient = void 0;
const node_child_process_1 = require("node:child_process");
class MCPClient {
    constructor(command, args = []) {
        this.command = command;
        this.args = args;
        this.messageId = 0;
        this.pendingRequests = new Map();
    }
    async connect() {
        return new Promise((resolve, reject) => {
            this.process = (0, node_child_process_1.spawn)(this.command, this.args, {
                stdio: ["pipe", "pipe", "pipe"]
            });
            this.process.on("error", (error) => {
                reject(new Error(`Failed to start MCP process: ${error.message}`));
            });
            this.process.on("exit", (code) => {
                console.log(`MCP process exited with code ${code}`);
            });
            // Handle JSON-RPC responses
            let buffer = "";
            this.process.stdout.on("data", (data) => {
                buffer += data.toString();
                const lines = buffer.split("\n");
                buffer = lines.pop() || ""; // Keep incomplete line in buffer
                for (const line of lines) {
                    if (line.trim()) {
                        try {
                            const response = JSON.parse(line);
                            this.handleResponse(response);
                        }
                        catch (error) {
                            console.error("Failed to parse MCP response:", line, error);
                        }
                    }
                }
            });
            // Send initialize request
            this.sendRequest({
                method: "initialize",
                params: {
                    protocolVersion: "2024-01-01",
                    capabilities: {},
                    clientInfo: {
                        name: "ops-backend-mcp-client",
                        version: "1.0.0"
                    }
                }
            }).then(() => resolve()).catch(reject);
        });
    }
    async listTools() {
        try {
            const tools = await this.sendRequest({
                method: "tools/list"
            });
            return tools.map(tool => ({
                id: tool.name,
                name: tool.name,
                summary: tool.description,
                namespace: this.getNamespace(),
                example: JSON.stringify(tool.inputSchema?.properties || {}),
                version: "1.0",
                capabilities: ["read"]
            }));
        }
        catch (error) {
            console.error("Failed to list MCP tools:", error);
            return [];
        }
    }
    async callTool(name, args) {
        try {
            const result = await this.sendRequest({
                method: "tools/call",
                params: {
                    name,
                    arguments: args
                }
            });
            return result;
        }
        catch (error) {
            console.error(`Failed to call MCP tool ${name}:`, error);
            throw error;
        }
    }
    getNamespace() {
        // Extract namespace from command name
        const commandName = this.command.split("/").pop()?.replace("-server", "") || "unknown";
        return commandName;
    }
    sendRequest(request) {
        return new Promise((resolve, reject) => {
            const id = ++this.messageId;
            this.pendingRequests.set(id, { resolve, reject });
            const message = {
                jsonrpc: "2.0",
                id,
                ...request
            };
            this.process.stdin.write(JSON.stringify(message) + "\n");
        });
    }
    handleResponse(response) {
        if (response.id && this.pendingRequests.has(response.id)) {
            const { resolve, reject } = this.pendingRequests.get(response.id);
            this.pendingRequests.delete(response.id);
            if (response.error) {
                reject(new Error(`${response.error.code}: ${response.error.message}`));
            }
            else {
                resolve(response.result);
            }
        }
    }
    async disconnect() {
        if (this.process) {
            this.process.kill();
        }
    }
}
exports.MCPClient = MCPClient;
//# sourceMappingURL=mcp-client.js.map