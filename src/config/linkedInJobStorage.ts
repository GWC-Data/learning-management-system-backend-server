import { bucket, LinkedInJobImageFolder } from "./storageConfig";

export const uploadLinkedInImageToGCS = async (fileBuffer: Buffer, fileName: string, mimeType: string): Promise<string> => {
  try {
    const filePath = `${LinkedInJobImageFolder}/${fileName}`;
    console.log("Uploading file to:", filePath);
    const file = bucket.file(filePath);
    const stream = file.createWriteStream({ metadata: { contentType: mimeType || "application/octet-stream" } });

    return new Promise<string>((resolve, reject) => {
      stream.on("error", (err) => reject("Failed to upload image to GCS"));
      stream.on("finish", () => resolve(`https://storage.googleapis.com/${bucket.name}/${filePath}`));
      stream.end(fileBuffer);
    });
  } catch (error) {
    throw new Error("Failed to upload image to GCS");
  }
};

export const deleteLinkedInImageFromGCS = async (fileName: string): Promise<void> => {
  try {
    const filePath = `${LinkedInJobImageFolder}/${fileName}`;
    await bucket.file(filePath).delete();
  } catch (error) {
    throw new Error("Failed to delete image from GCS");
  }
};
