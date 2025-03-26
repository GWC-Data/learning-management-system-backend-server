import { Endpoint, EndpointAuthType, EndpointMethod } from 'node-server-engine';
import multer from 'multer';
import { Request, Response, NextFunction  } from 'express';
import { validationResult } from 'express-validator';
import {
  createModuleHandler,
  updateModuleHandler,
  getModuleByIdHandler,
  deleteModuleHandler,
  getAllModulesHandler
} from './modules.handler';
import {
  createModuleValidator,
  updateModuleValidator,
  getModuleByIdValidator,
  deleteModuleValidator
} from './modules.validator';
import { checkPermission } from 'middleware';
import {
  MODULE_NOT_FOUND,
  MODULE_CREATION_ERROR,
  MODULE_UPDATE_ERROR,
  MODULE_DELETION_ERROR,
  MODULE_GET_ERROR,
  COURSE_NOT_FOUND
} from './modules.const';

// Multer Memory Storage for handling file uploads
const upload = multer({ storage: multer.memoryStorage() });

// Middleware to handle validation errors
const validateRequest = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next(); // Proceed to the next middleware/function if no errors
};

//CREATE MODULE
export const createModuleEndpoint = new Endpoint({
  path: '/module',
  method: EndpointMethod.POST,
  authType: EndpointAuthType.JWT,
  handler: async (req: Request, res: Response): Promise<void> => {
    try {
     
      console.log('Incoming request body:', JSON.stringify(req.body, null, 2));
      console.log('Received moduleName:', req.body.moduleName);

      // Call handler with request body and file
      const response = await createModuleHandler(req, req.body, req.file);

      if (!response.success) {
        res.status(400).json({ error: response.message });
        return 
      }

      res.status(201).json({
        message: 'Module created successfully',
        moduleId: response.moduleId,
        materialForModule: response.materialForModule,
      });
    } catch (error) {
      console.error('Error creating Module:', error);
      res.status(500).json({message: 'Internal server error', error: "error" });
    }
  },
  validator: {}, // Apply the schema-based validator
  middleware: [checkPermission("CreateModule"), upload.single('materialForModule'), validateRequest]
});


// Get All Module Endpoint
export const getAllModuleEndpoint = new Endpoint({
  path: '/module',
  method: EndpointMethod.GET,
  handler: async (req, res): Promise<void> => {
    try {
      const module = await getAllModulesHandler();

      if (!module) {
        res.status(404).json({ message: MODULE_NOT_FOUND });
        return;
      }

      res.status(200).json({
        message: 'Module retrieved successfully',
        module
      });
    } catch (error) {
      res.status(500).json({ message: MODULE_GET_ERROR, error });
    }
  },
  authType: EndpointAuthType.JWT,
  validator: {},
  middleware: [checkPermission("GetModule")]

});

// Get Module By ID Endpoint
export const getModuleByIdEndpoint = new Endpoint({
  path: '/module/:id',
  method: EndpointMethod.GET,
  handler: async (req: Request, res: Response): Promise<void> => {
    try {
      const moduleId = req.params.id; // Ensure this is used correctly
      const module = await getModuleByIdHandler(moduleId);
      res.status(200).json({
        message: 'Module retrieved successfully',
        module
      });
    } catch (error) {
      res.status(404).json({ message: MODULE_NOT_FOUND, error });
    }
  },
  authType: EndpointAuthType.JWT,
  validator: getModuleByIdValidator,
  middleware: [checkPermission("GetModule")]

});

// Update Module Endpoint
export const updateModuleByIdEndpoint = new Endpoint({
  path: '/module/:id',
  method: EndpointMethod.PUT,

  handler: async (req, res): Promise<void> => {
    try {
      const updateModule = await updateModuleHandler(req, req.params.id, req.body);
      res
        .status(200)
        .json({ message: 'Module updated successfully', updateModule });
    } catch (error) {
      res.status(500).json({ message: MODULE_UPDATE_ERROR, error });
    }
  },
  authType: EndpointAuthType.JWT,
  validator: {},
  middleware: [checkPermission("UpdateModule"), upload.single('materialForModule') ]
});

// Delete module Endpoint
export const deleteModuleEndpoint = new Endpoint({
  path: '/module/:id',
  method: EndpointMethod.DELETE,
  handler: async (req, res): Promise<void> => {
    try {
      await deleteModuleHandler(req, req.params.id);
      res.json({ message: 'Module deleted successfully' });
    } catch (error) {
      res.status(500).json({ message: MODULE_DELETION_ERROR, error });
    }
  },
  authType: EndpointAuthType.JWT,
  validator: deleteModuleValidator,
  middleware: [checkPermission("DeleteModule")] 
});
