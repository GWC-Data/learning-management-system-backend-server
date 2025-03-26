import { Endpoint, EndpointMethod, EndpointAuthType } from "node-server-engine";
import {
    createBatchClassScheduleTableHandler,
    getAllBatchClassSchedulesHandler,
    getBatchClassScheduleDetailsHandler,
    updateBatchClassScheduleHandler,
    getBatchClassScheduleByBatchIdHandler,
    deleteBatchClassScheduleHandler,
    getBatchClassScheduleByClassIdHandler
} from './batchClassSchedules.handler';
import {
    BATCHCLASSSCHEDULES_NOT_FOUND,
    BATCHCLASSSCHEDULES_CREATION_ERROR,
    BATCHCLASSSCHEDULES_FETCH_ERROR,
    BATCHCLASSSCHEDULES_UPDATE_ERROR,
    BATCHCLASSSCHEDULES_DELETION_ERROR
} from './batchClassSchedules.const';
import {
    updateBatchClassScheduleValidator,
    batchClassScheduleValidator,
    deleteBatchClassScheduleValidator
} from './batchClassSchedules.validator';
import { checkPermission } from "middleware";

// Create BatchClassSchedule Endpoint
export const createBatchClassScheduleEndpoint = new Endpoint({
  path: '/batchClassSchedule',
  method: EndpointMethod.POST,
  handler: async (req, res): Promise<void> => {
    try {
      const batchModule = await createBatchClassScheduleTableHandler(req, req.body,);

      res.status(201).json({ message: 'BatchClassSchedule created successfully', batchModule });
    } catch (error) {
      res.status(500).json({ message: BATCHCLASSSCHEDULES_CREATION_ERROR, error });
    }
  },
  authType: EndpointAuthType.JWT,
  validator: batchClassScheduleValidator,
  middleware: [checkPermission('CreateBatchClassSchedule')]
});


// Get All BatchClassSchedule Endpoint
export const getBatchClassScheduleEndpoint = new Endpoint({
  path: '/batchClassSchedule',
  method: EndpointMethod.GET,
  handler: async (req, res): Promise<void> => {
    try {
      const batchClassSchedule = await getAllBatchClassSchedulesHandler();

      if (!batchClassSchedule) {
        res.status(404).json({ message: BATCHCLASSSCHEDULES_NOT_FOUND });
        return;
      }

      res.status(200).json({ message: 'BatchClassSchedule retrieved successfully', batchClassSchedule });
    } catch (error) {
      res.status(500).json({ message: BATCHCLASSSCHEDULES_FETCH_ERROR, error });
    }
  },
  authType: EndpointAuthType.JWT,
  validator: {},
  middleware: [checkPermission('GetBatchClassSchedule')]
});

export const getBatchClassScheduleByBatchIdEndpoint = new Endpoint({
  path: '/batchClassSchedulebybatch/:id',
  method: EndpointMethod.GET,
  handler: async (req, res): Promise<void> => {
    const { id } = req.params;

    try {
      const batchClassSchedule = await getBatchClassScheduleByBatchIdHandler(id);
      res.status(200).json(batchClassSchedule);
    } catch (error) {
      res.status(404).json({ message: 'Batch Module Schedule not found', error });
    }
  },
  authType: EndpointAuthType.JWT,
  validator: {},
  middleware: [checkPermission('GetBatchClassSchedule')],
});


export const getBatchClassScheduleByClassIdEndpoint = new Endpoint({
  path: '/batchClassSchedulebyclass/:id',
  method: EndpointMethod.GET,
  handler: async (req, res): Promise<void> => {
    const { id } = req.params;

    try {
      const batchClassSchedule = await getBatchClassScheduleByClassIdHandler(id);
      res.status(200).json(batchClassSchedule);
    } catch (error) {
      res.status(404).json({ message: 'Batch Module Schedule not found', error });
    }
  },
  authType: EndpointAuthType.JWT,
  validator: {},
  middleware: [checkPermission('GetBatchClassSchedule')],
});


export const getBatchClassScheduleDetailsEndpoint = new Endpoint({
  path: '/batchClassSchedule/:id',
  method: EndpointMethod.GET,
  handler: async (req, res): Promise<void> => {
    const { id } = req.params;

    try {
      const batchModule = await getBatchClassScheduleDetailsHandler(id);

      res.status(200).json({ message: 'BatchClassSchedule retrieved successfully', batchModule });
    } catch (error) {
      res.status(404).json({ message: BATCHCLASSSCHEDULES_NOT_FOUND, error });
    }
  },
  authType: EndpointAuthType.JWT,
  validator: {},
  middleware: [checkPermission('GetBatchClassSchedule')]
});


// update BatchClassSchedule endpoint
export const updateBatchClassScheduleEndpoint = new Endpoint({
  path: '/batchClassSchedule/:id',
  method: EndpointMethod.PUT,
  handler: async (req, res): Promise<void> => {
    try {
      const updateBatchClassSchedule = await updateBatchClassScheduleHandler(req, req.params.id, req.body);
      res.status(200).json({ message: 'BatchClassSchedule updated successfully', updateBatchClassSchedule });
    } catch (error) {
      res.status(500).json({ message: BATCHCLASSSCHEDULES_UPDATE_ERROR, error });
    }
  },
  authType: EndpointAuthType.JWT,
  validator: updateBatchClassScheduleValidator,
  middleware: [checkPermission('UpdateBatchClassSchedule')]
});


// delete BatchSchedule endpoint
export const deleteBatchClassScheduleEndpoint = new Endpoint({
  path: '/batchClassSchedule/:id',
  method: EndpointMethod.DELETE,
  handler: async (req, res): Promise<void> => {
    try {
      await deleteBatchClassScheduleHandler(req.params.id, req);
      res.status(200).json({ message: 'BatchClassSchedule deleted successfully' });
    } catch (error) {
      res.status(500).json({ message: BATCHCLASSSCHEDULES_DELETION_ERROR, error });
    }
  },
  authType: EndpointAuthType.JWT,
  validator: deleteBatchClassScheduleValidator,
  middleware: [checkPermission('DeleteBatchClassSchedule')]
});
