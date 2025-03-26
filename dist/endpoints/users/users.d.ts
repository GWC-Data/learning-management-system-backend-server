import { Endpoint, EndpointAuthType } from 'node-server-engine';
export declare const createUserEndpoint: Endpoint<EndpointAuthType.JWT>;
export declare const getAllUsersEndpoint: Endpoint<EndpointAuthType.JWT>;
export declare const getUserByIdEndpoint: Endpoint<EndpointAuthType.JWT>;
export declare const updateUserForAdminEndpoint: Endpoint<EndpointAuthType.JWT>;
export declare const updateUserForTraineeEndpoint: Endpoint<EndpointAuthType.JWT>;
export declare const deleteUserEndpoint: Endpoint<EndpointAuthType.JWT>;
