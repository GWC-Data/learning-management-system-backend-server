import { Endpoint, EndpointAuthType } from "node-server-engine";
export declare const createBatchEndpoint: Endpoint<EndpointAuthType.JWT>;
export declare const getBatchEndpoint: Endpoint<EndpointAuthType.JWT>;
export declare const getBatchDetailsEndpoint: Endpoint<EndpointAuthType.JWT>;
export declare const getBatchByBatchNameEndpoint: Endpoint<EndpointAuthType.JWT>;
export declare const getBatchIdsByTraineeIdEndpoint: Endpoint<EndpointAuthType.JWT>;
export declare const updateBatchEndpoint: Endpoint<EndpointAuthType.JWT>;
export declare const deleteBatchEndpoint: Endpoint<EndpointAuthType.JWT>;
