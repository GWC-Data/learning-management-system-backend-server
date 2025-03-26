"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.updateAttendanceFileByIdEndpoint = exports.getAttendanceFilesByClassIdEndpoint = exports.getAttendanceFileByIdEndpoint = exports.getAttendanceEndpoint = exports.getAllAttendanceFileEndpoint = exports.getAllAttendanceEndpoint = exports.deleteAttendanceFileEndpoint = exports.deleteAttendanceEndpoint = exports.createAttendanceFileEndpoint = exports.createAttendanceEndpoint = void 0;
var _nodeServerEngine = require("node-server-engine");
var _multer = _interopRequireDefault(require("multer"));
var _attendance = require("./attendance.handler");
var _attendance2 = require("./attendance.validator");
var _attendance3 = require("./attendance.const");
var _middleware = require("../../middleware");
// Multer Memory Storage for handling file uploads
const upload = (0, _multer.default)({
  storage: _multer.default.memoryStorage()
});

// Create attendanceFile Endpoint
const createAttendanceFileEndpoint = exports.createAttendanceFileEndpoint = new _nodeServerEngine.Endpoint({
  path: '/attendance-file',
  method: _nodeServerEngine.EndpointMethod.POST,
  authType: _nodeServerEngine.EndpointAuthType.JWT,
  validator: {},
  middleware: [(0, _middleware.checkPermission)("CreateAttendanceFile"), upload.single('teamsAttendanceFile')],
  handler: async (req, res) => {
    try {
      console.log('Incoming request:', {
        headers: req.headers,
        body: req.body,
        file: req.file // Log file details
      });

      // Ensure classId is present
      if (!req.body.classId) {
        res.status(400).json({
          error: 'ClassId is required'
        });
        return;
      }

      // Call handler with request body and file
      const response = await (0, _attendance.createAttendanceFileHandler)(req, req.body, req.file);
      if (!response.success) {
        res.status(400).json({
          error: response.message
        });
        return;
      }
      res.status(201).json({
        message: 'AttendanceFile created successfully',
        attendanceFileId: response.attendanceFileId,
        teamsAttendanceFile: response.teamsAttendanceFile
      });
    } catch (error) {
      console.error('Error creating Attendance File:', error);
      res.status(500).json({
        message: _attendance3.ATTENDANCEFILE_CREATION_ERROR,
        error
      });
    }
  }
});

// Get All AttendanceFile Endpoint
const getAllAttendanceFileEndpoint = exports.getAllAttendanceFileEndpoint = new _nodeServerEngine.Endpoint({
  path: '/attendance-file',
  method: _nodeServerEngine.EndpointMethod.GET,
  handler: async (req, res) => {
    try {
      const attendanceFile = await (0, _attendance.getAllAttendanceFilesHandler)();
      if (!attendanceFile) {
        res.status(404).json({
          message: _attendance3.ATTENDANCEFILE_NOT_FOUND
        });
        return;
      }
      res.status(200).json({
        message: 'AttendanceFile retrieved successfully',
        attendanceFile
      });
    } catch (error) {
      res.status(500).json({
        message: _attendance3.ATTENDANCEFILE_GET_ERROR,
        error
      });
    }
  },
  authType: _nodeServerEngine.EndpointAuthType.JWT,
  validator: {},
  middleware: [(0, _middleware.checkPermission)("GetAttendanceFile")]
});

// Get AttendanceFile By ID Endpoint
const getAttendanceFileByIdEndpoint = exports.getAttendanceFileByIdEndpoint = new _nodeServerEngine.Endpoint({
  path: '/attendance-file/:id',
  method: _nodeServerEngine.EndpointMethod.GET,
  handler: async (req, res) => {
    try {
      const attendanceFile = await (0, _attendance.getAttendanceFileByIdHandler)(req.params.id);
      res.status(200).json({
        message: 'AttendanceFile retrieved successfully',
        attendanceFile
      });
    } catch (error) {
      res.status(404).json({
        message: _attendance3.ATTENDANCEFILE_NOT_FOUND,
        error
      });
    }
  },
  authType: _nodeServerEngine.EndpointAuthType.JWT,
  validator: {},
  middleware: [(0, _middleware.checkPermission)("GetAttendanceFile")]
});

// Get AttendanceFile By ID Endpoint
const getAttendanceFilesByClassIdEndpoint = exports.getAttendanceFilesByClassIdEndpoint = new _nodeServerEngine.Endpoint({
  path: '/attendance-file/:id',
  method: _nodeServerEngine.EndpointMethod.GET,
  handler: async (req, res) => {
    try {
      const attendanceFile = await (0, _attendance.getAttendanceFilesByClassIdHandler)(req.params.id);
      res.status(200).json({
        message: 'AttendanceFile retrieved successfully',
        attendanceFile
      });
    } catch (error) {
      res.status(404).json({
        message: _attendance3.ATTENDANCEFILE_NOT_FOUND,
        error
      });
    }
  },
  authType: _nodeServerEngine.EndpointAuthType.JWT,
  validator: {},
  middleware: [(0, _middleware.checkPermission)("GetAttendanceFile")]
});

// Update AttendanceFile Endpoint
const updateAttendanceFileByIdEndpoint = exports.updateAttendanceFileByIdEndpoint = new _nodeServerEngine.Endpoint({
  path: '/attendance-file/:id',
  method: _nodeServerEngine.EndpointMethod.PUT,
  handler: async (req, res) => {
    try {
      const updateRole = await (0, _attendance.updateAttendanceFileHandler)(req, req.params.id, req.body);
      res.status(200).json({
        message: 'AttendanceFile updated successfully',
        updateRole
      });
    } catch (error) {
      res.status(500).json({
        message: _attendance3.ATTENDANCEFILE_UPDATE_ERROR,
        error
      });
    }
  },
  authType: _nodeServerEngine.EndpointAuthType.NONE,
  validator: {},
  middleware: [(0, _middleware.checkPermission)("UpdateAttendanceFile"), upload.single('teamsAttendanceFile')] // Ensure correct field name
});

// Delete AttendanceFile Endpoint
const deleteAttendanceFileEndpoint = exports.deleteAttendanceFileEndpoint = new _nodeServerEngine.Endpoint({
  path: '/attendance-file/:id',
  method: _nodeServerEngine.EndpointMethod.DELETE,
  handler: async (req, res) => {
    try {
      await (0, _attendance.deleteAttendanceFileHandler)(req, req.params.id);
      res.json({
        message: 'Attendance File deleted successfully'
      });
    } catch (error) {
      res.status(500).json({
        message: _attendance3.ATTENDANCEFILE_DELETE_ERROR,
        error
      });
    }
  },
  authType: _nodeServerEngine.EndpointAuthType.JWT,
  validator: _attendance2.deleteAttendanceFileValidator,
  middleware: [(0, _middleware.checkPermission)("DeleteAttendanceFile")]
});

//Attendance - Create
const createAttendanceEndpoint = exports.createAttendanceEndpoint = new _nodeServerEngine.Endpoint({
  path: '/attendance',
  method: _nodeServerEngine.EndpointMethod.POST,
  authType: _nodeServerEngine.EndpointAuthType.JWT,
  validator: {},
  middleware: [(0, _middleware.checkPermission)("CreateAttendance"), upload.single('excelFile')],
  // Ensure correct field name

  handler: async (req, res) => {
    try {
      // Ensure required fields are present
      if (!req.body.batchId || !req.body.moduleId || !req.body.classId) {
        res.status(400).json({
          error: 'batchId, moduleId, and classId are required'
        });
        return;
      }
      if (!req.file) {
        res.status(400).json({
          error: 'Excel file is required'
        });
        return;
      }

      // Call handler (it already sends responses)
      await (0, _attendance.createAttendanceHandler)(req, res);
    } catch (error) {
      console.error('Error creating attendance:', error);
      res.status(500).json({
        message: 'Internal Server Error',
        error
      });
    }
  }
});
const getAllAttendanceEndpoint = exports.getAllAttendanceEndpoint = new _nodeServerEngine.Endpoint({
  path: '/attendance',
  method: _nodeServerEngine.EndpointMethod.GET,
  handler: async (req, res) => {
    try {
      const attendance = await (0, _attendance.getAllAttendanceHandler)();
      if (!attendance) {
        res.status(404).json({
          message: _attendance3.ATTENDANCEFILE_NOT_FOUND
        });
        return;
      }
      res.status(200).json({
        message: 'Attendance retrieved successfully',
        attendance
      });
    } catch (error) {
      res.status(500).json({
        message: _attendance3.ATTENDANCEFILE_GET_ERROR,
        error
      });
    }
  },
  authType: _nodeServerEngine.EndpointAuthType.JWT,
  validator: {},
  middleware: [(0, _middleware.checkPermission)("GetAttendance")]
});
const getAttendanceEndpoint = exports.getAttendanceEndpoint = new _nodeServerEngine.Endpoint({
  path: "/attendance/:id?",
  method: _nodeServerEngine.EndpointMethod.GET,
  authType: _nodeServerEngine.EndpointAuthType.JWT,
  validator: {},
  middleware: [(0, _middleware.checkPermission)("GetAttendance")],
  handler: async (req, res) => {
    try {
      const result = await (0, _attendance.getAttendanceHandler)(req);
      if (result.error) {
        res.status(404).json({
          message: "No attendance records found"
        });
        return;
      }
      res.status(200).json({
        message: "Attendance retrieved successfully",
        attendanceRecords: result.attendanceRecords
      });
    } catch (error) {
      console.error("❌ Error in attendance endpoint:", error);
      res.status(500).json({
        message: "Error fetching attendance records",
        error
      });
    }
  }
});

//http://localhost:PORT/attendance/12345
// http://localhost:PORT/attendance?userId=67890
// {{baseUrl}}/attendance?batchId=6fbabb70-d8c6-4fd4-a531-bcc86c29fb19

const deleteAttendanceEndpoint = exports.deleteAttendanceEndpoint = new _nodeServerEngine.Endpoint({
  path: '/attendance',
  method: _nodeServerEngine.EndpointMethod.DELETE,
  authType: _nodeServerEngine.EndpointAuthType.JWT,
  // Change as needed
  validator: {},
  middleware: [(0, _middleware.checkPermission)("DeleteAttendance")],
  handler: async (req, res) => {
    try {
      const {
        classId
      } = req.query;
      if (!classId) {
        res.status(400).json({
          error: 'classId is required'
        });
        return;
      }
      const response = await (0, _attendance.deleteAttendanceByClassIdHandler)(req, classId);
      if (!response.success) {
        res.status(400).json({
          error: response.error
        });
        return;
      } else {
        res.status(200).json({
          message: response.message
        });
        return;
      }
    } catch (error) {
      console.error('Error deleting attendance:', error);
      res.status(500).json({
        message: 'Error deleting attendance',
        error
      });
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
//# sourceMappingURL=attendance.js.map