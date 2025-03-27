import { reportError } from "node-server-engine";
import { createServer } from "app";

createServer()
  .init()
  .then(() => {
    console.log(`Server started successfully running on  ${process.env.PORT}`);
  })
  .catch((e) => {
    reportError(e);
    console.error("Server failed to start:", e);
    process.exit(1);
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
