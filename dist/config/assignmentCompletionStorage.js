"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.uploadAssignmentCompletionFileToGCS = exports.deleteAssignmentCompletionFileFromGCS = void 0;
var _storageConfig = require("./storageConfig");
const uploadAssignmentCompletionFileToGCS = async (fileBuffer, fileName, mimeType) => {
  try {
    const filePath = `${_storageConfig.assignmentCompletionFolder}/${fileName}`;
    const file = _storageConfig.bucket.file(filePath);
    const stream = file.createWriteStream({
      metadata: {
        contentType: mimeType || "application/octet-stream"
      }
    });
    return new Promise((resolve, reject) => {
      stream.on("error", err => reject("Failed to upload answer file to GCS"));
      stream.on("finish", () => resolve(`https://storage.googleapis.com/${_storageConfig.bucket.name}/${filePath}`));
      stream.end(fileBuffer);
    });
  } catch (error) {
    throw new Error("Failed to upload answer file to GCS");
  }
};
exports.uploadAssignmentCompletionFileToGCS = uploadAssignmentCompletionFileToGCS;
const deleteAssignmentCompletionFileFromGCS = async fileName => {
  try {
    const filePath = `${_storageConfig.assignmentCompletionFolder}/${fileName}`;
    await _storageConfig.bucket.file(filePath).delete();
  } catch (error) {
    throw new Error("Failed to delete answer file from GCS");
  }
};
exports.deleteAssignmentCompletionFileFromGCS = deleteAssignmentCompletionFileFromGCS;
//# sourceMappingURL=assignmentCompletionStorage.js.map