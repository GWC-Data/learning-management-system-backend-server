import { Endpoint, EndpointMethod, EndpointAuthType } from "node-server-engine";
import {
  getBatchDetailsHandler,
  createBatchTable,
  getAllBatchesHandler,
  getBatchIdsByTraineeIdHandler,
  updateBatchesHandler,
  deleteBatchHandler,
  getBatchByBatchNameHandler
} from './Batch.handler';
import {
  createBatchValidator,
  updateBatchValidator,
  deleteBatchValidator,
} from './batch.validator';
import { checkPermission } from 'middleware';
import {
  BATCH_CREATION_ERROR,
  BATCH_GET_ERROR,
  BATCH_NOT_FOUND,
  BATCH_DELETION_ERROR,
  BATCH_UPDATE_ERROR
} from "./batch.const";

// Create Batch Endpoint
export const createBatchEndpoint = new Endpoint({
  path: '/batch',
  method: EndpointMethod.POST,
  handler: async (req, res): Promise<void> => {
    try {
      const batch = await createBatchTable(req, req.body);

      res.status(201).json({ message: 'Batch created successfully', batch });
    } catch (error) {
      res.status(500).json({ message: BATCH_CREATION_ERROR, error });
    }
  },
  authType: EndpointAuthType.JWT,
  validator: createBatchValidator,
  middleware: [checkPermission('CreateBatch')]
});

// Get All Batch Endpoint
export const getBatchEndpoint = new Endpoint({
  path: '/batch',
  method: EndpointMethod.GET,
  handler: async (req, res): Promise<void> => {
    try {
      const batch = await getAllBatchesHandler();

      if (!batch) {
        res.status(404).json({ message: BATCH_NOT_FOUND });
        return;
      }

      res.status(200).json({ message: 'Batch retrieved successfully', batch });
    } catch (error) {
      res.status(500).json({ message: BATCH_GET_ERROR, error });
    }
  },
  authType: EndpointAuthType.JWT,
  validator: {},
  middleware: [checkPermission('GetBatch')]
});


export const getBatchDetailsEndpoint = new Endpoint({
  path: '/batch/:id',
  method: EndpointMethod.GET,
  handler: async (req, res): Promise<void> => {
    const { id } = req.params;

    try {
      const batch = await getBatchDetailsHandler(id);

      res.status(200).json({ message: 'Batch retrieved successfully', batch });
    } catch (error) {
      res.status(404).json({ message: BATCH_NOT_FOUND, error });
    }
  },
  authType: EndpointAuthType.JWT,
  validator: {},
  middleware: [checkPermission('GetBatch')]
});

export const getBatchByBatchNameEndpoint = new Endpoint({
  path: "/batchbyName/:batchName",
  method: EndpointMethod.GET,
  handler: async (req, res): Promise<void> => {
    const { batchName } = req.params;

    try {
      const batchData = await getBatchByBatchNameHandler(batchName);
      res.status(200).json({ message: "Batch retrieved successfully", batch: batchData });
    } catch (error) {
      res.status(404).json({ message: "Batch not found", error });
    }
  },
  authType: EndpointAuthType.JWT,
  validator: {},
});


export const getBatchIdsByTraineeIdEndpoint = new Endpoint({
  path: '/batchTrainee/:id',
  method: EndpointMethod.GET,
  handler: async (req, res): Promise<void> => {
    const { id } = req.params;

    try {
      const batchIds = await getBatchIdsByTraineeIdHandler(id);

      res.status(200).json({ message: 'Batches retrieved successfully', batchIds });
    } catch (error) {
      res.status(404).json({ message: 'No batches found for this trainee', error });
    }
  },
  authType: EndpointAuthType.JWT,
  validator: {},
  middleware: [checkPermission('GetBatch')],
});


// update Batch endpoint
export const updateBatchEndpoint = new Endpoint({
  path: '/batch/:id',
  method: EndpointMethod.PUT,
  handler: async (req, res): Promise<void> => {
    try {
      const updateRole = await updateBatchesHandler(req.params.id, req, req.body);
      res.status(200).json({ message: 'Batch updated successfully', updateRole });
    } catch (error) {
      res.status(500).json({ message: BATCH_UPDATE_ERROR, error });
    }
  },
  authType: EndpointAuthType.JWT,
  validator: updateBatchValidator,
  middleware: [checkPermission('UpdateBatch')]
});


// delete Batch endpoint
export const deleteBatchEndpoint = new Endpoint({
  path: '/batch/:id',
  method: EndpointMethod.DELETE,
  handler: async (req, res): Promise<void> => {
    try {
      await deleteBatchHandler(req, req.params.id);
      res.status(200).json({ message: 'Batch deleted successfully' });
    } catch (error) {
      res.status(500).json({ message: BATCH_DELETION_ERROR, error });
    }
  },
  authType: EndpointAuthType.JWT,
  validator: deleteBatchValidator,
  middleware: [checkPermission('DeleteBatch')]
});