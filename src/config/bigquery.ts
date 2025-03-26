import path from "path";
import { BigQuery } from "@google-cloud/bigquery";
import dotenv from "dotenv";

// Load environment variables from .env
dotenv.config();

// Correct file path resolution to avoid `dist/` issues
const keyFilePath = process.env.GOOGLE_APPLICATION_CREDENTIALS || path.resolve(process.cwd(), "config", "key.json");


// console.log("Resolved Key File Path:", keyFilePath);
// console.log(process.env.TABLE_USER, 'table id');

export const bigquery = new BigQuery({
    projectId: process.env.PROJECT_ID, // Read from .env
    keyFilename: keyFilePath, // Use the resolved path
});

export const datasetId = process.env.DATASET_ID || "lms";
export const tableId = process.env.TABLE_USER || "users"; 
export const companyInfoTableId = "companyinfo";