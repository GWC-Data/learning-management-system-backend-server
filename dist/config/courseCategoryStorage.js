"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.uploadCourseCategoryImageToGCS = exports.deleteCourseCategoryImageFromGCS = void 0;
var _storageConfig = require("./storageConfig");
const uploadCourseCategoryImageToGCS = async (fileBuffer, fileName, mimeType) => {
  try {
    const filePath = `${_storageConfig.courseCategoryFolder}/${fileName}`;
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
exports.uploadCourseCategoryImageToGCS = uploadCourseCategoryImageToGCS;
const deleteCourseCategoryImageFromGCS = async fileName => {
  try {
    const filePath = `${_storageConfig.courseCategoryFolder}/${fileName}`;
    await _storageConfig.bucket.file(filePath).delete();
  } catch (error) {
    throw new Error("Failed to delete image from GCS");
  }
};
exports.deleteCourseCategoryImageFromGCS = deleteCourseCategoryImageFromGCS;
//# sourceMappingURL=courseCategoryStorage.js.map