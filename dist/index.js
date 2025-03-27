"use strict";

const _nodeServerEngine = require("node-server-engine");
const _app = require("./app");
const PORT = process.env.PORT || 8080;

(0, _app.createServer)()
  .init()
  .then((server) => {
    // Explicitly bind to 0.0.0.0 for Cloud Run
    server.listen(PORT, '0.0.0.0', () => {
      console.log(`Server started successfully on ${PORT}`);
      
      // Add basic health check endpoint
      server.get('/health', (req, res) => {
        res.status(200).json({ status: 'healthy' });
      });
    });
  })
  .catch(e => {
    (0, _nodeServerEngine.reportError)(e);
    console.error("Server failed to start:", e);
    // Don't exit - let Cloud Run handle the restart
    process.exitCode = 1; // Instead of process.exit(1)
  });

//  import { reportError } from "node-server-engine";
// import { createServer } from "app";
// import cron from "node-cron";
// import { fetchLinkedInJobs } from "./endpoints/linkedinJobs/linkedIn.handler"; // Import the LinkedIn scraper

// createServer()
//   .init()
//   .then(() => {
//     console.log(`Server started successfully running on ${process.env.PORT}`);

//     // Schedule LinkedIn job fetching daily at midnight
//     cron.schedule("0 0 * * *", async () => {
//       console.log("Running scheduled LinkedIn job fetch...");
//       await fetchLinkedInJobs();
//     });

//     console.log("Scheduled LinkedIn job scraping task.");
//   })
//   .catch((e) => {
//     reportError(e);
//     console.error("Server failed to start:", e);
//     process.exit(1);
//   });
//# sourceMappingURL=index.js.map