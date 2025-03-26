"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.uploadLinkedInImageToGCS = exports.deleteLinkedInImageFromGCS = void 0;
var _storageConfig = require("./storageConfig");
const uploadLinkedInImageToGCS = async (fileBuffer, fileName, mimeType) => {
  try {
    const filePath = `${_storageConfig.LinkedInJobImageFolder}/${fileName}`;
    console.log("Uploading file to:", filePath);
    const file = _storageConfig.bucket.file(filePath);
    const stream = file.createWriteStream({
      metadata: {
        contentType: mimeType || "application/octet-stream"
      }
    });
    return new Promise((resolve, reject) => {
      stream.on("error", err => reject("Failed to upload image to GCS"));
      stream.on("finish", () => resolve(`https://storage.googleapis.com/${_storageConfig.bucket.name}/${filePath}`));
      stream.end(fileBuffer);
    });
  } catch (error) {
    throw new Error("Failed to upload image to GCS");
  }
};
exports.uploadLinkedInImageToGCS = uploadLinkedInImageToGCS;
const deleteLinkedInImageFromGCS = async fileName => {
  try {
    const filePath = `${_storageConfig.LinkedInJobImageFolder}/${fileName}`;
    await _storageConfig.bucket.file(filePath).delete();
  } catch (error) {
    throw new Error("Failed to delete image from GCS");
  }
};
exports.deleteLinkedInImageFromGCS = deleteLinkedInImageFromGCS;
//# sourceMappingURL=linkedInJobStorage.js.map