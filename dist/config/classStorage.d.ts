export declare const uploadMaterialForClassToGCS: (fileBuffer: Buffer, fileName: string, mimeType: string) => Promise<string>;
export declare const deleteClassFilesFromGCS: (fileName: string) => Promise<void>;
