export declare const loginHandler: (email: string, password: string) => Promise<{
    accessToken: string;
    tokenExpiry: number;
    user: {
        id: any;
        firstName: any;
        lastName: any;
        email: any;
        jobBoardAccess: any;
        roleId: any;
        role: any;
        permissions: any;
    };
}>;
