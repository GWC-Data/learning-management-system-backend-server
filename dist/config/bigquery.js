"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.tableId = exports.datasetId = exports.companyInfoTableId = exports.bigquery = void 0;
var _path = _interopRequireDefault(require("path"));
var _bigquery = require("@google-cloud/bigquery");
var _dotenv = _interopRequireDefault(require("dotenv"));
// Load environment variables from .env
_dotenv.default.config();

// Correct file path resolution to avoid `dist/` issues
const keyFilePath = process.env.GOOGLE_APPLICATION_CREDENTIALS || _path.default.resolve(process.cwd(), "config", "key.json");

// console.log("Resolved Key File Path:", keyFilePath);
// console.log(process.env.TABLE_USER, 'table id');

const bigquery = exports.bigquery = new _bigquery.BigQuery({
  projectId: process.env.PROJECT_ID,
  // Read from .env
  keyFilename: keyFilePath // Use the resolved path
});
const datasetId = exports.datasetId = process.env.DATASET_ID || "lms";
const tableId = exports.tableId = process.env.TABLE_USER || "users";
const companyInfoTableId = exports.companyInfoTableId = "companyinfo";
//# sourceMappingURL=bigquery.js.map