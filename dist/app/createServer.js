"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.createServer = createServer;
var _nodeServerEngine = require("node-server-engine");
var endpoints = _interopRequireWildcard(require("../endpoints"));
var _linkedIn = require("../endpoints/linkedinJobs/linkedIn.handler");
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && {}.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
// import {Server, reportDebug, middleware} from 'node-server-engine';
// import * as endpoints from 'endpoints';

// reportDebug.setNameSpace('learning-management-system-backend');

// /** Initialize the server */
// export function createServer(): Server {
//   console.log(endpoints);
//   return new Server({
//     globalMiddleware: [middleware.swaggerDocs()],
//     endpoints: Object.values(endpoints)
//   });
// }

_nodeServerEngine.reportDebug.setNameSpace('learning-management-system-backend');

/** Initialize the server */
function createServer() {
  console.log(endpoints);
  return new _nodeServerEngine.Server({
    globalMiddleware: [_nodeServerEngine.middleware.swaggerDocs()],
    endpoints: Object.values(endpoints),
    cron: [{
      handler: () => (0, _linkedIn.fetchLinkedInJobs)(),
      interval: 86400
    }]
  });
}
//# sourceMappingURL=createServer.js.map