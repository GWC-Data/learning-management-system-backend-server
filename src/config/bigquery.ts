import path from "path";
import fs from "fs";
import { BigQuery } from "@google-cloud/bigquery";
import { GoogleAuth } from "google-auth-library";
import dotenv from "dotenv";

// Load environment variables from .env
dotenv.config();

// Enhanced environment variable validation
const validateEnv = () => {
  if (!process.env.PROJECT_ID) {
    console.warn("⚠️ PROJECT_ID not set in .env file");
  }
  if (!process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    console.warn("⚠️ GOOGLE_APPLICATION_CREDENTIALS not set in .env file");
  }
};

validateEnv();

// Resolve key file path with better validation
const getKeyFilePath = (): string => {
  const envPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
  const defaultPath = path.resolve(__dirname, "..", "config", "key.json");
  
  const keyFilePath = envPath || defaultPath;
  
  if (!fs.existsSync(keyFilePath)) {
    throw new Error(`❌ Service account key file not found at: ${keyFilePath}. 
      Please ensure the file exists or set GOOGLE_APPLICATION_CREDENTIALS in your .env file`);
  }

  return keyFilePath;
};

const keyFilePath = getKeyFilePath();

// Initialize BigQuery client with enhanced configuration
export const bigquery = new BigQuery({
  projectId: process.env.PROJECT_ID as string,
  keyFilename: keyFilePath,
  autoRetry: true,
  maxRetries: 3,
  retryOptions: {
    autoRetry: true,
    maxRetries: 3,
    maxRetryDelay: 60,
    totalTimeout: 600,
  },
});

export const datasetId: string = process.env.DATASET_ID || "lms";
export const tableId: string = process.env.TABLE_USER || "users";
export const companyInfoTableId: string = "companyinfo";

// Enhanced connection test with JWT validation
const testBigQueryConnection = async (): Promise<void> => {
  try {
    console.log("🔍 Testing BigQuery connection...");
    console.log(`ℹ️ Using project ID: ${process.env.PROJECT_ID}`);
    console.log(`ℹ️ Using key file: ${keyFilePath}`);

    // First validate the JWT token can be created
    const auth = new GoogleAuth({
      keyFilename: keyFilePath,
      scopes: ["https://www.googleapis.com/auth/cloud-platform"],
    });

    console.log("🔑 Attempting to authenticate...");
    const client = await auth.getClient();
    console.log("✅ Authentication successful");

    // Verify we can get an access token
    const token = await client.getAccessToken();
    console.log("🔑 Access token obtained successfully");

    // Then test BigQuery access
    console.log("📊 Testing BigQuery dataset access...");
    const [datasets] = await bigquery.getDatasets();
    
    console.log("\n✅ BigQuery connected successfully!");
    console.log(`📂 Available datasets: ${datasets.map(dataset => dataset.id).join(", ")}`);
    console.log(`⏱️ Current server time: ${new Date().toISOString()}`);
    
  } catch (error) {
    console.error("\n❌ BigQuery connection failed:");
    const err = error as Error;
    
    console.error("🔴 Error message:", err.message);
    
    if (err.message.includes("invalid_grant") || err.message.includes("JWT")) {
      console.error("\n🔍 JWT Signature Issue Detected. Possible solutions:");
      console.error("1. Verify your service account key file is valid and not corrupted");
      console.error("2. Check your system clock is synchronized (current time: " + new Date() + ")");
      console.error("3. Ensure the service account has proper BigQuery permissions");
      console.error("4. Try regenerating the service account key file");
      
      // Additional debug for JWT issues
      try {
        const keyFile = JSON.parse(fs.readFileSync(keyFilePath, "utf8"));
        console.log("\nℹ️ Service account info:");
        console.log("- Client email:", keyFile.client_email);
        console.log("- Project ID:", keyFile.project_id);
        console.log("- Token URI:", keyFile.token_uri);
      } catch (e) {
        console.error("⚠️ Failed to parse key file - may be corrupted");
      }
    }
    
    console.error("\n🔧 Additional troubleshooting:");
    console.error("- Verify .env file contains PROJECT_ID and GOOGLE_APPLICATION_CREDENTIALS");
    console.error("- Check the service account has 'BigQuery User' role at minimum");
    console.error("- Ensure the key file path is correct:", keyFilePath);
    
    process.exit(1);
  }
};

// Execute connection test
testBigQueryConnection();