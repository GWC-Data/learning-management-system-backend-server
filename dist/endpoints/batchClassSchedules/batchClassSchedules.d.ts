import { Endpoint, EndpointAuthType } from "node-server-engine";
export declare const createBatchClassScheduleEndpoint: Endpoint<EndpointAuthType.JWT>;
export declare const getBatchClassScheduleEndpoint: Endpoint<EndpointAuthType.JWT>;
export declare const getBatchClassScheduleByBatchIdEndpoint: Endpoint<EndpointAuthType.JWT>;
export declare const getBatchClassScheduleByClassIdEndpoint: Endpoint<EndpointAuthType.JWT>;
export declare const getBatchClassScheduleDetailsEndpoint: Endpoint<EndpointAuthType.JWT>;
export declare const updateBatchClassScheduleEndpoint: Endpoint<EndpointAuthType.JWT>;
export declare const deleteBatchClassScheduleEndpoint: Endpoint<EndpointAuthType.JWT>;
