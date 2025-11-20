"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const server_1 = require("./server");
const PORT = Number(process.env.PORT ?? 4000);
const app = (0, server_1.buildServer)();
app.listen(PORT, () => {
    console.log(`Ops backend listening on http://localhost:${PORT}`);
});
//# sourceMappingURL=index.js.map