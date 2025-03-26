"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.updateAssignmentCompletionByIdEndpoint = exports.getAssignmentCompletionByIdEndpoint = exports.getAllAssignmentCompletionsEndpoint = exports.deleteAssignmentCompletionEndpoint = exports.createAssignmentCompletionEndpoint = void 0;
var _nodeServerEngine = require("node-server-engine");
var _multer = _interopRequireDefault(require("multer"));
var _assignmentCompletion = require("./assignmentCompletion.handler");
var _assignmentCompletion2 = require("./assignmentCompletion.validator");
var _assignmentCompletion3 = require("./assignmentCompletion.const");
var _middleware = require("../../middleware");
// Multer Memory Storage for handling file uploads
const upload = (0, _multer.default)({
  storage: _multer.default.memoryStorage()
});

// Create Assignment Completion Endpoint
const createAssignmentCompletionEndpoint = exports.createAssignmentCompletionEndpoint = new _nodeServerEngine.Endpoint({
  path: '/assignment-completion',
  method: _nodeServerEngine.EndpointMethod.POST,
  authType: _nodeServerEngine.EndpointAuthType.JWT,
  validator: _assignmentCompletion2.assignmentCompletionValidator,
  middleware: [(0, _middleware.checkPermission)("CreateAssignmentCompletion"), upload.single('courseAssignmentAnswerFile')],
  handler: async (req, res) => {
    try {
      // Ensure required fields are present
      if (!req.body.classId || !req.body.traineeId || !req.body.obtainedMarks) {
        res.status(400).json({
          error: 'classId, traineeId, and obtainedMarks are required'
        });
        return;
      }

      // Call handler with request body and file
      const response = await (0, _assignmentCompletion.createAssignmentCompletionHandler)(req, req.body, req.file);
      if (!response.success) {
        res.status(400).json({
          error: response.message
        });
        return;
      }
      res.status(201).json({
        message: 'Assignmentcompletion created successfully',
        response
      });
    } catch (error) {
      console.error('Error creating assignment completion:', error);
      res.status(500).json({
        message: _assignmentCompletion3.ASSIGNMENT_COMPLETION_CREATION_ERROR,
        error
      });
    }
  }
});

// Get All Assignment Completions Endpoint
const getAllAssignmentCompletionsEndpoint = exports.getAllAssignmentCompletionsEndpoint = new _nodeServerEngine.Endpoint({
  path: '/assignment-completion',
  method: _nodeServerEngine.EndpointMethod.GET,
  handler: async (req, res) => {
    try {
      const assignmentCompletions = await (0, _assignmentCompletion.getAllAssignmentCompletionsHandler)();
      if (!assignmentCompletions) {
        res.status(404).json({
          message: _assignmentCompletion3.ASSIGNMENT_COMPLETION_NOT_FOUND
        });
        return;
      }
      res.status(200).json({
        message: 'Assignment completions retrieved successfully',
        assignmentCompletions
      });
    } catch (error) {
      res.status(500).json({
        message: _assignmentCompletion3.ASSIGNMENT_COMPLETION_FETCH_ERROR,
        error
      });
    }
  },
  authType: _nodeServerEngine.EndpointAuthType.JWT,
  validator: {},
  middleware: [(0, _middleware.checkPermission)("GetAssignmentCompletion")]
});

// Get Assignment Completion By ID Endpoint
const getAssignmentCompletionByIdEndpoint = exports.getAssignmentCompletionByIdEndpoint = new _nodeServerEngine.Endpoint({
  path: '/assignment-completion/:id',
  method: _nodeServerEngine.EndpointMethod.GET,
  handler: async (req, res) => {
    try {
      const assignmentCompletion = await (0, _assignmentCompletion.getAssignmentCompletionByIdHandler)(req.params.id);
      if (!assignmentCompletion) {
        res.status(404).json({
          message: _assignmentCompletion3.ASSIGNMENT_COMPLETION_NOT_FOUND
        });
        return;
      }
      res.status(200).json({
        message: 'Assignment completion retrieved successfully',
        assignmentCompletion
      });
    } catch (error) {
      res.status(500).json({
        message: _assignmentCompletion3.ASSIGNMENT_COMPLETION_GET_ERROR,
        error
      });
    }
  },
  authType: _nodeServerEngine.EndpointAuthType.JWT,
  validator: {},
  middleware: [(0, _middleware.checkPermission)("GetAssignmentCompletion")]
});

// Update Assignment Completion Endpoint
const updateAssignmentCompletionByIdEndpoint = exports.updateAssignmentCompletionByIdEndpoint = new _nodeServerEngine.Endpoint({
  path: '/assignment-completion/:id',
  method: _nodeServerEngine.EndpointMethod.PUT,
  handler: async (req, res) => {
    try {
      const updatedAssignmentCompletion = await (0, _assignmentCompletion.updateAssignmentCompletionHandler)(req, req.params.id, req.body, req.file);
      res.status(200).json({
        message: 'Assignment completion updated successfully',
        updatedAssignmentCompletion
      });
    } catch (error) {
      res.status(500).json({
        message: _assignmentCompletion3.ASSIGNMENT_COMPLETION_UPDATE_ERROR,
        error
      });
    }
  },
  authType: _nodeServerEngine.EndpointAuthType.JWT,
  validator: _assignmentCompletion2.updateAssignmentCompletionValidator,
  middleware: [(0, _middleware.checkPermission)("UpdateAssignmentCompletion"), upload.single('courseAssignmentAnswerFile')] // Ensure correct field name
});

// Delete Assignment Completion Endpoint
const deleteAssignmentCompletionEndpoint = exports.deleteAssignmentCompletionEndpoint = new _nodeServerEngine.Endpoint({
  path: '/assignment-completion/:id',
  method: _nodeServerEngine.EndpointMethod.DELETE,
  handler: async (req, res) => {
    try {
      await (0, _assignmentCompletion.deleteAssignmentCompletionHandler)(req, req.params.id);
      res.status(200).json({
        message: 'Assignment completion deleted successfully'
      });
    } catch (error) {
      res.status(500).json({
        message: _assignmentCompletion3.ASSIGNMENT_COMPLETION_DELETION_ERROR,
        error
      });
    }
  },
  authType: _nodeServerEngine.EndpointAuthType.JWT,
  validator: _assignmentCompletion2.deleteAssignmentCompletionValidator,
  middleware: [(0, _middleware.checkPermission)("DeleteAssignmentCompletion")]
});
//# sourceMappingURL=assignmentCompletion.js.map