"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.updateCourseCategoryByIdEndpoint = exports.getCourseCategoryByIdEndpoint = exports.getAllCourseCategoryEndpoint = exports.deleteCourseCategoryEndpoint = exports.createCourseCategoryEndpoint = void 0;
var _nodeServerEngine = require("node-server-engine");
var _multer = _interopRequireDefault(require("multer"));
var _courseCategory = require("./courseCategory.handler");
var _courseCategory2 = require("./courseCategory.validator");
var _courseCategory3 = require("./courseCategory.const");
var _middleware = require("../../middleware");
// Multer Memory Storage for handling file uploads
const upload = (0, _multer.default)({
  storage: _multer.default.memoryStorage()
});

// Create CourseCategory Endpoint
// export const createCourseCategoryEndpoint = new Endpoint({
//   path: '/coursecategory',
//   method: EndpointMethod.POST,
//   authType: EndpointAuthType.JWT,
//   validator: createCourseCategoryValidator,
//   middleware: [upload.single('coursecategoryImg'), checkPermission("CreateCategory")],
//   handler: async (req: Request, res: Response): Promise<void> => {
//     try {
//       console.log('Incoming request:', {
//         headers: req.headers,
//         body: req.body,
//         file: req.file // Log file details
//       });

//       // Ensure coursecategoryName is present
//       if (!req.body.coursecategoryName) {
//         res.status(400).json({ error: 'Course Category Name is required' });
//       }

//       // Call handler with request body and file
//       const response = await createCourseCategoryHandler(req, req.body, req.file);

//       if (!response.success) {
//         res.status(400).json({ error: response.message });
//       }

//       res.status(201).json({
//         message: 'Course category created successfully',
//         courseCategoryId: response.courseCategoryId,
//         courseCategoryImg: response.coursecategoryImg
//       });
//     } catch (error) {
//       console.error('Error creating course category:', error);
//       res.status(500).json({ message: COURSECATEGORY_CREATION_ERROR, error });
//     }
//   }
// });

const createCourseCategoryEndpoint = exports.createCourseCategoryEndpoint = new _nodeServerEngine.Endpoint({
  path: "/coursecategory",
  method: _nodeServerEngine.EndpointMethod.POST,
  authType: _nodeServerEngine.EndpointAuthType.JWT,
  validator: _courseCategory2.createCourseCategoryValidator,
  middleware: [upload.single("coursecategoryImg"), (0, _middleware.checkPermission)("CreateCategory")],
  handler: async (req, res) => {
    try {
      console.log("Incoming request:", {
        headers: req.headers,
        body: req.body,
        file: req.file
      });

      // Ensure coursecategoryName is present
      if (!req.body.coursecategoryName) {
        res.status(400).json({
          error: "Course Category Name is required"
        });
        return;
      }
      const response = await (0, _courseCategory.createCourseCategoryHandler)(req, req.body, req.file);
      if (!response.success) {
        res.status(400).json({
          error: response.message
        });
        return;
      }
      res.status(201).json({
        message: response.message,
        courseCategoryId: response.courseCategoryId,
        courseCategoryImg: response.coursecategoryImg
      });
    } catch (error) {
      console.error("Error creating course category:", error);
      res.status(500).json({
        message: "Error creating course category",
        error
      });
    }
  }
});

// Get All CourseCategory Endpoint
const getAllCourseCategoryEndpoint = exports.getAllCourseCategoryEndpoint = new _nodeServerEngine.Endpoint({
  path: '/coursecategory',
  method: _nodeServerEngine.EndpointMethod.GET,
  handler: async (req, res) => {
    try {
      const coursecategory = await (0, _courseCategory.getAllCourseCategoriesHandler)();
      if (!coursecategory) {
        res.status(404).json({
          message: _courseCategory3.COURSECATEGORY_NOT_FOUND
        });
        return;
      }
      res.status(200).json({
        message: 'CourseCategory retrieved successfully',
        coursecategory
      });
    } catch (error) {
      res.status(500).json({
        message: _courseCategory3.COURSECATEGORY_GET_ERROR,
        error
      });
    }
  },
  authType: _nodeServerEngine.EndpointAuthType.NONE,
  validator: {}
});

// Get CourseCategory By ID Endpoint
const getCourseCategoryByIdEndpoint = exports.getCourseCategoryByIdEndpoint = new _nodeServerEngine.Endpoint({
  path: '/coursecategory/:id',
  method: _nodeServerEngine.EndpointMethod.GET,
  handler: async (req, res) => {
    try {
      const coursecategory = await (0, _courseCategory.getCourseCategoryByIdHandler)(req.params.id);
      res.status(200).json({
        message: 'CourseCategory retrieved successfully',
        coursecategory
      });
    } catch (error) {
      res.status(404).json({
        message: _courseCategory3.COURSECATEGORY_NOT_FOUND,
        error
      });
    }
  },
  authType: _nodeServerEngine.EndpointAuthType.JWT,
  validator: _courseCategory2.getCourseCategoryByIdValidator,
  middleware: [(0, _middleware.checkPermission)("GetCategory")]
});

// Update course category Endpoint
const updateCourseCategoryByIdEndpoint = exports.updateCourseCategoryByIdEndpoint = new _nodeServerEngine.Endpoint({
  path: '/coursecategory/:id',
  method: _nodeServerEngine.EndpointMethod.PUT,
  handler: async (req, res) => {
    try {
      const updateRole = await (0, _courseCategory.updateCourseCategoryHandler)(req.params.id, req, req.body);
      res.status(200).json({
        message: 'courseCategory updated successfully',
        updateRole
      });
    } catch (error) {
      res.status(500).json({
        message: _courseCategory3.COURSECATEGORY_UPDATE_ERROR,
        error
      });
    }
  },
  authType: _nodeServerEngine.EndpointAuthType.JWT,
  validator: _courseCategory2.updateCourseCategoryValidator,
  middleware: [upload.single('coursecategoryImg'), (0, _middleware.checkPermission)("UpdateCategory")] // Ensure correct field name
});

// Delete coursecategory Endpoint
const deleteCourseCategoryEndpoint = exports.deleteCourseCategoryEndpoint = new _nodeServerEngine.Endpoint({
  path: '/coursecategory/:id',
  method: _nodeServerEngine.EndpointMethod.DELETE,
  handler: async (req, res) => {
    try {
      await (0, _courseCategory.deleteCourseCategoryHandler)(req.params.id, req);
      res.json({
        message: 'CourseCategory deleted Successfully'
      });
    } catch (error) {
      res.status(500).json({
        message: _courseCategory3.COURSECATEGORY_DELETION_ERROR,
        error
      });
    }
  },
  authType: _nodeServerEngine.EndpointAuthType.JWT,
  validator: _courseCategory2.deleteCourseCategoryValidator,
  middleware: [(0, _middleware.checkPermission)("DeleteCategory")] // Corrected validator
});
//# sourceMappingURL=courseCategory.js.map