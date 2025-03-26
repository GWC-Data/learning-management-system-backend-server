"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.uploadAttendanceFileForClassToGCS = exports.deleteAttendanceForClassFromGCS = void 0;
var _storageConfig = require("./storageConfig");
const uploadAttendanceFileForClassToGCS = async (fileBuffer, fileName, mimeType) => {
  try {
    const filePath = `${_storageConfig.attendanceFileFolder}/${fileName}`;
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
    throw new Error("Failed to upload attendanceFileForClass to GCS");
  }
};
exports.uploadAttendanceFileForClassToGCS = uploadAttendanceFileForClassToGCS;
const deleteAttendanceForClassFromGCS = async fileName => {
  try {
    const filePath = `${_storageConfig.attendanceFileFolder}/${fileName}`;
    await _storageConfig.bucket.file(filePath).delete();
  } catch (error) {
    throw new Error("Failed to delete attendanceFileForClass from GCS");
  }
};
exports.deleteAttendanceForClassFromGCS = deleteAttendanceForClassFromGCS;
//# sourceMappingURL=attendanceStorage.js.map