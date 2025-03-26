import { Endpoint, EndpointAuthType, EndpointMethod } from 'node-server-engine';
import multer from 'multer';
import { Request, Response } from 'express';
import {
  createAssignmentCompletionHandler,
  updateAssignmentCompletionHandler,
  getAssignmentCompletionByIdHandler,
  deleteAssignmentCompletionHandler,
  getAllAssignmentCompletionsHandler
} from './assignmentCompletion.handler';

import {
  assignmentCompletionValidator,
  updateAssignmentCompletionValidator,
  deleteAssignmentCompletionValidator
} from './assignmentCompletion.validator';

import {
  ASSIGNMENT_COMPLETION_CREATION_ERROR,
  ASSIGNMENT_COMPLETION_UPDATE_ERROR,
  ASSIGNMENT_COMPLETION_DELETION_ERROR,
  ASSIGNMENT_COMPLETION_FETCH_ERROR,
  ASSIGNMENT_COMPLETION_NOT_FOUND,
  ASSIGNMENT_COMPLETION_GET_ERROR
} from './assignmentCompletion.const';
import { checkPermission } from 'middleware';
// Multer Memory Storage for handling file uploads
const upload = multer({ storage: multer.memoryStorage() });

// Create Assignment Completion Endpoint
export const createAssignmentCompletionEndpoint = new Endpoint({
  path: '/assignment-completion',
  method: EndpointMethod.POST,
  authType: EndpointAuthType.JWT,
  validator: assignmentCompletionValidator,
  middleware: [checkPermission("CreateAssignmentCompletion"),upload.single('courseAssignmentAnswerFile')],

  handler: async (req: Request, res: Response): Promise<void> => {
    try {
    
      // Ensure required fields are present
      if (
        !req.body.classId ||
        !req.body.traineeId ||
        !req.body.obtainedMarks
      ) {
        res
          .status(400)
          .json({
            error: 'classId, traineeId, and obtainedMarks are required'
          });
        return;
      }

      // Call handler with request body and file
      const response = await createAssignmentCompletionHandler(
        req,
        req.body,
        req.file
      );

      if (!response.success) {
        res.status(400).json({ error: response.message });
        return;
      }

      res.status(201).json({
        message: 'Assignmentcompletion created successfully',
        response
      });
    } catch (error) {
      console.error('Error creating assignment completion:', error);
      res
        .status(500)
        .json({ message: ASSIGNMENT_COMPLETION_CREATION_ERROR, error });
    }
  }
});

// Get All Assignment Completions Endpoint
export const getAllAssignmentCompletionsEndpoint = new Endpoint({
  path: '/assignment-completion',
  method: EndpointMethod.GET,
  handler: async (req, res): Promise<void> => {
    try {
      const assignmentCompletions = await getAllAssignmentCompletionsHandler();

      if (!assignmentCompletions) {
        res.status(404).json({ message: ASSIGNMENT_COMPLETION_NOT_FOUND });
        return;
      }

      res.status(200).json({
        message: 'Assignment completions retrieved successfully',
        assignmentCompletions
      });
    } catch (error) {
      res
        .status(500)
        .json({ message: ASSIGNMENT_COMPLETION_FETCH_ERROR, error });
    }
  },
  authType: EndpointAuthType.JWT,
  validator: {},
  middleware: [checkPermission("GetAssignmentCompletion")]
});

// Get Assignment Completion By ID Endpoint
export const getAssignmentCompletionByIdEndpoint = new Endpoint({
  path: '/assignment-completion/:id',
  method: EndpointMethod.GET,
  handler: async (req: Request, res: Response): Promise<void> => {
    try {
      const assignmentCompletion = await getAssignmentCompletionByIdHandler(
        req.params.id
      );

      if (!assignmentCompletion) {
        res.status(404).json({ message: ASSIGNMENT_COMPLETION_NOT_FOUND });
        return;
      }

      res.status(200).json({
        message: 'Assignment completion retrieved successfully',
        assignmentCompletion
      });
    } catch (error) {
      res.status(500).json({ message: ASSIGNMENT_COMPLETION_GET_ERROR, error });
    }
  },
  authType: EndpointAuthType.JWT,
  validator: {},
  middleware: [checkPermission("GetAssignmentCompletion")]

});

// Update Assignment Completion Endpoint
export const updateAssignmentCompletionByIdEndpoint = new Endpoint({
  path: '/assignment-completion/:id',
  method: EndpointMethod.PUT,
  handler: async (req, res): Promise<void> => {
    try {
      const updatedAssignmentCompletion =
        await updateAssignmentCompletionHandler(
          req,
          req.params.id,
          req.body,
          req.file
        );

      res.status(200).json({
        message: 'Assignment completion updated successfully',
        updatedAssignmentCompletion
      });
    } catch (error) {
      res
        .status(500)
        .json({ message: ASSIGNMENT_COMPLETION_UPDATE_ERROR, error });
    }
  },
  authType: EndpointAuthType.JWT,
  validator: updateAssignmentCompletionValidator,
  middleware: [checkPermission("UpdateAssignmentCompletion"),upload.single('courseAssignmentAnswerFile')] // Ensure correct field name
});

// Delete Assignment Completion Endpoint
export const deleteAssignmentCompletionEndpoint = new Endpoint({
  path: '/assignment-completion/:id',
  method: EndpointMethod.DELETE,
  handler: async (req, res): Promise<void> => {
    try {
      await deleteAssignmentCompletionHandler(req, req.params.id);
      res
        .status(200)
        .json({ message: 'Assignment completion deleted successfully' });
    } catch (error) {
      res
        .status(500)
        .json({ message: ASSIGNMENT_COMPLETION_DELETION_ERROR, error });
    }
  },
  authType: EndpointAuthType.JWT,
  validator: deleteAssignmentCompletionValidator,
  middleware: [checkPermission("DeleteAssignmentCompletion")]
});
