import { Endpoint, EndpointAuthType, EndpointMethod } from 'node-server-engine';
import {
  createLinkedInJobHandler,
  deleteLinkedInAutomationJobHandler,
  deleteLinkedInJobHandler,
  fetchLinkedInJobs,
  getAllLinkedInHandler,
  updateCarrierPathLinkJobHandler,
  updateLinkedInJobHandler
} from './linkedIn.handler';
import {
  LINKEDIN_NOT_FOUND,
  LINKEDIN_FETCH_ERROR,
  LINKEDIN_UPDATE_ERROR,
  LINKEDIN_DELETE_ERROR
} from './linkedIn.const';

import {
  updateLinkedInJobValidator,
  deleteLinkedInJobValidator,
  createLinkedInJobValidator
} from './linkedIn.validator';

import multer from 'multer';
import { Request, Response } from 'express';
import { checkPermission } from 'middleware';

const upload = multer({ storage: multer.memoryStorage() });

// Create LinkedInJob
export const createLinkedInJobEndpoint = new Endpoint({
  path: '/jobs',
  method: EndpointMethod.POST,
  handler: async (req: Request, res: Response): Promise<void> => {
    try {
      console.log('Incoming job request:', {
        headers: req.headers,
        body: req.body,
        file: req.file
      });

      // Call handler with request body and file
      const company = await createLinkedInJobHandler(req.body, req.file);

      if (!company || !company.success) {
        res.status(400).json({
          success: false,
          message: 'Failed to create LinkedIn Job',
          errors: (company as { errors?: string[] })?.errors || [
            'Unknown error occurred.'
          ]
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
      res.status(500).json({ message: 'Error creating LinkedIn job', error });
    }
  },
  authType: EndpointAuthType.NONE,
  validator: createLinkedInJobValidator, // You'll need to create this validator
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

export const getAllJobsEndpoint = new Endpoint({
  path: '/jobs',
  method: EndpointMethod.GET,
  validator: {},
  handler: async (req, res): Promise<void> => {
    try {
      // ✅ Extract & validate job roles
      // const jobRoles = req.query.roles
      //   ? (req.query.roles as string).split(',')
      //   : ['Software Engineer', 'Data Scientist', 'Frontend Developer'];

      // ✅ Call scraper function
      const result = await fetchLinkedInJobs();

      if (result.status === 'error') {
        res.status(500).json({ message: result.message });
        return;
      }

      if (!result.jobs || result.jobs.length === 0) {
        res.status(404).json({ message: 'No recent jobs found' });
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
  authType: EndpointAuthType.NONE
});

// Get All LinkedInDatas Endpoint
export const getAllLinkedInJobsEndpoint = new Endpoint({
  path: '/jobs-all',
  method: EndpointMethod.GET,
  handler: async (req, res): Promise<void> => {
    try {
      const linkedIn = await getAllLinkedInHandler();

      if (!linkedIn) {
        res.status(404).json({ message: LINKEDIN_NOT_FOUND });
        return;
      }

      res.status(200).json({
        message: 'LinkedIn Jobs retrieved successfully',
        linkedIn
      });
    } catch (error) {
      res.status(500).json({ message: LINKEDIN_FETCH_ERROR, error });
    }
  },
  authType: EndpointAuthType.NONE,
  validator: {}
  // middleware: [checkPermission("GetJob")]
});

// Update JobBoard Endpoint imgsrc
export const updateLinkedInJobByCompanyEndpoint = new Endpoint({
  path: '/jobs-img/:company',
  method: EndpointMethod.PUT,

  handler: async (req, res): Promise<void> => {
    try {
      const { company } = req.params; // Extract company from path params

      if (!company) {
        res.status(400).json({
          success: false,
          message: 'Company is required in path params.'
        });
        return;
      }

      const updateResponse = await updateLinkedInJobHandler(company, req.file);

      if (!updateResponse.success) {
        res.status(400).json(updateResponse);
        return;
      }

      res.status(200).json({
        message: 'Job imgSrc updated successfully for company',
        imgSrc: updateResponse.imgSrc
      });
    } catch (error) {
      res
        .status(500)
        .json({ message: 'Error updating LinkedIn job image', error });
    }
  },
  authType: EndpointAuthType.NONE,
  validator: {},
  middleware: [upload.single('imgSrc')] // Handle file upload
});

//Update Carrier Path Link
export const updateCarrierPathLinkByIdEndpoint = new Endpoint({
  path: '/jobs-carrierpath/:id',
  method: EndpointMethod.PUT,

  handler: async (req, res): Promise<void> => {
    try {
      const updateCarrierPathLink = await updateCarrierPathLinkJobHandler(
        req,
        req.params.id,
        req.body
      );

      res.status(200).json({
        message: 'carrierPathLink updated successfully',
        updateCarrierPathLink
      });
    } catch (error) {
      res
        .status(500)
        .json({ message: 'Error updating carrierPathLink', error });
    }
  },
  authType: EndpointAuthType.NONE,
  validator: {} // Ensure you create this validator
  // middleware: [checkPermission("UpdateCarrierPathLink")] // Permission check for security
});

// Delete course Endpoint
export const deleteLinkedInEndpoint = new Endpoint({
  path: '/jobs/:id',
  method: EndpointMethod.DELETE,
  handler: async (req, res): Promise<void> => {
    try {
      await deleteLinkedInJobHandler(req.params.id, req);
      res.json({ message: 'LinkedIn deleted successfully' });
    } catch (error) {
      res.status(500).json({ message: LINKEDIN_DELETE_ERROR, error });
    }
  },
  authType: EndpointAuthType.NONE,
  validator: deleteLinkedInJobValidator
  // middleware: [checkPermission("DeleteJob")]
});

// Delete LinkedIn Endpoint
export const deleteLinkedInAutomationEndpoint = new Endpoint({
  path: '/jobs-automation',
  method: EndpointMethod.DELETE,
  handler: async (req, res): Promise<void> => {
    try {
      await deleteLinkedInAutomationJobHandler(req); // No need to pass ID, as it deletes all 'Automation' jobs
      res.json({
        message: 'All LinkedIn Automation jobs deleted successfully'
      });
    } catch (error) {
      console.error('Error in deleteLinkedInAutomationEndpoint:', error);
      res.status(500).json({ message: LINKEDIN_DELETE_ERROR, error });
    }
  },
  authType: EndpointAuthType.NONE,
  validator: {}
  // middleware: [checkPermission("DeleteJob")]
});
