export declare const uploadLinkedInImageToGCS: (fileBuffer: Buffer, fileName: string, mimeType: string) => Promise<string>;
export declare const deleteLinkedInImageFromGCS: (fileName: string) => Promise<void>;
