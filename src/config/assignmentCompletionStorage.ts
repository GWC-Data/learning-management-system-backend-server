import { bucket, assignmentCompletionFolder } from "./storageConfig";

export const uploadAssignmentCompletionFileToGCS = async (fileBuffer: Buffer, fileName: string, mimeType: string): Promise<string> => {
  try {
    const filePath = `${assignmentCompletionFolder}/${fileName}`;
    const file = bucket.file(filePath);
    const stream = file.createWriteStream({ metadata: { contentType: mimeType || "application/octet-stream" } });

    return new Promise<string>((resolve, reject) => {
      stream.on("error", (err) => reject("Failed to upload answer file to GCS"));
      stream.on("finish", () => resolve(`https://storage.googleapis.com/${bucket.name}/${filePath}`));
      stream.end(fileBuffer);
    });
  } catch (error) {
    throw new Error("Failed to upload answer file to GCS");
  }
};

export const deleteAssignmentCompletionFileFromGCS = async (fileName: string): Promise<void> => {
  try {
    const filePath = `${assignmentCompletionFolder}/${fileName}`;
    await bucket.file(filePath).delete();
  } catch (error) {
    throw new Error("Failed to delete answer file from GCS");
  }
};
