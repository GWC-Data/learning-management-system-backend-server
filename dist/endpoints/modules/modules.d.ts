import { Endpoint, EndpointAuthType } from 'node-server-engine';
export declare const createModuleEndpoint: Endpoint<EndpointAuthType.JWT>;
export declare const getAllModuleEndpoint: Endpoint<EndpointAuthType.JWT>;
export declare const getModuleByIdEndpoint: Endpoint<EndpointAuthType.JWT>;
export declare const updateModuleByIdEndpoint: Endpoint<EndpointAuthType.JWT>;
export declare const deleteModuleEndpoint: Endpoint<EndpointAuthType.JWT>;
