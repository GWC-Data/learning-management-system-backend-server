"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.updateLinkedInJobByCompanyEndpoint = exports.updateCarrierPathLinkByIdEndpoint = exports.getAllLinkedInJobsEndpoint = exports.getAllJobsEndpoint = exports.deleteLinkedInEndpoint = exports.deleteLinkedInAutomationEndpoint = exports.createLinkedInJobEndpoint = void 0;
var _nodeServerEngine = require("node-server-engine");
var _linkedIn = require("./linkedIn.handler");
var _linkedIn2 = require("./linkedIn.const");
var _linkedIn3 = require("./linkedIn.validator");
var _multer = _interopRequireDefault(require("multer"));
const upload = (0, _multer.default)({
  storage: _multer.default.memoryStorage()
});

// Create LinkedInJob
const createLinkedInJobEndpoint = exports.createLinkedInJobEndpoint = new _nodeServerEngine.Endpoint({
  path: '/jobs',
  method: _nodeServerEngine.EndpointMethod.POST,
  handler: async (req, res) => {
    try {
      console.log('Incoming job request:', {
        headers: req.headers,
        body: req.body,
        file: req.file
      });

      // Call handler with request body and file
      const company = await (0, _linkedIn.createLinkedInJobHandler)(req.body, req.file);
      if (!company || !company.success) {
        res.status(400).json({
          success: false,
          message: 'Failed to create LinkedIn Job',
          errors: company?.errors || ['Unknown error occurred.']
        });
        return;
      }
      res.status(200).json({
        message: 'LinkedIn job created successfully',
        jobId: company.jobId,
        imgSrc: company.imgSrc
      });
    } catch (error) {
      console.error('Error creating LinkedIn job:', error);
      res.status(500).json({
        message: 'Error creating LinkedIn job',
        error
      });
    }
  },
  authType: _nodeServerEngine.EndpointAuthType.NONE,
  validator: _linkedIn3.createLinkedInJobValidator,
  // You'll need to create this validator
  middleware: [upload.single('imgSrc')]
});

// Get All Jobs from LinkedIn chromium
// export const getAllJobsEndpoint = new Endpoint({
//   path: '/jobs',
//   method: EndpointMethod.GET,
//   validator: {},
//   handler: async (req, res): Promise<void> => {
//     try {
//       // ✅ Extract & validate job roles
//       // const jobRoles = req.query.roles
//       //   ? (req.query.roles as string).split(',')
//       //   : ['Software Engineer', 'Data Scientist', 'Frontend Developer'];

//       // ✅ Directly use predefined job roles
//       const jobRoles = [
//         'Data Analyst',
//         'Data Scientist',
//         'Data Engineering',
//         'Full-Stack',
//         'Software Engineering'
//       ];

//       // ✅ Call scraper function
//       const result = await fetchLinkedInJobs(jobRoles);

//       if (result.status === 'error') {
//         res.status(500).json({ message: result.message });
//         return;
//       }

//       if (!result.jobs || result.jobs.length === 0) {
//         res.status(404).json({ message: 'No recent jobs found' });
//         return;
//       }

//       // ✅ Return jobs response
//       res.status(200).json({
//         message: 'Jobs retrieved successfully',
//         jobs: result.jobs
//       });
//     } catch (error) {
//       console.error('Error in getAllJobsEndpoint:', error);
//       res.status(500).json({
//         message: 'Error getting jobs',
//         error: error instanceof Error ? error.message : 'Unknown error'
//       });
//     }
//   },
//   authType: EndpointAuthType.NONE
// });

const getAllJobsEndpoint = exports.getAllJobsEndpoint = new _nodeServerEngine.Endpoint({
  path: '/jobs',
  method: _nodeServerEngine.EndpointMethod.GET,
  validator: {},
  handler: async (req, res) => {
    try {
      // ✅ Extract & validate job roles
      // const jobRoles = req.query.roles
      //   ? (req.query.roles as string).split(',')
      //   : ['Software Engineer', 'Data Scientist', 'Frontend Developer'];

      // ✅ Call scraper function
      const result = await (0, _linkedIn.fetchLinkedInJobs)();
      if (result.status === 'error') {
        res.status(500).json({
          message: result.message
        });
        return;
      }
      if (!result.jobs || result.jobs.length === 0) {
        res.status(404).json({
          message: 'No recent jobs found'
        });
        return;
      }

      // ✅ Return jobs response
      res.status(200).json({
        message: 'Jobs retrieved successfully',
        jobs: result.jobs
      });
    } catch (error) {
      console.error('Error in getAllJobsEndpoint:', error);
      res.status(500).json({
        message: 'Error getting jobs',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  },
  authType: _nodeServerEngine.EndpointAuthType.NONE
});

// Get All LinkedInDatas Endpoint
const getAllLinkedInJobsEndpoint = exports.getAllLinkedInJobsEndpoint = new _nodeServerEngine.Endpoint({
  path: '/jobs-all',
  method: _nodeServerEngine.EndpointMethod.GET,
  handler: async (req, res) => {
    try {
      const linkedIn = await (0, _linkedIn.getAllLinkedInHandler)();
      if (!linkedIn) {
        res.status(404).json({
          message: _linkedIn2.LINKEDIN_NOT_FOUND
        });
        return;
      }
      res.status(200).json({
        message: 'LinkedIn Jobs retrieved successfully',
        linkedIn
      });
    } catch (error) {
      res.status(500).json({
        message: _linkedIn2.LINKEDIN_FETCH_ERROR,
        error
      });
    }
  },
  authType: _nodeServerEngine.EndpointAuthType.NONE,
  validator: {}
  // middleware: [checkPermission("GetJob")]
});

// Update JobBoard Endpoint imgsrc
const updateLinkedInJobByCompanyEndpoint = exports.updateLinkedInJobByCompanyEndpoint = new _nodeServerEngine.Endpoint({
  path: '/jobs-img/:company',
  method: _nodeServerEngine.EndpointMethod.PUT,
  handler: async (req, res) => {
    try {
      const {
        company
      } = req.params; // Extract company from path params

      if (!company) {
        res.status(400).json({
          success: false,
          message: 'Company is required in path params.'
        });
        return;
      }
      const updateResponse = await (0, _linkedIn.updateLinkedInJobHandler)(company, req.file);
      if (!updateResponse.success) {
        res.status(400).json(updateResponse);
        return;
      }
      res.status(200).json({
        message: 'Job imgSrc updated successfully for company',
        imgSrc: updateResponse.imgSrc
      });
    } catch (error) {
      res.status(500).json({
        message: 'Error updating LinkedIn job image',
        error
      });
    }
  },
  authType: _nodeServerEngine.EndpointAuthType.NONE,
  validator: {},
  middleware: [upload.single('imgSrc')] // Handle file upload
});

//Update Carrier Path Link
const updateCarrierPathLinkByIdEndpoint = exports.updateCarrierPathLinkByIdEndpoint = new _nodeServerEngine.Endpoint({
  path: '/jobs-carrierpath/:id',
  method: _nodeServerEngine.EndpointMethod.PUT,
  handler: async (req, res) => {
    try {
      const updateCarrierPathLink = await (0, _linkedIn.updateCarrierPathLinkJobHandler)(req.params.id, req.body);
      res.status(200).json({
        message: 'carrierPathLink updated successfully',
        updateCarrierPathLink
      });
    } catch (error) {
      res.status(500).json({
        message: 'Error updating carrierPathLink',
        error
      });
    }
  },
  authType: _nodeServerEngine.EndpointAuthType.NONE,
  validator: {} // Ensure you create this validator
  // middleware: [checkPermission("UpdateCarrierPathLink")] // Permission check for security
});

// Delete course Endpoint
const deleteLinkedInEndpoint = exports.deleteLinkedInEndpoint = new _nodeServerEngine.Endpoint({
  path: '/jobs/:id',
  method: _nodeServerEngine.EndpointMethod.DELETE,
  handler: async (req, res) => {
    try {
      await (0, _linkedIn.deleteLinkedInJobHandler)(req.params.id, req);
      res.json({
        message: 'LinkedIn deleted successfully'
      });
    } catch (error) {
      res.status(500).json({
        message: _linkedIn2.LINKEDIN_DELETE_ERROR,
        error
      });
    }
  },
  authType: _nodeServerEngine.EndpointAuthType.NONE,
  validator: _linkedIn3.deleteLinkedInJobValidator
  // middleware: [checkPermission("DeleteJob")]
});

// Delete LinkedIn Endpoint
const deleteLinkedInAutomationEndpoint = exports.deleteLinkedInAutomationEndpoint = new _nodeServerEngine.Endpoint({
  path: '/jobs-automation',
  method: _nodeServerEngine.EndpointMethod.DELETE,
  handler: async (req, res) => {
    try {
      await (0, _linkedIn.deleteLinkedInAutomationJobHandler)(req); // No need to pass ID, as it deletes all 'Automation' jobs
      res.json({
        message: 'All LinkedIn Automation jobs deleted successfully'
      });
    } catch (error) {
      console.error('Error in deleteLinkedInAutomationEndpoint:', error);
      res.status(500).json({
        message: _linkedIn2.LINKEDIN_DELETE_ERROR,
        error
      });
    }
  },
  authType: _nodeServerEngine.EndpointAuthType.NONE,
  validator: {}
  // middleware: [checkPermission("DeleteJob")]
});
//# sourceMappingURL=linkedIn.js.map