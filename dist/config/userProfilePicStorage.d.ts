export declare const uploadUserProfilePicToGCS: (fileBuffer: Buffer, fileName: string, mimeType: string) => Promise<string>;
export declare const deleteUserProfilePicFromGCS: (fileName: string) => Promise<void>;
