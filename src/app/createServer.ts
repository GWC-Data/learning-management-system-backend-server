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



import { Server, reportDebug, middleware } from 'node-server-engine';
import * as endpoints from 'endpoints';
import { fetchLinkedInJobs } from 'endpoints/linkedinJobs/linkedIn.handler';
 
reportDebug.setNameSpace('learning-management-system-backend');
 
/** Initialize the server */
export function createServer(): Server {
  console.log(endpoints);
  return new Server({
    globalMiddleware: [middleware.swaggerDocs()],
    endpoints: Object.values(endpoints),
    cron: [{ handler: () => fetchLinkedInJobs(), interval: 86400 }]
  });
};