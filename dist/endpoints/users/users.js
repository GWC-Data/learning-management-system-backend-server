"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.updateUserForTraineeEndpoint = exports.updateUserForAdminEndpoint = exports.getUserByIdEndpoint = exports.getAllUsersEndpoint = exports.deleteUserEndpoint = exports.createUserEndpoint = void 0;
var _nodeServerEngine = require("node-server-engine");
var _users = require("./users.validator");
var _users2 = require("./users.handler");
var _multer = _interopRequireDefault(require("multer"));
var _middleware = require("../../middleware");
// Multer Memory Storage
const upload = (0, _multer.default)({
  storage: _multer.default.memoryStorage()
});
const createUserEndpoint = exports.createUserEndpoint = new _nodeServerEngine.Endpoint({
  path: '/users',
  method: _nodeServerEngine.EndpointMethod.POST,
  handler: async (req, res) => {
    try {
      const user = await (0, _users2.createUserHandler)(req, req.body);
      if (!user || user.success === false) {
        res.status(400).json({
          message: 'Failed to create user',
          errors: user?.errors || ['Unknown error occurred.']
        });
        return;
      }
      res.status(201).json({
        message: 'User created successfully',
        user
      });
    } catch (error) {
      console.error('Error creating user:', error);
      res.status(500).json({
        message: 'Internal server error',
        errors: [error.message || 'Something went wrong']
      });
    }
  },
  authType: _nodeServerEngine.EndpointAuthType.JWT,
  validator: _users.createUserValidator,
  middleware: [(0, _middleware.checkPermission)("CreateUser"), upload.single('profilePic')]
});

// Get All Users Endpoint
const getAllUsersEndpoint = exports.getAllUsersEndpoint = new _nodeServerEngine.Endpoint({
  path: '/users',
  method: _nodeServerEngine.EndpointMethod.GET,
  handler: async (req, res) => {
    try {
      const users = await (0, _users2.getAllUsersHandler)();
      res.status(200).json({
        message: 'Users retrieved successfully',
        users
      });
    } catch (error) {
      res.status(500).json({
        error: error.message
      });
    }
  },
  authType: _nodeServerEngine.EndpointAuthType.JWT,
  validator: {},
  middleware: [(0, _middleware.checkPermission)("GetUser")]
});

// Get User By ID Endpoint
const getUserByIdEndpoint = exports.getUserByIdEndpoint = new _nodeServerEngine.Endpoint({
  path: '/users/:id',
  method: _nodeServerEngine.EndpointMethod.GET,
  handler: async (req, res) => {
    try {
      const user = await (0, _users2.getUserByIdHandler)(req.params.id);
      if (!user) {
        res.status(404).json({
          message: 'User not found'
        });
      }
      res.json(user);
    } catch (error) {
      res.status(500).json({
        error: error.message
      });
    }
  },
  authType: _nodeServerEngine.EndpointAuthType.JWT,
  validator: _users.idValidator,
  middleware: [(0, _middleware.checkPermission)("GetUser")]
});

// Update User Endpoint
// export const updateUserEndpoint = new Endpoint({
//   path: '/users/:id',
//   method: EndpointMethod.PUT,
//   handler: async (req, res): Promise<void> => {
//     try {
//       console.log('Headers:', req.headers);
//       console.log('Body:', req.body);
//       console.log('File:', req.file);

//       // Pass both form-data fields and the uploaded file
//       const response = await updateUserHandler(
//         req,
//         req.params.id,
//         req.body,
//         req.file
//       );

//       res.status(200).json(response);
//     } catch (error) {
//       console.error('Error updating user:', error);
//       res
//         .status(500)
//         .json({ error: (error as Error).message || 'Internal server error' });
//     }
//   },
//   authType: EndpointAuthType.JWT,
//   validator: updateUserValidator,
//   middleware: [checkPermission("UpdateUser"),upload.single('profilePic')] // Add Multer Middleware for File Uploads
// });

//Update User For Admin

const updateUserForAdminEndpoint = exports.updateUserForAdminEndpoint = new _nodeServerEngine.Endpoint({
  path: "/userForAdmin/:id",
  method: _nodeServerEngine.EndpointMethod.PUT,
  handler: async (req, res) => {
    try {
      const userId = req.params.id;
      const updatedData = req.body;

      // Call the update handler
      const response = await (0, _users2.updateUserForAdminHandler)(req, userId, updatedData);
      res.status(200).json({
        message: "User updated successfully",
        response
      });
    } catch (error) {
      console.error("Error updating user:", error);
      res.status(500).json({
        error: error.message || "Internal server error"
      });
    }
  },
  authType: _nodeServerEngine.EndpointAuthType.JWT,
  validator: _users.updateUserValidator,
  middleware: [(0, _middleware.checkPermission)("UpdateUser")]
});

// Update User for Trainee Endpoint
const updateUserForTraineeEndpoint = exports.updateUserForTraineeEndpoint = new _nodeServerEngine.Endpoint({
  path: '/userForTrainee/:id',
  method: _nodeServerEngine.EndpointMethod.PUT,
  handler: async (req, res) => {
    try {
      console.log('Headers:', req.headers);
      console.log('Body:', req.body);
      console.log('File:', req.file);

      // Pass both form-data fields and the uploaded file
      const response = await (0, _users2.updateUserForTraineeHandler)(req, req.params.id, req.body, req.file);
      res.status(200).json(response);
    } catch (error) {
      console.error('Error updating user:', error);
      res.status(500).json({
        error: error.message || 'Internal server error'
      });
    }
  },
  authType: _nodeServerEngine.EndpointAuthType.JWT,
  validator: _users.updateUserValidator,
  middleware: [(0, _middleware.checkPermission)('UpdateUser'), upload.single('profilePic')] // Multer Middleware for File Uploads
});

// Delete User Endpoint
const deleteUserEndpoint = exports.deleteUserEndpoint = new _nodeServerEngine.Endpoint({
  path: '/users/:id',
  method: _nodeServerEngine.EndpointMethod.DELETE,
  handler: async (req, res) => {
    try {
      await (0, _users2.deleteUserHandler)(req, req.params.id);
      res.json({
        message: 'User deleted successfully'
      });
    } catch (error) {
      res.status(500).json({
        error: error.message
      });
    }
  },
  authType: _nodeServerEngine.EndpointAuthType.JWT,
  validator: _users.idValidator,
  middleware: [(0, _middleware.checkPermission)("DeleteUser")]
});
//# sourceMappingURL=users.js.map