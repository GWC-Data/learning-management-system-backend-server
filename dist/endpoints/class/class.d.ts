import { Endpoint, EndpointAuthType } from 'node-server-engine';
export declare const createClassEndpoint: Endpoint<EndpointAuthType.JWT>;
export declare const getAllClassEndpoint: Endpoint<EndpointAuthType.NONE>;
export declare const getClassByIdEndpoint: Endpoint<EndpointAuthType.NONE>;
export declare const getClassByModuleIdEndpoint: Endpoint<EndpointAuthType.NONE>;
export declare const updateClassByIdEndpoint: Endpoint<EndpointAuthType.JWT>;
export declare const deleteClassEndpoint: Endpoint<EndpointAuthType.JWT>;
