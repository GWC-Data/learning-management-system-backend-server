"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.updateCourseByIdEndpoint = exports.getCourseByIdEndpoint = exports.getAllCourseEndpoint = exports.deleteCourseEndpoint = exports.createCourseEndpoint = void 0;
var _nodeServerEngine = require("node-server-engine");
var _multer = _interopRequireDefault(require("multer"));
var _courses = require("./courses.handler");
var _courses2 = require("./courses.validator");
var _course = require("./course.const");
var _middleware = require("../../middleware");
// Multer Memory Storage for handling file uploads
const upload = (0, _multer.default)({
  storage: _multer.default.memoryStorage()
});

// Create Course Endpoint
const createCourseEndpoint = exports.createCourseEndpoint = new _nodeServerEngine.Endpoint({
  path: '/course',
  method: _nodeServerEngine.EndpointMethod.POST,
  authType: _nodeServerEngine.EndpointAuthType.JWT,
  validator: _courses2.createCourseValidator,
  middleware: [(0, _middleware.checkPermission)("CreateCourse"), upload.single('courseImg')],
  handler: async (req, res) => {
    try {
      console.log('Incoming request:', {
        headers: req.headers,
        body: req.body,
        file: req.file
      });

      // Ensure courseName is present
      if (!req.body.courseName) {
        res.status(400).json({
          error: 'Course Name is required'
        });
        return;
      }

      // Call handler with request body and file
      const response = await (0, _courses.createCourseHandler)(req.body, req, req.file);
      if (!response.success) {
        res.status(400).json({
          error: response.message
        });
        return;
      }
      res.status(200).json({
        message: 'Course created successfully',
        courseId: response.courseId,
        courseImg: response.courseImg
      });
    } catch (error) {
      console.error('Error creating course category:', error);
      res.status(500).json({
        message: _course.COURSE_CREATION_ERROR,
        error
      });
    }
  }
});

// Get All Course Endpoint
const getAllCourseEndpoint = exports.getAllCourseEndpoint = new _nodeServerEngine.Endpoint({
  path: '/course',
  method: _nodeServerEngine.EndpointMethod.GET,
  handler: async (req, res) => {
    try {
      const course = await (0, _courses.getAllCoursesHandler)();
      if (!course) {
        res.status(404).json({
          message: _course.COURSE_NOT_FOUND
        });
        return;
      }
      res.status(200).json({
        message: 'Course retrieved successfully',
        course
      });
    } catch (error) {
      res.status(500).json({
        message: _course.COURSE_GET_ERROR,
        error
      });
    }
  },
  authType: _nodeServerEngine.EndpointAuthType.NONE,
  validator: {}
  // middleware: [checkPermission("GetCourse")]
});

// Get Course By ID Endpoint
const getCourseByIdEndpoint = exports.getCourseByIdEndpoint = new _nodeServerEngine.Endpoint({
  path: '/course/:id',
  method: _nodeServerEngine.EndpointMethod.GET,
  handler: async (req, res) => {
    try {
      const courseId = req.params.id; // Ensure this is used correctly
      const course = await (0, _courses.getCourseByIdHandler)(courseId);
      res.status(200).json({
        message: 'Course retrieved successfully',
        course
      });
    } catch (error) {
      res.status(404).json({
        message: _course.COURSE_NOT_FOUND,
        error
      });
    }
  },
  authType: _nodeServerEngine.EndpointAuthType.NONE,
  validator: _courses2.getCourseByIdValidator
  // middleware: [checkPermission("GetCourse")]
});

// Update course Endpoint
const updateCourseByIdEndpoint = exports.updateCourseByIdEndpoint = new _nodeServerEngine.Endpoint({
  path: '/course/:id',
  method: _nodeServerEngine.EndpointMethod.PUT,
  handler: async (req, res) => {
    try {
      const updateCourse = await (0, _courses.updateCourseHandler)(req.params.id, req, req.body);
      res.status(200).json({
        message: 'course updated successfully',
        updateCourse
      });
    } catch (error) {
      res.status(500).json({
        message: _course.COURSE_UPDATE_ERROR,
        error
      });
    }
  },
  authType: _nodeServerEngine.EndpointAuthType.JWT,
  validator: _courses2.updateCourseValidator,
  middleware: [upload.single('courseImg'), (0, _middleware.checkPermission)("UpdateCourse")] // Ensure correct field name
});

// Delete course Endpoint
const deleteCourseEndpoint = exports.deleteCourseEndpoint = new _nodeServerEngine.Endpoint({
  path: '/course/:id',
  method: _nodeServerEngine.EndpointMethod.DELETE,
  handler: async (req, res) => {
    try {
      await (0, _courses.deleteCourseHandler)(req.params.id, req);
      res.json({
        message: 'Course deleted successfully'
      });
    } catch (error) {
      res.status(500).json({
        message: _course.COURSE_DELETION_ERROR,
        error
      });
    }
  },
  authType: _nodeServerEngine.EndpointAuthType.JWT,
  validator: _courses2.deleteCourseValidator,
  middleware: [(0, _middleware.checkPermission)("DeleteCourse")]
});
//# sourceMappingURL=courses.js.map