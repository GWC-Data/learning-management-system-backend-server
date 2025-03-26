"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.uploadCourseImageToGCS = exports.deleteCourseImageFromGCS = void 0;
var _storageConfig = require("./storageConfig");
const uploadCourseImageToGCS = async (fileBuffer, fileName, mimeType) => {
  try {
    const filePath = `${_storageConfig.courseFolder}/${fileName}`;
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
exports.uploadCourseImageToGCS = uploadCourseImageToGCS;
const deleteCourseImageFromGCS = async fileName => {
  try {
    const filePath = `${_storageConfig.courseFolder}/${fileName}`;
    await _storageConfig.bucket.file(filePath).delete();
  } catch (error) {
    throw new Error("Failed to delete image from GCS");
  }
};
exports.deleteCourseImageFromGCS = deleteCourseImageFromGCS;
//# sourceMappingURL=courseStorage.js.map