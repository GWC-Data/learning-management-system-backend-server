"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.updateBatchClassScheduleEndpoint = exports.getBatchClassScheduleEndpoint = exports.getBatchClassScheduleDetailsEndpoint = exports.getBatchClassScheduleByClassIdEndpoint = exports.getBatchClassScheduleByBatchIdEndpoint = exports.deleteBatchClassScheduleEndpoint = exports.createBatchClassScheduleEndpoint = void 0;
var _nodeServerEngine = require("node-server-engine");
var _batchClassSchedules = require("./batchClassSchedules.handler");
var _batchClassSchedules2 = require("./batchClassSchedules.const");
var _batchClassSchedules3 = require("./batchClassSchedules.validator");
var _middleware = require("../../middleware");
// Create BatchClassSchedule Endpoint
const createBatchClassScheduleEndpoint = exports.createBatchClassScheduleEndpoint = new _nodeServerEngine.Endpoint({
  path: '/batchClassSchedule',
  method: _nodeServerEngine.EndpointMethod.POST,
  handler: async (req, res) => {
    try {
      const batchModule = await (0, _batchClassSchedules.createBatchClassScheduleTableHandler)(req, req.body);
      res.status(201).json({
        message: 'BatchClassSchedule created successfully',
        batchModule
      });
    } catch (error) {
      res.status(500).json({
        message: _batchClassSchedules2.BATCHCLASSSCHEDULES_CREATION_ERROR,
        error
      });
    }
  },
  authType: _nodeServerEngine.EndpointAuthType.JWT,
  validator: _batchClassSchedules3.batchClassScheduleValidator,
  middleware: [(0, _middleware.checkPermission)('CreateBatchClassSchedule')]
});

// Get All BatchClassSchedule Endpoint
const getBatchClassScheduleEndpoint = exports.getBatchClassScheduleEndpoint = new _nodeServerEngine.Endpoint({
  path: '/batchClassSchedule',
  method: _nodeServerEngine.EndpointMethod.GET,
  handler: async (req, res) => {
    try {
      const batchClassSchedule = await (0, _batchClassSchedules.getAllBatchClassSchedulesHandler)();
      if (!batchClassSchedule) {
        res.status(404).json({
          message: _batchClassSchedules2.BATCHCLASSSCHEDULES_NOT_FOUND
        });
        return;
      }
      res.status(200).json({
        message: 'BatchClassSchedule retrieved successfully',
        batchClassSchedule
      });
    } catch (error) {
      res.status(500).json({
        message: _batchClassSchedules2.BATCHCLASSSCHEDULES_FETCH_ERROR,
        error
      });
    }
  },
  authType: _nodeServerEngine.EndpointAuthType.JWT,
  validator: {},
  middleware: [(0, _middleware.checkPermission)('GetBatchClassSchedule')]
});
const getBatchClassScheduleByBatchIdEndpoint = exports.getBatchClassScheduleByBatchIdEndpoint = new _nodeServerEngine.Endpoint({
  path: '/batchClassSchedulebybatch/:id',
  method: _nodeServerEngine.EndpointMethod.GET,
  handler: async (req, res) => {
    const {
      id
    } = req.params;
    try {
      const batchClassSchedule = await (0, _batchClassSchedules.getBatchClassScheduleByBatchIdHandler)(id);
      res.status(200).json(batchClassSchedule);
    } catch (error) {
      res.status(404).json({
        message: 'Batch Module Schedule not found',
        error
      });
    }
  },
  authType: _nodeServerEngine.EndpointAuthType.JWT,
  validator: {},
  middleware: [(0, _middleware.checkPermission)('GetBatchClassSchedule')]
});
const getBatchClassScheduleByClassIdEndpoint = exports.getBatchClassScheduleByClassIdEndpoint = new _nodeServerEngine.Endpoint({
  path: '/batchClassSchedulebyclass/:id',
  method: _nodeServerEngine.EndpointMethod.GET,
  handler: async (req, res) => {
    const {
      id
    } = req.params;
    try {
      const batchClassSchedule = await (0, _batchClassSchedules.getBatchClassScheduleByClassIdHandler)(id);
      res.status(200).json(batchClassSchedule);
    } catch (error) {
      res.status(404).json({
        message: 'Batch Module Schedule not found',
        error
      });
    }
  },
  authType: _nodeServerEngine.EndpointAuthType.JWT,
  validator: {},
  middleware: [(0, _middleware.checkPermission)('GetBatchClassSchedule')]
});
const getBatchClassScheduleDetailsEndpoint = exports.getBatchClassScheduleDetailsEndpoint = new _nodeServerEngine.Endpoint({
  path: '/batchClassSchedule/:id',
  method: _nodeServerEngine.EndpointMethod.GET,
  handler: async (req, res) => {
    const {
      id
    } = req.params;
    try {
      const batchModule = await (0, _batchClassSchedules.getBatchClassScheduleDetailsHandler)(id);
      res.status(200).json({
        message: 'BatchClassSchedule retrieved successfully',
        batchModule
      });
    } catch (error) {
      res.status(404).json({
        message: _batchClassSchedules2.BATCHCLASSSCHEDULES_NOT_FOUND,
        error
      });
    }
  },
  authType: _nodeServerEngine.EndpointAuthType.JWT,
  validator: {},
  middleware: [(0, _middleware.checkPermission)('GetBatchClassSchedule')]
});

// update BatchClassSchedule endpoint
const updateBatchClassScheduleEndpoint = exports.updateBatchClassScheduleEndpoint = new _nodeServerEngine.Endpoint({
  path: '/batchClassSchedule/:id',
  method: _nodeServerEngine.EndpointMethod.PUT,
  handler: async (req, res) => {
    try {
      const updateBatchClassSchedule = await (0, _batchClassSchedules.updateBatchClassScheduleHandler)(req, req.params.id, req.body);
      res.status(200).json({
        message: 'BatchClassSchedule updated successfully',
        updateBatchClassSchedule
      });
    } catch (error) {
      res.status(500).json({
        message: _batchClassSchedules2.BATCHCLASSSCHEDULES_UPDATE_ERROR,
        error
      });
    }
  },
  authType: _nodeServerEngine.EndpointAuthType.JWT,
  validator: _batchClassSchedules3.updateBatchClassScheduleValidator,
  middleware: [(0, _middleware.checkPermission)('UpdateBatchClassSchedule')]
});

// delete BatchSchedule endpoint
const deleteBatchClassScheduleEndpoint = exports.deleteBatchClassScheduleEndpoint = new _nodeServerEngine.Endpoint({
  path: '/batchClassSchedule/:id',
  method: _nodeServerEngine.EndpointMethod.DELETE,
  handler: async (req, res) => {
    try {
      await (0, _batchClassSchedules.deleteBatchClassScheduleHandler)(req.params.id, req);
      res.status(200).json({
        message: 'BatchClassSchedule deleted successfully'
      });
    } catch (error) {
      res.status(500).json({
        message: _batchClassSchedules2.BATCHCLASSSCHEDULES_DELETION_ERROR,
        error
      });
    }
  },
  authType: _nodeServerEngine.EndpointAuthType.JWT,
  validator: _batchClassSchedules3.deleteBatchClassScheduleValidator,
  middleware: [(0, _middleware.checkPermission)('DeleteBatchClassSchedule')]
});
//# sourceMappingURL=batchClassSchedules.js.map