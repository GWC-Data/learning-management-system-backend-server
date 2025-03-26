"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.updateClassByIdEndpoint = exports.getClassByModuleIdEndpoint = exports.getClassByIdEndpoint = exports.getAllClassEndpoint = exports.deleteClassEndpoint = exports.createClassEndpoint = void 0;
var _nodeServerEngine = require("node-server-engine");
var _multer = _interopRequireDefault(require("multer"));
var _class = require("./class.validator");
var _class2 = require("./class.handler");
var _middleware = require("../../middleware");
var _class3 = require("./class.const");
// Multer Memory Storage for handling file uploads
const upload = (0, _multer.default)({
  storage: _multer.default.memoryStorage()
});

// Create class Endpoint
const createClassEndpoint = exports.createClassEndpoint = new _nodeServerEngine.Endpoint({
  path: "/class",
  method: _nodeServerEngine.EndpointMethod.POST,
  authType: _nodeServerEngine.EndpointAuthType.JWT,
  validator: {},
  middleware: [(0, _middleware.checkPermission)("CreateClass"), upload.fields([{
    name: "materialForClass",
    maxCount: 1
  }, {
    name: "assignmentFile",
    maxCount: 1
  }])],
  handler: async (req, res) => {
    try {
      console.log("Incoming request:", {
        headers: req.headers,
        body: req.body,
        files: req.files // Log all uploaded files
      });

      // Ensure classTitle is present
      if (!req.body.classTitle) {
        res.status(400).json({
          error: "classTitle is required"
        });
        return;
      }

      // Extract files from request
      const files = req.files;

      // Call handler with request body and extracted files
      const response = await (0, _class2.createClassHandler)(req, req.body, {
        materialForClass: files.materialForClass ? files.materialForClass[0] : undefined,
        assignmentFile: files.assignmentFile ? files.assignmentFile[0] : undefined
      });
      if (!response.success) {
        res.status(400).json({
          error: response.message
        });
        return;
      }
      res.status(201).json({
        message: "Class created successfully"
      });
    } catch (error) {
      console.error("Error creating class:", error);
      res.status(500).json({
        message: _class3.CLASS_CREATION_ERROR,
        error
      });
    }
  }
});

// Get All Class Endpoint
const getAllClassEndpoint = exports.getAllClassEndpoint = new _nodeServerEngine.Endpoint({
  path: '/class',
  method: _nodeServerEngine.EndpointMethod.GET,
  handler: async (req, res) => {
    try {
      const classes = await (0, _class2.getAllClassesHandler)();
      if (!classes) {
        res.status(404).json({
          message: _class3.CLASS_NOT_FOUND
        });
        return;
      }
      res.status(200).json({
        message: 'Class retrieved successfully',
        classes
      });
    } catch (error) {
      res.status(500).json({
        message: _class3.CLASS_GET_ERROR,
        error
      });
    }
  },
  authType: _nodeServerEngine.EndpointAuthType.NONE,
  validator: {}
  // middleware: [checkPermission("GetClass")]
});

// Get Class By ID Endpoint
const getClassByIdEndpoint = exports.getClassByIdEndpoint = new _nodeServerEngine.Endpoint({
  path: '/class/:id',
  method: _nodeServerEngine.EndpointMethod.GET,
  handler: async (req, res) => {
    try {
      const classId = req.params.id; // Ensure this is used correctly
      const classData = await (0, _class2.getClassByIdHandler)(classId);
      res.status(200).json({
        message: 'Class retrieved successfully',
        class: classData
      });
    } catch (error) {
      res.status(404).json({
        message: _class3.CLASS_NOT_FOUND,
        error
      });
    }
  },
  authType: _nodeServerEngine.EndpointAuthType.NONE,
  validator: {}
  // middleware: [checkPermission("GetClass")]
});

// Get Class By ID Endpoint
const getClassByModuleIdEndpoint = exports.getClassByModuleIdEndpoint = new _nodeServerEngine.Endpoint({
  path: '/classbyModule/:id',
  method: _nodeServerEngine.EndpointMethod.GET,
  handler: async (req, res) => {
    try {
      const moduleId = req.params.id; // Ensure this is used correctly
      const classData = await (0, _class2.getClassByModuleIdHandler)(moduleId);
      res.status(200).json({
        message: 'Class retrieved successfully',
        class: classData
      });
    } catch (error) {
      res.status(404).json({
        message: _class3.CLASS_NOT_FOUND,
        error
      });
    }
  },
  authType: _nodeServerEngine.EndpointAuthType.NONE,
  validator: {}
  // middleware: [checkPermission("GetClass")]
});

// Update classbyid Endpoint
const updateClassByIdEndpoint = exports.updateClassByIdEndpoint = new _nodeServerEngine.Endpoint({
  path: "/class/:id",
  method: _nodeServerEngine.EndpointMethod.PUT,
  handler: async (req, res) => {
    try {
      const files = req.files;
      const updateClass = await (0, _class2.updateClassHandler)(req, req.params.id, req.body, {
        materialForClass: files?.materialForClass,
        assignmentFile: files?.assignmentFile
      });
      if (!updateClass.success) {
        res.status(400).json({
          message: "Failed to update class",
          errors: updateClass.errors
        });
        return;
      }
      res.status(200).json({
        message: "Class updated successfully",
        classData: updateClass.classData
      });
    } catch (error) {
      console.error("Error in updateClassByIdEndpoint:", error);
      res.status(500).json({
        message: "Internal server error while updating class",
        error
      });
    }
  },
  authType: _nodeServerEngine.EndpointAuthType.JWT,
  validator: {},
  middleware: [(0, _middleware.checkPermission)("UpdateClass"), upload.fields([{
    name: "materialForClass",
    maxCount: 1
  }, {
    name: "assignmentFile",
    maxCount: 1
  }])]
});

// Delete Class Endpoint
const deleteClassEndpoint = exports.deleteClassEndpoint = new _nodeServerEngine.Endpoint({
  path: '/class/:id',
  method: _nodeServerEngine.EndpointMethod.DELETE,
  handler: async (req, res) => {
    try {
      await (0, _class2.deleteClassHandler)(req, req.params.id);
      res.json({
        message: 'Class deleted successfully'
      });
    } catch (error) {
      res.status(500).json({
        message: _class3.CLASS_DELETION_ERROR,
        error
      });
    }
  },
  authType: _nodeServerEngine.EndpointAuthType.JWT,
  validator: _class.deleteClassValidator,
  middleware: [(0, _middleware.checkPermission)("DeleteClass")]
});
//# sourceMappingURL=class.js.map