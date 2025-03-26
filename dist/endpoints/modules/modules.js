"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.updateModuleByIdEndpoint = exports.getModuleByIdEndpoint = exports.getAllModuleEndpoint = exports.deleteModuleEndpoint = exports.createModuleEndpoint = void 0;
var _nodeServerEngine = require("node-server-engine");
var _multer = _interopRequireDefault(require("multer"));
var _expressValidator = require("express-validator");
var _modules = require("./modules.handler");
var _modules2 = require("./modules.validator");
var _middleware = require("../../middleware");
var _modules3 = require("./modules.const");
// Multer Memory Storage for handling file uploads
const upload = (0, _multer.default)({
  storage: _multer.default.memoryStorage()
});

// Middleware to handle validation errors
const validateRequest = (req, res, next) => {
  const errors = (0, _expressValidator.validationResult)(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      errors: errors.array()
    });
  }
  next(); // Proceed to the next middleware/function if no errors
};

//CREATE MODULE
const createModuleEndpoint = exports.createModuleEndpoint = new _nodeServerEngine.Endpoint({
  path: '/module',
  method: _nodeServerEngine.EndpointMethod.POST,
  authType: _nodeServerEngine.EndpointAuthType.JWT,
  handler: async (req, res) => {
    try {
      console.log('Incoming request body:', JSON.stringify(req.body, null, 2));
      console.log('Received moduleName:', req.body.moduleName);

      // Call handler with request body and file
      const response = await (0, _modules.createModuleHandler)(req, req.body, req.file);
      if (!response.success) {
        res.status(400).json({
          error: response.message
        });
        return;
      }
      res.status(201).json({
        message: 'Module created successfully',
        moduleId: response.moduleId,
        materialForModule: response.materialForModule
      });
    } catch (error) {
      console.error('Error creating Module:', error);
      res.status(500).json({
        message: 'Internal server error',
        error: "error"
      });
    }
  },
  validator: {},
  // Apply the schema-based validator
  middleware: [(0, _middleware.checkPermission)("CreateModule"), upload.single('materialForModule'), validateRequest]
});

// Get All Module Endpoint
const getAllModuleEndpoint = exports.getAllModuleEndpoint = new _nodeServerEngine.Endpoint({
  path: '/module',
  method: _nodeServerEngine.EndpointMethod.GET,
  handler: async (req, res) => {
    try {
      const module = await (0, _modules.getAllModulesHandler)();
      if (!module) {
        res.status(404).json({
          message: _modules3.MODULE_NOT_FOUND
        });
        return;
      }
      res.status(200).json({
        message: 'Module retrieved successfully',
        module
      });
    } catch (error) {
      res.status(500).json({
        message: _modules3.MODULE_GET_ERROR,
        error
      });
    }
  },
  authType: _nodeServerEngine.EndpointAuthType.JWT,
  validator: {},
  middleware: [(0, _middleware.checkPermission)("GetModule")]
});

// Get Module By ID Endpoint
const getModuleByIdEndpoint = exports.getModuleByIdEndpoint = new _nodeServerEngine.Endpoint({
  path: '/module/:id',
  method: _nodeServerEngine.EndpointMethod.GET,
  handler: async (req, res) => {
    try {
      const moduleId = req.params.id; // Ensure this is used correctly
      const module = await (0, _modules.getModuleByIdHandler)(moduleId);
      res.status(200).json({
        message: 'Module retrieved successfully',
        module
      });
    } catch (error) {
      res.status(404).json({
        message: _modules3.MODULE_NOT_FOUND,
        error
      });
    }
  },
  authType: _nodeServerEngine.EndpointAuthType.JWT,
  validator: _modules2.getModuleByIdValidator,
  middleware: [(0, _middleware.checkPermission)("GetModule")]
});

// Update Module Endpoint
const updateModuleByIdEndpoint = exports.updateModuleByIdEndpoint = new _nodeServerEngine.Endpoint({
  path: '/module/:id',
  method: _nodeServerEngine.EndpointMethod.PUT,
  handler: async (req, res) => {
    try {
      const updateModule = await (0, _modules.updateModuleHandler)(req, req.params.id, req.body);
      res.status(200).json({
        message: 'Module updated successfully',
        updateModule
      });
    } catch (error) {
      res.status(500).json({
        message: _modules3.MODULE_UPDATE_ERROR,
        error
      });
    }
  },
  authType: _nodeServerEngine.EndpointAuthType.JWT,
  validator: {},
  middleware: [(0, _middleware.checkPermission)("UpdateModule"), upload.single('materialForModule')]
});

// Delete module Endpoint
const deleteModuleEndpoint = exports.deleteModuleEndpoint = new _nodeServerEngine.Endpoint({
  path: '/module/:id',
  method: _nodeServerEngine.EndpointMethod.DELETE,
  handler: async (req, res) => {
    try {
      await (0, _modules.deleteModuleHandler)(req, req.params.id);
      res.json({
        message: 'Module deleted successfully'
      });
    } catch (error) {
      res.status(500).json({
        message: _modules3.MODULE_DELETION_ERROR,
        error
      });
    }
  },
  authType: _nodeServerEngine.EndpointAuthType.JWT,
  validator: _modules2.deleteModuleValidator,
  middleware: [(0, _middleware.checkPermission)("DeleteModule")]
});
//# sourceMappingURL=modules.js.map