import { bucket, classFolder } from "./storageConfig";

export const uploadMaterialForClassToGCS = async (fileBuffer: Buffer, fileName: string, mimeType: string): Promise<string> => {
  try {
    const filePath = `${classFolder}/${fileName}`;
    const file = bucket.file(filePath);
    const stream = file.createWriteStream({ metadata: { contentType: mimeType || "application/octet-stream" } });

    return new Promise<string>((resolve, reject) => {
      stream.on("error", (err) => reject("Failed to upload materialForClass to GCS"));
      stream.on("finish", () => resolve(`https://storage.googleapis.com/${bucket.name}/${filePath}`));
      stream.end(fileBuffer);
    });
  } catch (error) {
    throw new Error("Failed to upload materialForClass to GCS");
  }
};


export const deleteClassFilesFromGCS = async (fileName: string): Promise<void> => {
  try {
    const filePath = `${classFolder}/${fileName}`;
    const file = bucket.file(filePath);

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

