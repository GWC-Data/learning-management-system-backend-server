export declare const uploadCourseImageToGCS: (fileBuffer: Buffer, fileName: string, mimeType: string) => Promise<string>;
export declare const deleteCourseImageFromGCS: (fileName: string) => Promise<void>;
