export declare const uploadAttendanceFileForClassToGCS: (fileBuffer: Buffer, fileName: string, mimeType: string) => Promise<string>;
export declare const deleteAttendanceForClassFromGCS: (fileName: string) => Promise<void>;
