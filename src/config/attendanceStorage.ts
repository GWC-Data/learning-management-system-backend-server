import { bucket, attendanceFileFolder } from "./storageConfig";

export const uploadAttendanceFileForClassToGCS = async (fileBuffer: Buffer, fileName: string, mimeType: string): Promise<string> => {
  try {
    const filePath = `${attendanceFileFolder}/${fileName}`;
    const file = bucket.file(filePath);
    const stream = file.createWriteStream({ metadata: { contentType: mimeType || "application/octet-stream" } });

    return new Promise<string>((resolve, reject) => {
      stream.on("error", (err) => reject("Failed to upload materialForClass to GCS"));
      stream.on("finish", () => resolve(`https://storage.googleapis.com/${bucket.name}/${filePath}`));
      stream.end(fileBuffer);
    });
  } catch (error) {
    throw new Error("Failed to upload attendanceFileForClass to GCS");
  }
};

export const deleteAttendanceForClassFromGCS = async (fileName: string): Promise<void> => {
  try {
    const filePath = `${attendanceFileFolder}/${fileName}`;
    await bucket.file(filePath).delete();
  } catch (error) {
    throw new Error("Failed to delete attendanceFileForClass from GCS");
  }
};
