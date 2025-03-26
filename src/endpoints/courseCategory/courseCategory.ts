import { Endpoint, EndpointAuthType, EndpointMethod } from 'node-server-engine';
import multer from 'multer';
import { Request, Response } from 'express';
import {
  createCourseCategoryHandler,
  updateCourseCategoryHandler,
  getCourseCategoryByIdHandler,
  deleteCourseCategoryHandler,
  getAllCourseCategoriesHandler
} from './courseCategory.handler';

import {
  createCourseCategoryValidator,
  updateCourseCategoryValidator,
  deleteCourseCategoryValidator,
  getCourseCategoryByIdValidator
} from './courseCategory.validator';

import {
  COURSECATEGORY_NOT_FOUND,
  COURSECATEGORY_CREATION_ERROR,
  COURSECATEGORY_UPDATE_ERROR,
  COURSECATEGORY_DELETION_ERROR,
  COURSECATEGORY_GET_ERROR
} from './courseCategory.const';
import { checkPermission } from 'middleware';
// Multer Memory Storage for handling file uploads
const upload = multer({ storage: multer.memoryStorage() });

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

export const createCourseCategoryEndpoint = new Endpoint({
  path: "/coursecategory",
  method: EndpointMethod.POST,
  authType: EndpointAuthType.JWT,
  validator: createCourseCategoryValidator,
  middleware: [
    upload.single("coursecategoryImg"), 
    checkPermission("CreateCategory"),
  ],
  handler: async (req: Request, res: Response): Promise<void> => {
    try {
      console.log("Incoming request:", {
        headers: req.headers,
        body: req.body,
        file: req.file, 
      });

      // Ensure coursecategoryName is present
      if (!req.body.coursecategoryName) {
        res.status(400).json({ error: "Course Category Name is required" });
        return;
      }

      const response = await createCourseCategoryHandler(req, req.body, req.file);

      if (!response.success) {
        res.status(400).json({ error: response.message });
        return;
      }

      res.status(201).json({
        message: response.message,
        courseCategoryId: response.courseCategoryId,
        courseCategoryImg: response.coursecategoryImg,
      });
    } catch (error) {
      console.error("Error creating course category:", error);
      res.status(500).json({ message: "Error creating course category", error });
    }
  },
});


// Get All CourseCategory Endpoint
export const getAllCourseCategoryEndpoint = new Endpoint({
  path: '/coursecategory',
  method: EndpointMethod.GET,
  handler: async (req, res): Promise<void> => {
    try {
      const coursecategory = await getAllCourseCategoriesHandler();

      if (!coursecategory) {
        res.status(404).json({ message: COURSECATEGORY_NOT_FOUND });
        return;
      }

      res.status(200).json({
        message: 'CourseCategory retrieved successfully',
        coursecategory
      });
    } catch (error) {
      res.status(500).json({ message: COURSECATEGORY_GET_ERROR, error });
    }
  },
  authType: EndpointAuthType.NONE,
  validator: {},
});

// Get CourseCategory By ID Endpoint
export const getCourseCategoryByIdEndpoint = new Endpoint({
  path: '/coursecategory/:id',
  method: EndpointMethod.GET,
  handler: async (req: Request, res: Response): Promise<void> => {
    try {
      const coursecategory = await getCourseCategoryByIdHandler(req.params.id);
      res.status(200).json({
        message: 'CourseCategory retrieved successfully',
        coursecategory
      });
    } catch (error) {
      res.status(404).json({ message: COURSECATEGORY_NOT_FOUND, error });
    }
  },
  authType: EndpointAuthType.JWT,
  validator: getCourseCategoryByIdValidator,
  middleware: [checkPermission("GetCategory")],

});

// Update course category Endpoint
export const updateCourseCategoryByIdEndpoint = new Endpoint({
  path: '/coursecategory/:id',
  method: EndpointMethod.PUT,

  handler: async (req, res): Promise<void> => {
    try {
      const updateRole = await updateCourseCategoryHandler(
        req.params.id,
        req,
        req.body,
      );
      res
        .status(200)
        .json({ message: 'courseCategory updated successfully', updateRole });
    } catch (error) {
      res.status(500).json({ message: COURSECATEGORY_UPDATE_ERROR, error });
    }
  },
  authType: EndpointAuthType.JWT,
  validator: updateCourseCategoryValidator,
  middleware: [upload.single('coursecategoryImg'), checkPermission("UpdateCategory")] // Ensure correct field name
});

// Delete coursecategory Endpoint
export const deleteCourseCategoryEndpoint = new Endpoint({
  path: '/coursecategory/:id',
  method: EndpointMethod.DELETE,
  handler: async (req, res): Promise<void> => {
    try {
      await deleteCourseCategoryHandler(req.params.id, req);
      res.json({ message: 'CourseCategory deleted Successfully'});
    } catch (error) {
      res.status(500).json({ message: COURSECATEGORY_DELETION_ERROR, error });
    }
  },
  authType: EndpointAuthType.JWT,
  validator: deleteCourseCategoryValidator,
  middleware: [checkPermission("DeleteCategory")] // Corrected validator
});
