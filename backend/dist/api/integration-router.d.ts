import { DataStore } from "../data/store";
import { MCPGateway } from "../integrations/mcp-gateway";
interface IntegrationDeps {
    store: DataStore;
    gateway: MCPGateway;
}
export declare function createIntegrationRouter(deps: IntegrationDeps): import("express-serve-static-core").Router;
export {};
//# sourceMappingURL=integration-router.d.ts.map