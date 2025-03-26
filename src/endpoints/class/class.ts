import { Endpoint, EndpointMethod, EndpointAuthType } from 'node-server-engine';
import multer from 'multer';
import { Request, Response } from 'express';
import {
  classValidator,
  updateClassValidator,
  deleteClassValidator
} from './class.validator';
import {
  getAllClassesHandler,
  createClassHandler,
  getClassByIdHandler,
  updateClassHandler,
  deleteClassHandler,
  getClassByModuleIdHandler
} from './class.handler';
import { checkPermission } from 'middleware';

import {
  CLASS_NOT_FOUND,
  CLASS_CREATION_ERROR,
  CLASS_UPDATE_ERROR,
  CLASS_DELETION_ERROR,
  CLASS_GET_ERROR
} from './class.const';

// Multer Memory Storage for handling file uploads
const upload = multer({ storage: multer.memoryStorage() });

// Create class Endpoint
export const createClassEndpoint = new Endpoint({
  path: "/class",
  method: EndpointMethod.POST,
  authType: EndpointAuthType.JWT,
  validator: {},
  middleware: [
    checkPermission("CreateClass"),
    upload.fields([
      { name: "materialForClass", maxCount: 1 },
      { name: "assignmentFile", maxCount: 1 }
    ])
  ],

  handler: async (req: Request, res: Response): Promise<void> => {
    try {
      console.log("Incoming request:", {
        headers: req.headers,
        body: req.body,
        files: req.files, // Log all uploaded files
      });

      // Ensure classTitle is present
      if (!req.body.classTitle) {
        res.status(400).json({ error: "classTitle is required" });
        return;
      }

      // Extract files from request
      const files = req.files as {
        materialForClass?: Express.Multer.File[];
        assignmentFile?: Express.Multer.File[];
      };

      // Call handler with request body and extracted files
      const response = await createClassHandler(
        req,
        req.body,
        {
          materialForClass: files.materialForClass ? files.materialForClass[0] : undefined,
          assignmentFile: files.assignmentFile ? files.assignmentFile[0] : undefined
        }
      );

      if (!response.success) {
        res.status(400).json({ error: response.message });
        return;
      }

      res.status(201).json({
        message: "Class created successfully",
      });
    } catch (error) {
      console.error("Error creating class:", error);
      res.status(500).json({ message: CLASS_CREATION_ERROR, error });
    }
  },
});

// Get All Class Endpoint
export const getAllClassEndpoint = new Endpoint({
  path: '/class',
  method: EndpointMethod.GET,
  handler: async (req, res): Promise<void> => {
    try {
      const classes = await getAllClassesHandler();

      if (!classes) {
        res.status(404).json({ message: CLASS_NOT_FOUND });
        return;
      }

      res.status(200).json({
        message: 'Class retrieved successfully',
        classes
      });
    } catch (error) {
      res.status(500).json({ message: CLASS_GET_ERROR, error });
    }
  },
  authType: EndpointAuthType.NONE,
  validator: {},
  // middleware: [checkPermission("GetClass")]
});

// Get Class By ID Endpoint
export const getClassByIdEndpoint = new Endpoint({
  path: '/class/:id',
  method: EndpointMethod.GET,
  handler: async (req: Request, res: Response): Promise<void> => {
    try {
      const classId = req.params.id; // Ensure this is used correctly
      const classData = await getClassByIdHandler(classId);
      res.status(200).json({
        message: 'Class retrieved successfully',
        class: classData
      });
    } catch (error) {
      res.status(404).json({ message: CLASS_NOT_FOUND, error });
    }
  },
  authType: EndpointAuthType.NONE,
  validator: {},
  // middleware: [checkPermission("GetClass")]
});

// Get Class By ID Endpoint
export const getClassByModuleIdEndpoint = new Endpoint({
  path: '/classbyModule/:id',
  method: EndpointMethod.GET,
  handler: async (req: Request, res: Response): Promise<void> => {
    try {
      const moduleId = req.params.id; // Ensure this is used correctly
      const classData = await getClassByModuleIdHandler(moduleId);
      res.status(200).json({
        message: 'Class retrieved successfully',
        class: classData
      });
    } catch (error) {
      res.status(404).json({ message: CLASS_NOT_FOUND, error });
    }
  },
  authType: EndpointAuthType.NONE,
  validator: {},
  // middleware: [checkPermission("GetClass")]
});

// Update classbyid Endpoint
export const updateClassByIdEndpoint = new Endpoint({
  path: "/class/:id",
  method: EndpointMethod.PUT,

  handler: async (req, res): Promise<void> => {
    try {
      const files = req.files as { [key: string]: Express.Multer.File[] } | undefined;

      const updateClass = await updateClassHandler(req, req.params.id, req.body, {
        materialForClass: files?.materialForClass,
        assignmentFile: files?.assignmentFile,
      });

      if (!updateClass.success) {
        res.status(400).json({ message: "Failed to update class", errors: updateClass.errors });
        return;
      }

      res.status(200).json({ message: "Class updated successfully", classData: updateClass.classData });
    } catch (error) {
      console.error("Error in updateClassByIdEndpoint:", error);
      res.status(500).json({ message: "Internal server error while updating class", error });
    }
  },

  authType: EndpointAuthType.JWT,
  validator: {},

  middleware: [
    checkPermission("UpdateClass"),
    upload.fields([
      { name: "materialForClass", maxCount: 1 },
      { name: "assignmentFile", maxCount: 1 },
    ]),
  ],
});



// Delete Class Endpoint
export const deleteClassEndpoint = new Endpoint({
  path: '/class/:id',
  method: EndpointMethod.DELETE,
  handler: async (req, res): Promise<void> => {
    try {
      await deleteClassHandler(req, req.params.id);
      res.json({ message: 'Class deleted successfully' });
    } catch (error) {
      res.status(500).json({ message: CLASS_DELETION_ERROR, error });
    }
  },
  authType: EndpointAuthType.JWT,
  validator: deleteClassValidator,
  middleware: [checkPermission("DeleteClass")] 
});
