import { Endpoint, EndpointAuthType } from 'node-server-engine';
export declare const createCourseCategoryEndpoint: Endpoint<EndpointAuthType.JWT>;
export declare const getAllCourseCategoryEndpoint: Endpoint<EndpointAuthType.NONE>;
export declare const getCourseCategoryByIdEndpoint: Endpoint<EndpointAuthType.JWT>;
export declare const updateCourseCategoryByIdEndpoint: Endpoint<EndpointAuthType.JWT>;
export declare const deleteCourseCategoryEndpoint: Endpoint<EndpointAuthType.JWT>;
