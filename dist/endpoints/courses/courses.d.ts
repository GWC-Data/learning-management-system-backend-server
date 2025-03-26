import { Endpoint, EndpointAuthType } from 'node-server-engine';
export declare const createCourseEndpoint: Endpoint<EndpointAuthType.JWT>;
export declare const getAllCourseEndpoint: Endpoint<EndpointAuthType.NONE>;
export declare const getCourseByIdEndpoint: Endpoint<EndpointAuthType.NONE>;
export declare const updateCourseByIdEndpoint: Endpoint<EndpointAuthType.JWT>;
export declare const deleteCourseEndpoint: Endpoint<EndpointAuthType.JWT>;
