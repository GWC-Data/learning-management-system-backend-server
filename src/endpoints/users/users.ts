import { Endpoint, EndpointAuthType, EndpointMethod } from 'node-server-engine';
import {
  createUserValidator,
  updateUserValidator,
  idValidator
} from './users.validator';
import {
  getAllUsersHandler,
  getUserByIdHandler,
  createUserHandler,
  updateUserForAdminHandler,
  updateUserForTraineeHandler,
  deleteUserHandler
} from './users.handler';

import multer from 'multer';
import { checkPermission } from 'middleware';

// Multer Memory Storage
const upload = multer({ storage: multer.memoryStorage() });

export const createUserEndpoint = new Endpoint({
  path: '/users',
  method: EndpointMethod.POST,
  handler: async (req, res) => {
    try {
     
      const user = await createUserHandler(req, req.body);

      if (!user || user.success === false) {
        res
          .status(400)
          .json({
            message: 'Failed to create user',
            errors: user?.errors || ['Unknown error occurred.']
          });
        return;
      }

      res.status(201).json({ message: 'User created successfully', user });
    } catch (error) {
      console.error('Error creating user:', error);
      res
        .status(500)
        .json({
          message: 'Internal server error',
          errors: [(error as Error).message || 'Something went wrong']
        });
    }
  },
  authType: EndpointAuthType.JWT,
  validator: createUserValidator,
  middleware: [checkPermission("CreateUser"), upload.single('profilePic')]
});

// Get All Users Endpoint
export const getAllUsersEndpoint = new Endpoint({
  path: '/users',
  method: EndpointMethod.GET,
  handler: async (req, res): Promise<void> => {
    try {
      const users = await getAllUsersHandler();
      res.status(200).json({message: 'Users retrieved successfully', users});
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  },
  authType: EndpointAuthType.JWT,
  validator: {},
  middleware: [checkPermission("GetUser")]
});

// Get User By ID Endpoint
export const getUserByIdEndpoint = new Endpoint({
  path: '/users/:id',
  method: EndpointMethod.GET,
  handler: async (req, res): Promise<void> => {
    try {
      const user = await getUserByIdHandler(req.params.id);
      if (!user) {
        res.status(404).json({ message: 'User not found' });
      }
      res.json(user);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  },
  authType: EndpointAuthType.JWT,
  validator: idValidator,
  middleware: [checkPermission("GetUser")]
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
export const updateUserForAdminEndpoint = new Endpoint({
  path: "/userForAdmin/:id",
  method: EndpointMethod.PUT,
  handler: async (req, res): Promise<void> => {
    try {
      const userId = req.params.id;
      const updatedData = req.body;
 
      // Call the update handler
      const response = await updateUserForAdminHandler(req, userId, updatedData);
 
      res.status(200).json(response);
    } catch (error) {
      console.error("Error updating user:", error);
      res.status(500).json({ error: (error as Error).message || "Internal server error" });
    }
  },
  authType: EndpointAuthType.JWT,
  validator: updateUserValidator,
  middleware: [checkPermission("UpdateUser")],
});

// Update User for Trainee Endpoint
export const updateUserForTraineeEndpoint = new Endpoint({
  path: '/userForTrainee/:id',
  method: EndpointMethod.PUT,
  handler: async (req, res): Promise<void> => {
    try {
      console.log('Headers:', req.headers);
      console.log('Body:', req.body);
      console.log('File:', req.file);
 
      // Pass both form-data fields and the uploaded file
      const response = await updateUserForTraineeHandler(
        req,
        req.params.id,
        req.body,
        req.file
      );
 
      res.status(200).json(response);
    } catch (error) {
      console.error('Error updating user:', error);
      res
        .status(500)
        .json({ error: (error as Error).message || 'Internal server error' });
    }
  },
  authType: EndpointAuthType.JWT,
  validator: updateUserValidator,
  middleware: [checkPermission('UpdateUser'), upload.single('profilePic')] // Multer Middleware for File Uploads
});

// Delete User Endpoint
export const deleteUserEndpoint = new Endpoint({
  path: '/users/:id',
  method: EndpointMethod.DELETE,
  handler: async (req, res): Promise<void> => {
    try {
      await deleteUserHandler(req, req.params.id);
      res.json({ message: 'User deleted successfully' });
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  },
  authType: EndpointAuthType.JWT,
  validator: idValidator,
  middleware: [checkPermission("DeleteUser")]
});
