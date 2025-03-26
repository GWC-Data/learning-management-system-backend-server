export declare const uploadModuleMaterialToGCS: (fileBuffer: Buffer, fileName: string, mimeType: string) => Promise<string>;
export declare const deleteModuleMaterialFromGCS: (fileName: string) => Promise<void>;
