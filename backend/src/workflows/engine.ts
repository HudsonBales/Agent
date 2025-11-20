import { nanoid } from "nanoid";
import { EventBus } from "../core/event-bus";
import { DataStore } from "../data/store";
import { MCPGateway } from "../integrations/mcp-gateway";
import { WorkflowDefinition, WorkflowRun } from "../types";

interface RunContext {
  workspaceId: string;
  actorId: string;
  reason?: string;
}

export class WorkflowEngine {
  private scheduleCursor = new Map<string, number>();
  private timer: NodeJS.Timeout | undefined;

  constructor(private store: DataStore, private gateway: MCPGateway, private bus: EventBus) {}

  listDefinitions(workspaceId: string) {
    return this.store.getWorkflows(workspaceId);
  }

  listRuns(workspaceId: string) {
    return this.store.listWorkflowRuns(workspaceId);
  }

  start() {
    this.stop();
    this.timer = setInterval(() => this.scanSchedules(), 20_000);
  }

  stop() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = undefined;
    }
  }

  private scanSchedules() {
    const definitions = this.store.getWorkflows("ws-demo");
    definitions
      .filter((definition) => definition.trigger.type === "schedule")
      .forEach((definition) => {
        const nextRunAt = this.scheduleCursor.get(definition.id) ?? Date.now();
        if (Date.now() >= nextRunAt) {
          this.runWorkflow(definition.id, {
            workspaceId: definition.workspaceId,
            actorId: "scheduler",
            reason: "schedule"
          });
          this.scheduleCursor.set(definition.id, Date.now() + 60_000);
        }
      });
  }

  async runWorkflow(definitionId: string, context: RunContext) {
    const definition = this.store.getWorkflow(definitionId);
    if (!definition) {
      throw new Error(`Workflow ${definitionId} not found`);
    }
    const run: WorkflowRun = {
      id: `run-${nanoid(8)}`,
      definitionId,
      status: "running",
      startedAt: new Date().toISOString(),
      logs: [`Run triggered by ${context.actorId} (${context.reason ?? "manual"})`]
    };
    this.store.recordWorkflowRun(run);
    try {
      const stepResults: Record<string, unknown> = {};
      for (const step of definition.steps) {
        run.logs.push(`Executing ${step.name}`);
        if (step.type === "tool" || step.type === "notify") {
          const execution = await this.gateway.execute(
            { workspaceId: definition.workspaceId, actorId: context.actorId },
            step.toolId ?? "",
            step.input ?? {}
          );
          stepResults[step.id] = execution;
          run.logs.push(`→ ${step.toolId} responded.`);
        } else if (step.type === "compute") {
          stepResults[step.id] = { value: step.expression ?? "" };
          run.logs.push(`→ Computed expression ${step.expression}`);
        } else if (step.type === "wait") {
          await new Promise((resolve) => setTimeout(resolve, Number(step.input?.duration ?? 500)));
          run.logs.push("→ Wait complete.");
        } else if (step.type === "branch") {
          run.logs.push(`→ Branch evaluated: ${step.condition}`);
        }
      }
      run.status = "succeeded";
      run.completedAt = new Date().toISOString();
      run.output = stepResults;
      this.store.replaceWorkflowRun(run);
      this.bus.emit("workflow.run.completed", { runId: run.id, definitionId });
      return run;
    } catch (error) {
      run.status = "failed";
      run.completedAt = new Date().toISOString();
      run.logs.push(`Error: ${(error as Error).message}`);
      this.store.replaceWorkflowRun(run);
      this.bus.emit("workflow.run.completed", { runId: run.id, definitionId, error: (error as Error).message });
      throw error;
    }
  }
}
