"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.updateBatchEndpoint = exports.getBatchIdsByTraineeIdEndpoint = exports.getBatchEndpoint = exports.getBatchDetailsEndpoint = exports.getBatchByBatchNameEndpoint = exports.deleteBatchEndpoint = exports.createBatchEndpoint = void 0;
var _nodeServerEngine = require("node-server-engine");
var _Batch = require("./Batch.handler");
var _batch = require("./batch.validator");
var _middleware = require("../../middleware");
var _batch2 = require("./batch.const");
// Create Batch Endpoint
const createBatchEndpoint = exports.createBatchEndpoint = new _nodeServerEngine.Endpoint({
  path: '/batch',
  method: _nodeServerEngine.EndpointMethod.POST,
  handler: async (req, res) => {
    try {
      const batch = await (0, _Batch.createBatchTable)(req, req.body);
      res.status(201).json({
        message: 'Batch created successfully',
        batch
      });
    } catch (error) {
      res.status(500).json({
        message: _batch2.BATCH_CREATION_ERROR,
        error
      });
    }
  },
  authType: _nodeServerEngine.EndpointAuthType.JWT,
  validator: _batch.createBatchValidator,
  middleware: [(0, _middleware.checkPermission)('CreateBatch')]
});

// Get All Batch Endpoint
const getBatchEndpoint = exports.getBatchEndpoint = new _nodeServerEngine.Endpoint({
  path: '/batch',
  method: _nodeServerEngine.EndpointMethod.GET,
  handler: async (req, res) => {
    try {
      const batch = await (0, _Batch.getAllBatchesHandler)();
      if (!batch) {
        res.status(404).json({
          message: _batch2.BATCH_NOT_FOUND
        });
        return;
      }
      res.status(200).json({
        message: 'Batch retrieved successfully',
        batch
      });
    } catch (error) {
      res.status(500).json({
        message: _batch2.BATCH_GET_ERROR,
        error
      });
    }
  },
  authType: _nodeServerEngine.EndpointAuthType.JWT,
  validator: {},
  middleware: [(0, _middleware.checkPermission)('GetBatch')]
});
const getBatchDetailsEndpoint = exports.getBatchDetailsEndpoint = new _nodeServerEngine.Endpoint({
  path: '/batch/:id',
  method: _nodeServerEngine.EndpointMethod.GET,
  handler: async (req, res) => {
    const {
      id
    } = req.params;
    try {
      const batch = await (0, _Batch.getBatchDetailsHandler)(id);
      res.status(200).json({
        message: 'Batch retrieved successfully',
        batch
      });
    } catch (error) {
      res.status(404).json({
        message: _batch2.BATCH_NOT_FOUND,
        error
      });
    }
  },
  authType: _nodeServerEngine.EndpointAuthType.JWT,
  validator: {},
  middleware: [(0, _middleware.checkPermission)('GetBatch')]
});
const getBatchByBatchNameEndpoint = exports.getBatchByBatchNameEndpoint = new _nodeServerEngine.Endpoint({
  path: "/batchbyName/:batchName",
  method: _nodeServerEngine.EndpointMethod.GET,
  handler: async (req, res) => {
    const {
      batchName
    } = req.params;
    try {
      const batchData = await (0, _Batch.getBatchByBatchNameHandler)(batchName);
      res.status(200).json({
        message: "Batch retrieved successfully",
        batch: batchData
      });
    } catch (error) {
      res.status(404).json({
        message: "Batch not found",
        error
      });
    }
  },
  authType: _nodeServerEngine.EndpointAuthType.JWT,
  validator: {}
});
const getBatchIdsByTraineeIdEndpoint = exports.getBatchIdsByTraineeIdEndpoint = new _nodeServerEngine.Endpoint({
  path: '/batchTrainee/:id',
  method: _nodeServerEngine.EndpointMethod.GET,
  handler: async (req, res) => {
    const {
      id
    } = req.params;
    try {
      const batchIds = await (0, _Batch.getBatchIdsByTraineeIdHandler)(id);
      res.status(200).json({
        message: 'Batches retrieved successfully',
        batchIds
      });
    } catch (error) {
      res.status(404).json({
        message: 'No batches found for this trainee',
        error
      });
    }
  },
  authType: _nodeServerEngine.EndpointAuthType.JWT,
  validator: {},
  middleware: [(0, _middleware.checkPermission)('GetBatch')]
});

// update Batch endpoint
const updateBatchEndpoint = exports.updateBatchEndpoint = new _nodeServerEngine.Endpoint({
  path: '/batch/:id',
  method: _nodeServerEngine.EndpointMethod.PUT,
  handler: async (req, res) => {
    try {
      const updateRole = await (0, _Batch.updateBatchesHandler)(req.params.id, req, req.body);
      res.status(200).json({
        message: 'Batch updated successfully',
        updateRole
      });
    } catch (error) {
      res.status(500).json({
        message: _batch2.BATCH_UPDATE_ERROR,
        error
      });
    }
  },
  authType: _nodeServerEngine.EndpointAuthType.JWT,
  validator: _batch.updateBatchValidator,
  middleware: [(0, _middleware.checkPermission)('UpdateBatch')]
});

// delete Batch endpoint
const deleteBatchEndpoint = exports.deleteBatchEndpoint = new _nodeServerEngine.Endpoint({
  path: '/batch/:id',
  method: _nodeServerEngine.EndpointMethod.DELETE,
  handler: async (req, res) => {
    try {
      await (0, _Batch.deleteBatchHandler)(req, req.params.id);
      res.status(200).json({
        message: 'Batch deleted successfully'
      });
    } catch (error) {
      res.status(500).json({
        message: _batch2.BATCH_DELETION_ERROR,
        error
      });
    }
  },
  authType: _nodeServerEngine.EndpointAuthType.JWT,
  validator: _batch.deleteBatchValidator,
  middleware: [(0, _middleware.checkPermission)('DeleteBatch')]
});
//# sourceMappingURL=batch.js.map