export declare const uploadAssignmentCompletionFileToGCS: (fileBuffer: Buffer, fileName: string, mimeType: string) => Promise<string>;
export declare const deleteAssignmentCompletionFileFromGCS: (fileName: string) => Promise<void>;
