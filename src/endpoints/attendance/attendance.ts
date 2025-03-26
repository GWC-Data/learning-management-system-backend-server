import { Endpoint, EndpointAuthType, EndpointMethod } from 'node-server-engine';
import multer from 'multer';
import { Request, Response } from 'express';

import {
  createAttendanceFileHandler,
  getAllAttendanceFilesHandler,
  getAttendanceFileByIdHandler,
  getAttendanceFilesByClassIdHandler,
  updateAttendanceFileHandler,
  deleteAttendanceFileHandler,
  createAttendanceHandler,
  getAttendanceHandler,
  deleteAttendanceByClassIdHandler,
  getAllAttendanceHandler
} from './attendance.handler';

import {
  createAttendanceFileValidator,
  updateAttendanceFileValidator,
  getAttendanceFileValidator,
  deleteAttendanceFileValidator
} from './attendance.validator';

import {
  ATTENDANCEFILE_NOT_FOUND,
  ATTENDANCEFILE_CREATION_ERROR,
  ATTENDANCEFILE_UPDATE_ERROR,
  ATTENDANCEFILE_DELETE_ERROR,
  ATTENDANCEFILE_GET_ERROR
} from './attendance.const';
import { checkPermission } from 'middleware';
// Multer Memory Storage for handling file uploads
const upload = multer({ storage: multer.memoryStorage() });

// Create attendanceFile Endpoint
export const createAttendanceFileEndpoint = new Endpoint({
  path: '/attendance-file',
  method: EndpointMethod.POST,
  authType: EndpointAuthType.JWT,
  validator: {},
  middleware: [checkPermission("CreateAttendanceFile"), upload.single('teamsAttendanceFile')], 

  handler: async (req: Request, res: Response): Promise<void> => {
    try {
      console.log('Incoming request:', {
        headers: req.headers,
        body: req.body,
        file: req.file // Log file details
      });

      // Ensure classId is present
      if (!req.body.classId) {
        res.status(400).json({ error: 'ClassId is required' });
        return;
      }

      // Call handler with request body and file
      const response = await createAttendanceFileHandler(req, req.body, req.file);

      if (!response.success) {
        res.status(400).json({ error: response.message });
        return;
      }

      res.status(201).json({
        message: 'AttendanceFile created successfully',
        attendanceFileId: response.attendanceFileId,
        teamsAttendanceFile: response.teamsAttendanceFile
      });
    } catch (error) {
      console.error('Error creating Attendance File:', error);
      res.status(500).json({ message: ATTENDANCEFILE_CREATION_ERROR, error });
    }
  }
});

// Get All AttendanceFile Endpoint
export const getAllAttendanceFileEndpoint = new Endpoint({
  path: '/attendance-file',
  method: EndpointMethod.GET,
  handler: async (req, res): Promise<void> => {
    try {
      const attendanceFile = await getAllAttendanceFilesHandler();

      if (!attendanceFile) {
        res.status(404).json({ message: ATTENDANCEFILE_NOT_FOUND });
        return;
      }

      res.status(200).json({
        message: 'AttendanceFile retrieved successfully',
        attendanceFile
      });
    } catch (error) {
      res.status(500).json({ message: ATTENDANCEFILE_GET_ERROR, error });
    }
  },
  authType: EndpointAuthType.JWT,
  validator: {},
  middleware: [checkPermission("GetAttendanceFile")]
});

// Get AttendanceFile By ID Endpoint
export const getAttendanceFileByIdEndpoint = new Endpoint({
  path: '/attendance-file/:id',
  method: EndpointMethod.GET,
  handler: async (req: Request, res: Response): Promise<void> => {
    try {
      const attendanceFile = await getAttendanceFileByIdHandler(req.params.id);
      res.status(200).json({
        message: 'AttendanceFile retrieved successfully',
        attendanceFile
      });
    } catch (error) {
      res.status(404).json({ message: ATTENDANCEFILE_NOT_FOUND, error });
    }
  },
  authType: EndpointAuthType.JWT,
  validator: {},
  middleware: [checkPermission("GetAttendanceFile")]
});

// Get AttendanceFile By ID Endpoint
export const getAttendanceFilesByClassIdEndpoint = new Endpoint({
  path: '/attendance-file/:id',
  method: EndpointMethod.GET,
  handler: async (req: Request, res: Response): Promise<void> => {
    try {
      const attendanceFile = await getAttendanceFilesByClassIdHandler(
        req.params.id
      );
      res.status(200).json({
        message: 'AttendanceFile retrieved successfully',
        attendanceFile
      });
    } catch (error) {
      res.status(404).json({ message: ATTENDANCEFILE_NOT_FOUND, error });
    }
  },
  authType: EndpointAuthType.JWT,
  validator: {},
  middleware: [checkPermission("GetAttendanceFile")]
});

// Update AttendanceFile Endpoint
export const updateAttendanceFileByIdEndpoint = new Endpoint({
  path: '/attendance-file/:id',
  method: EndpointMethod.PUT,

  handler: async (req, res): Promise<void> => {
    try {
      const updateRole = await updateAttendanceFileHandler(
        req,
        req.params.id,
        req.body
      );
      res
        .status(200)
        .json({ message: 'AttendanceFile updated successfully', updateRole });
    } catch (error) {
      res.status(500).json({ message: ATTENDANCEFILE_UPDATE_ERROR, error });
    }
  },
  authType: EndpointAuthType.NONE,
  validator: {},
  middleware: [checkPermission("UpdateAttendanceFile"), upload.single('teamsAttendanceFile')] // Ensure correct field name
});

// Delete AttendanceFile Endpoint
export const deleteAttendanceFileEndpoint = new Endpoint({
  path: '/attendance-file/:id',
  method: EndpointMethod.DELETE,
  handler: async (req, res): Promise<void> => {
    try {
      await deleteAttendanceFileHandler(req, req.params.id);
      res.json({ message: 'Attendance File deleted successfully' });
    } catch (error) {
      res.status(500).json({ message: ATTENDANCEFILE_DELETE_ERROR, error });
    }
  },
  authType: EndpointAuthType.JWT,
  validator: deleteAttendanceFileValidator,
  middleware: [checkPermission("DeleteAttendanceFile")]
});

//Attendance - Create
export const createAttendanceEndpoint = new Endpoint({
  path: '/attendance',
  method: EndpointMethod.POST,
  authType: EndpointAuthType.JWT,
  validator: {},
  middleware: [checkPermission("CreateAttendance"), upload.single('excelFile')], // Ensure correct field name

  handler: async (req: Request, res: Response): Promise<void> => {
    try {

      // Ensure required fields are present
      if (!req.body.batchId || !req.body.moduleId || !req.body.classId) {
        res
          .status(400)
          .json({ error: 'batchId, moduleId, and classId are required' });
          return;
      }

      if (!req.file) {
        res.status(400).json({ error: 'Excel file is required' });
        return;
      }

      // Call handler (it already sends responses)
      await createAttendanceHandler(req, res);
    } catch (error) {
      console.error('Error creating attendance:', error);
      res.status(500).json({ message: 'Internal Server Error', error });
    }
  }
});


export const getAllAttendanceEndpoint = new Endpoint({
  path: '/attendance',
  method: EndpointMethod.GET,
  handler: async (req: Request, res: Response): Promise<void> => {
    try {
      const attendance = await getAllAttendanceHandler();

      if (!attendance) {
        res.status(404).json({ message: ATTENDANCEFILE_NOT_FOUND });
        return;
      }

      res.status(200).json({
        message: 'Attendance retrieved successfully',
        attendance
      });
    } catch (error) {
      res.status(500).json({ message: ATTENDANCEFILE_GET_ERROR, error });
    }
  },
  authType: EndpointAuthType.JWT,
  validator: {},
  middleware: [checkPermission("GetAttendance")]
});

export const getAttendanceEndpoint = new Endpoint({
  path: "/attendance/:id?",
  method: EndpointMethod.GET,
  authType: EndpointAuthType.JWT,
  validator: {},
  middleware: [checkPermission("GetAttendance")],
  handler: async (req: Request, res: Response): Promise<void> => {
    try {
      const result = await getAttendanceHandler(req);

      if (result.error) {
         res.status(404).json({ message: "No attendance records found" });
         return;
      }

      res.status(200).json({
        message: "Attendance retrieved successfully",
        attendanceRecords: result.attendanceRecords,
      });
    } catch (error) {
      console.error("❌ Error in attendance endpoint:", error);
      res.status(500).json({ message: "Error fetching attendance records", error });
    }
  },
});

//http://localhost:PORT/attendance/12345
// http://localhost:PORT/attendance?userId=67890
// {{baseUrl}}/attendance?batchId=6fbabb70-d8c6-4fd4-a531-bcc86c29fb19

export const deleteAttendanceEndpoint = new Endpoint({
  path: '/attendance',
  method: EndpointMethod.DELETE,
  authType: EndpointAuthType.JWT, // Change as needed
  validator: {},
  middleware: [checkPermission("DeleteAttendance")],

  handler: async (req: Request, res: Response): Promise<void> => {
    try {
      const { classId } = req.query;

      if (!classId) {
        res.status(400).json({ error: 'classId is required' });
        return;
      }

      const response = await deleteAttendanceByClassIdHandler(req, classId as string);

      if (!response.success) {
        res.status(400).json({ error: response.error });
        return;
      } else {
        res.status(200).json({ message: response.message });
        return;
      }
    } catch (error) {
      console.error('Error deleting attendance:', error);
      res.status(500).json({ message: 'Error deleting attendance', error });
    }
  }
});


// {{baseUrl}}/attendance?classId=6956b0cb-7d31-4e4c-8c13-ef7c9b677327 - Delete


// export const updateAttendanceByClassIdEndpoint = new Endpoint({
//   path: "/attendance",
//   method: EndpointMethod.PUT,
//   authType: EndpointAuthType.NONE, // Change as needed
//   validator: {},

//   handler: async (req: Request, res: Response): Promise<void> => {
//     try {
//       const classId = req.query.classId as string; // Explicitly cast classId to string
//       const updateData = req.body;

//       if (!classId) {
//         res.status(400).json({ error: "classId is required" });
//         return;
//       }

//       const response = await updateAttendanceByClassIdHandler(classId, updateData);

//       if (!response.success) {
//         res.status(400).json({ error: response.error });
//       } else {
//         res.status(200).json({ message: response.message });
//       }
//     } catch (error) {
//       console.error("Error updating attendance:", error);
//       res.status(500).json({ message: "Error updating attendance", error });
//     }
//   },
// });
