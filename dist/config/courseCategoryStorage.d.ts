export declare const uploadCourseCategoryImageToGCS: (fileBuffer: Buffer, fileName: string, mimeType: string) => Promise<string>;
export declare const deleteCourseCategoryImageFromGCS: (fileName: string) => Promise<void>;
