import path from "path";
import { BigQuery } from "@google-cloud/bigquery";
import dotenv from "dotenv";

// Load environment variables from .env
dotenv.config();

// Resolve key file path
const keyFilePath: string = process.env.GOOGLE_APPLICATION_CREDENTIALS || path.resolve(process.cwd(), "config", "key.json");

// Initialize BigQuery client
export const bigquery = new BigQuery({
  projectId: process.env.PROJECT_ID as string,
  keyFilename: keyFilePath,
});

export const datasetId: string = process.env.DATASET_ID || "lms";
export const tableId: string = process.env.TABLE_USER || "users";
export const companyInfoTableId: string = "companyinfo";

// Test BigQuery Connection
const testBigQueryConnection = async (): Promise<void> => {
  try {
    const [datasets] = await bigquery.getDatasets();
    console.log("✅ BigQuery connected successfully!");
    console.log(`Available datasets: ${datasets.map(dataset => dataset.id).join(", ")}`);
  } catch (error) {
    console.error("❌ Failed to connect to BigQuery:", (error as Error).message);
  }
};

testBigQueryConnection();
