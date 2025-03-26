import { Endpoint, EndpointAuthType, EndpointMethod } from 'node-server-engine';
import multer from 'multer';
import { Request, Response } from 'express';
import {
  createCourseHandler,
  updateCourseHandler,
  getCourseByIdHandler,
  deleteCourseHandler,
  getAllCoursesHandler
} from './courses.handler';

import {
  createCourseValidator,
  updateCourseValidator,
  deleteCourseValidator,
  getCourseByIdValidator
} from './courses.validator';

import {
  COURSE_NOT_FOUND,
  COURSE_CREATION_ERROR,
  COURSE_UPDATE_ERROR,
  COURSE_DELETION_ERROR,
  COURSE_GET_ERROR
} from './course.const';
import { checkPermission } from 'middleware';
// Multer Memory Storage for handling file uploads
const upload = multer({ storage: multer.memoryStorage() });

// Create Course Endpoint
export const createCourseEndpoint = new Endpoint({
  path: '/course',
  method: EndpointMethod.POST,
  authType: EndpointAuthType.JWT,
  validator: createCourseValidator,
  middleware: [checkPermission("CreateCourse"), upload.single('courseImg')],

  handler: async (req: Request, res: Response): Promise<void> => {
    try {
      console.log('Incoming request:', {
        headers: req.headers,
        body: req.body,
        file: req.file
      });

      // Ensure courseName is present
      if (!req.body.courseName) {
        res.status(400).json({ error: 'Course Name is required' });
        return;
      }

      // Call handler with request body and file
      const response = await createCourseHandler(req.body, req, req.file);

      if (!response.success) {
        res.status(400).json({ error: response.message });
        return;
      }

      res.status(200).json({
        message: 'Course created successfully',
        courseId: response.courseId,
        courseImg: response.courseImg
      });
    } catch (error) {
      console.error('Error creating course category:', error);
      res.status(500).json({ message: COURSE_CREATION_ERROR, error });
    }
  }
});

// Get All Course Endpoint
export const getAllCourseEndpoint = new Endpoint({
  path: '/course',
  method: EndpointMethod.GET,
  handler: async (req, res): Promise<void> => {
    try {
      const course = await getAllCoursesHandler();

      if (!course) {
        res.status(404).json({ message: COURSE_NOT_FOUND });
        return;
      }

      res.status(200).json({
        message: 'Course retrieved successfully',
        course
      });
    } catch (error) {
      res.status(500).json({ message: COURSE_GET_ERROR, error });
    }
  },
  authType: EndpointAuthType.NONE,
  validator: {},
  // middleware: [checkPermission("GetCourse")]
});

// Get Course By ID Endpoint
export const getCourseByIdEndpoint = new Endpoint({
  path: '/course/:id',
  method: EndpointMethod.GET,
  handler: async (req: Request, res: Response): Promise<void> => {
    try {
      const courseId = req.params.id; // Ensure this is used correctly
      const course = await getCourseByIdHandler(courseId);
      res.status(200).json({
        message: 'Course retrieved successfully',
        course
      });
    } catch (error) {
      res.status(404).json({ message: COURSE_NOT_FOUND, error });
    }
  },
  authType: EndpointAuthType.NONE,
  validator: getCourseByIdValidator,
  // middleware: [checkPermission("GetCourse")]

});

// Update course Endpoint
export const updateCourseByIdEndpoint = new Endpoint({
  path: '/course/:id',
  method: EndpointMethod.PUT,

  handler: async (req, res): Promise<void> => {
    try {
      const updateCourse = await updateCourseHandler(req.params.id, req, req.body,);
      res
        .status(200)
        .json({ message: 'course updated successfully', updateCourse });
    } catch (error) {
      res.status(500).json({ message: COURSE_UPDATE_ERROR, error });
    }
  },
  authType: EndpointAuthType.JWT,
  validator: updateCourseValidator,
  middleware: [upload.single('courseImg'), checkPermission("UpdateCourse")] // Ensure correct field name
});

// Delete course Endpoint
export const deleteCourseEndpoint = new Endpoint({
  path: '/course/:id',
  method: EndpointMethod.DELETE,
  handler: async (req, res): Promise<void> => {
    try {
      await deleteCourseHandler(req.params.id, req);
      res.json({ message: 'Course deleted successfully' });
    } catch (error) {
      res.status(500).json({ message: COURSE_DELETION_ERROR, error });
    }
  },
  authType: EndpointAuthType.JWT,
  validator: deleteCourseValidator,
  middleware: [checkPermission("DeleteCourse")]
});
