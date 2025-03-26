"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.uploadMaterialForClassToGCS = exports.deleteClassFilesFromGCS = void 0;
var _storageConfig = require("./storageConfig");
const uploadMaterialForClassToGCS = async (fileBuffer, fileName, mimeType) => {
  try {
    const filePath = `${_storageConfig.classFolder}/${fileName}`;
    const file = _storageConfig.bucket.file(filePath);
    const stream = file.createWriteStream({
      metadata: {
        contentType: mimeType || "application/octet-stream"
      }
    });
    return new Promise((resolve, reject) => {
      stream.on("error", err => reject("Failed to upload materialForClass to GCS"));
      stream.on("finish", () => resolve(`https://storage.googleapis.com/${_storageConfig.bucket.name}/${filePath}`));
      stream.end(fileBuffer);
    });
  } catch (error) {
    throw new Error("Failed to upload materialForClass to GCS");
  }
};
exports.uploadMaterialForClassToGCS = uploadMaterialForClassToGCS;
const deleteClassFilesFromGCS = async fileName => {
  try {
    const filePath = `${_storageConfig.classFolder}/${fileName}`;
    const file = _storageConfig.bucket.file(filePath);
    console.log(`Attempting to delete file from GCS: ${filePath}`);

    // Check if file exists before deleting
    const [exists] = await file.exists();
    if (!exists) {
      console.warn(`File not found in GCS: ${filePath}`);
      return; // Don't throw an error if the file is missing
    }

    // Proceed with deletion
    await file.delete();
    console.log(`File deleted successfully: ${filePath}`);
  } catch (error) {
    console.error(`Error deleting file from GCS`);
    throw new Error(`Failed to delete materialForClass from GCS`);
  }
};
exports.deleteClassFilesFromGCS = deleteClassFilesFromGCS;
//# sourceMappingURL=classStorage.js.map