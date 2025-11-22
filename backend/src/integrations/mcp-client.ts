import { spawn } from "node:child_process";
import { ToolDescription } from "../types";

interface MCPTool {
  name: string;
  description: string;
  inputSchema: any;
}

interface MCPRequest {
  method: string;
  params?: any;
}

interface MCPResponse {
  id?: number;
  result?: any;
  error?: {
    code: number;
    message: string;
  };
}

export class MCPClient {
  private process: any;
  private messageId: number = 0;
  private pendingRequests: Map<number, { resolve: Function; reject: Function }> = new Map();

  constructor(private command: string, private args: string[] = []) {}

  async connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.process = spawn(this.command, this.args, {
        stdio: ["pipe", "pipe", "pipe"]
      });

      this.process.on("error", (error: Error) => {
        reject(new Error(`Failed to start MCP process: ${error.message}`));
      });

      this.process.on("exit", (code: number) => {
        console.log(`MCP process exited with code ${code}`);
      });

      // Handle JSON-RPC responses
      let buffer = "";
      this.process.stdout.on("data", (data: Buffer) => {
        buffer += data.toString();
        const lines = buffer.split("\n");
        buffer = lines.pop() || ""; // Keep incomplete line in buffer

        for (const line of lines) {
          if (line.trim()) {
            try {
              const response: MCPResponse = JSON.parse(line);
              this.handleResponse(response);
            } catch (error) {
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

  async listTools(): Promise<ToolDescription[]> {
    try {
      const tools: MCPTool[] = await this.sendRequest({
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
    } catch (error) {
      console.error("Failed to list MCP tools:", error);
      return [];
    }
  }

  async callTool(name: string, args: Record<string, unknown>): Promise<any> {
    try {
      const result = await this.sendRequest({
        method: "tools/call",
        params: {
          name,
          arguments: args
        }
      });
      return result;
    } catch (error) {
      console.error(`Failed to call MCP tool ${name}:`, error);
      throw error;
    }
  }

  private getNamespace(): string {
    // Extract namespace from command name
    const commandName = this.command.split("/").pop()?.replace("-server", "") || "unknown";
    return commandName;
  }

  private sendRequest(request: MCPRequest): Promise<any> {
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

  private handleResponse(response: MCPResponse): void {
    if (response.id && this.pendingRequests.has(response.id)) {
      const { resolve, reject } = this.pendingRequests.get(response.id)!;
      this.pendingRequests.delete(response.id);

      if (response.error) {
        reject(new Error(`${response.error.code}: ${response.error.message}`));
      } else {
        resolve(response.result);
      }
    }
  }

  async disconnect(): Promise<void> {
    if (this.process) {
      this.process.kill();
    }
  }
}