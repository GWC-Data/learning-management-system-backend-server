import { v4 as uuidv4 } from 'uuid';
import { chromium } from 'playwright';
import { bigquery } from '../../config/bigquery';
import { linkedInQueries } from '../../queries/linkedIn/linkedIn.queries';
import { LinkedIn } from 'db/models/LinkedIn';
import { auditQueries } from 'queries/audit/audit.queries';
import { uploadLinkedInImageToGCS } from '../../config/linkedInJobStorage';
import { format, subDays, subWeeks, subMonths, subYears } from 'date-fns';

interface FetchLinkedInJobsResponse {
  status: 'success' | 'error';
  jobs?: LinkedIn[];
  message?: string;
}

const TABLE_LINKEDIN_JOBS = process.env.TABLE_LINKEDIN_JOBS;

// Function to check if the linkedIn table exists
const checkLinkedInTableExists = async (): Promise<boolean> => {
  try {
    const [rows] = await bigquery.query({
      query: `SELECT table_name FROM \`teqcertify.lms.INFORMATION_SCHEMA.TABLES\`
      WHERE table_name = 'jobTables'
      `
    });
    console.log(`Table exists: ${rows.length > 0}`);
    return rows.length > 0;
  } catch (error) {
    console.error('Error checking table existence:', error);
    throw new Error('Database error while checking table existence.');
  }
};

// Function to create the job table if it does not exist
const createLinkedInTableIfNotExists = async (): Promise<void> => {
  if (!(await checkLinkedInTableExists())) {
    try {
      console.log('Creating LinkedIn table...');
      await bigquery.query({
        query: `
          CREATE TABLE \`teqcertify.lms.jobTables\` (
            id STRING NOT NULL, 
            title STRING NOT NULL,
            company STRING NOT NULL,
            link STRING NOT NULL,
            carrierPathLink STRING,
            location STRING NOT NULL,
            datePosted STRING NOT NULL,
            entityURN STRING NOT NULL,
            imgSrc STRING NOT NULL,
            jobDescription STRING,
            jobTrigger STRING,
            createdBy STRING,
            updatedBy STRING,
            createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          )`
      });
      console.log('LinkedIn Job table created successfully.');
    } catch (error) {
      console.error('Error creating LinkedIn job table:', error);
      throw new Error('Failed to create LinkedIn job table.');
    }
  }
};

// Create LinkedIn Job Handler
export const createLinkedInJobHandler = async (
  jobData: Partial<LinkedIn>,
  file?: Express.Multer.File
) => {
  const {
    title,
    company,
    link,
    carrierPathLink, // Added in validation
    location,
    datePosted,
    entityURN, // Must be used correctly
    jobDescription
  } = jobData;

  // Required fields validation
  const missingFields = [];
  if (!title) missingFields.push('title');
  if (!company) missingFields.push('company');
  if (!link) missingFields.push('link');
  if (!location) missingFields.push('location');
  if (!datePosted) missingFields.push('datePosted');
  if (!entityURN) missingFields.push('entityURN'); // Ensure entityURN is provided

  if (missingFields.length > 0) {
    console.error(`Missing required fields: ${missingFields.join(', ')}`);
    return {
      success: false,
      message: `Missing required fields: ${missingFields.join(', ')}`
    };
  }

  try {
    await createLinkedInTableIfNotExists();
    console.log('Checking if job already exists...');

    // Check if job with same entityURN already exists
    const [existingJob] = await bigquery.query({
      query: `
        SELECT id FROM \`${process.env.PROJECT_ID}.${process.env.DATASET_ID}.${process.env.TABLE_LINKEDIN_JOBS}\`
        WHERE entityURN = @entityURN
      `,
      params: { entityURN } // Ensure correct param structure
    });

    if (existingJob && existingJob.length > 0) {
      console.warn(`Job with entityURN "${entityURN}" already exists.`);
      return { success: false, message: 'Job already exists.' };
    }

    console.log('Creating new LinkedIn job...');
    const jobId = uuidv4();
    const createdAt = new Date().toISOString();
    let uploadedImgUrl = '';

    // Upload image to GCS if provided
    if (file) {
      const fileName = `${jobId}.${file.mimetype.split('/')[1]}`;
      console.log('Uploading job image to GCS...');
      uploadedImgUrl = await uploadLinkedInImageToGCS(
        file.buffer,
        fileName,
        file.mimetype
      );
    }

    console.log('Inserting job info into BigQuery...');
    await bigquery.query({
      query: linkedInQueries.createLinkedInJob,
      params: {
        id: jobId,
        title,
        company,
        link,
        carrierPathLink: carrierPathLink || '', // Ensure this is defined
        jobTrigger: 'Manual', // Set to 'Manual' for manual jobs
        location,
        datePosted,
        entityURN, // Use provided entityURN (not uuidv4())
        imgSrc: uploadedImgUrl || '',
        jobDescription,
        createdAt
      }
    });

    console.log(`LinkedIn job created successfully. ID: ${jobId}`);

    return {
      success: true,
      message: 'LinkedIn job created successfully.',
      jobId,
      imgSrc: uploadedImgUrl,
      jobData
    };
  } catch (error) {
    console.error('Error creating LinkedIn job:', error);
    return {
      success: false,
      message:
        error instanceof Error ? error.message : 'Unknown error occurred.'
    };
  }
};

//Entity URN Checking
const getExistingEntityURNs = async (): Promise<Set<string>> => {
  try {
    const query = `
      SELECT LOWER(entityURN) as entityURN
      FROM \`${process.env.PROJECT_ID}.${process.env.DATASET_ID}.${process.env.TABLE_LINKEDIN_JOBS}\`
    `;

    const [rows] = await bigquery.query({ query });
    return new Set(rows.map((row: any) => row.entityURN));
  } catch (error) {
    console.error('Error fetching existing entityURNs:', error);
    return new Set();
  }
};

// Get Linkedin Jobs using Chromium
// export const fetchLinkedInJobs = async (
//   jobRoles: string[],
//   locations: string[] = ['India']
// ): Promise<FetchLinkedInJobsResponse> => {

//   console.log('Deleting all jobs with jobTrigger: Automation');

//   if (!(await checkLinkedInTableExists()))
//     throw new Error(`Table '${TABLE_LINKEDIN_JOBS}' does not exist.`);

//   // Delete all jobs where jobTrigger = 'Automation'
//   const deleteJobBoard = await bigquery.query({
//     query: linkedInQueries.deleteAllAutomationJobs
//   });

//   console.log('Deleted Data', JSON.stringify(deleteJobBoard));

//   console.log('All Automation jobs deleted successfully.');

//   const browser = await chromium.launch({ headless: false }); // Debugging
//   const page = await browser.newPage();
//   let allJobs: LinkedIn[] = [];

//   // Set to track unique entityURNs during scraping
//   const scrapedEntityURNs = new Set<string>();

//   try {
//     for (const role of jobRoles) {
//       for (const location of locations.length > 0 ? locations : ['India']) {
//         let hasMoreJobs = true;
//         let currentPage = 0;

//         while (hasMoreJobs && currentPage < 5) {
//           // Prevent infinite loop
//           const LINKEDIN_URL = `https://www.linkedin.com/jobs/search/?keywords=${encodeURIComponent(
//             role
//           )}&location=${encodeURIComponent(location)}&start=${currentPage * 20}`;

//           try {
//             console.log(`Navigating to: ${LINKEDIN_URL}`);
//             await page.goto(LINKEDIN_URL, {
//               waitUntil: 'networkidle',
//               timeout: 60000
//             });

//             const jobCards = await page.$$('.job-search-card');
//             if (jobCards.length === 0) {
//               console.log(`No jobs found for ${role} in ${location}`);
//               hasMoreJobs = false;
//               break;
//             }

//             const jobs: LinkedIn[] = [];
//             for (const card of jobCards) {
//               const job = await card.evaluate((node) => ({
//                 title:
//                   node
//                     .querySelector('.base-search-card__title')
//                     ?.textContent?.trim() || 'No title',
//                 company:
//                   node
//                     .querySelector('.base-search-card__subtitle')
//                     ?.textContent?.trim() || 'No company',
//                 link:
//                   node
//                     .querySelector('.base-card__full-link')
//                     ?.getAttribute('href') || 'No link',
//                 location:
//                   node
//                     .querySelector('.job-search-card__location')
//                     ?.textContent?.trim() || 'No location',
//                 datePosted:
//                   node
//                     .querySelector('.job-search-card__listdate')
//                     ?.textContent?.trim() || 'No date',
//                 entityURN: node.getAttribute('data-entity-urn')?.trim() || '', // Ensure no empty URNs
//                 imgSrc:
//                   node
//                     .querySelector('.artdeco-entity-image')
//                     ?.getAttribute('src') || 'No image',
//                 jobDescription:
//                   node
//                     .querySelector('.job-search-card__desc')
//                     ?.textContent?.trim() || 'No description'
//               }));

//               // Ensure entityURN is valid and not already scraped
//               if (job.entityURN && !scrapedEntityURNs.has(job.entityURN)) {
//                 scrapedEntityURNs.add(job.entityURN); // Add to Set to avoid duplicates

//                 jobs.push({
//                   id: uuidv4(),
//                   ...job,
//                   createdAt: new Date().toISOString(),
//                   jobTrigger: 'Automation',
//                   carrierPathLink: '',
//                   createdBy: '',
//                   updatedBy: '',
//                   updatedAt: ''
//                 });
//               }
//             }

//             if (jobs.length === 0) {
//               hasMoreJobs = false;
//             } else {
//               allJobs = allJobs.concat(jobs);
//               currentPage++;
//             }
//           } catch (error) {
//             console.error(
//               `Error loading page for "${role}" in "${location}":`,
//               error
//             );
//             hasMoreJobs = false;
//           }
//           await page.waitForTimeout(5000); // Avoid detection
//         }
//       }
//     }

//     await browser.close();

//     if (allJobs.length > 0) {
//       await storeJobsInBigQuery(allJobs);
//       console.log(`Fetched and stored ${allJobs.length} unique jobs.`);
//     } else {
//       console.log('No jobs found.');
//     }

//     return { status: 'success', jobs: allJobs };
//   } catch (error) {
//     console.error('Error scraping LinkedIn:', error);
//     await browser.close();
//     return {
//       status: 'error',
//       message: error instanceof Error ? error.message : 'Unknown error'
//     };
//   }
// };

function convertRelativeDate(relativeDate: string): string {
  const now = new Date();

  const regex = /(\d+)\s*(day|week|month|year)s?\s*ago/i;
  const match = relativeDate.match(regex);

  if (match) {
    const value = parseInt(match[1], 10);
    const unit = match[2];

    let exactDate;
    if (unit === 'day') {
      exactDate = subDays(now, value);
    } else if (unit === 'week') {
      exactDate = subWeeks(now, value);
    } else if (unit === 'month') {
      exactDate = subMonths(now, value);
    } else if (unit === 'year') {
      exactDate = subYears(now, value);
    } else {
      return format(now, 'yyyy-MM-dd'); // Default to today if unknown
    }

    return format(exactDate, 'yyyy-MM-dd'); // Convert to "YYYY-MM-DD"
  }

  return format(now, 'yyyy-MM-dd'); // Default to today if format is unknown
}

export const fetchLinkedInJobs =
  async (): Promise<FetchLinkedInJobsResponse> => {
    console.log('Deleting all jobs with jobTrigger: Automation');

    if (!(await checkLinkedInTableExists()))
      throw new Error(`Table '${TABLE_LINKEDIN_JOBS}' does not exist.`);

    // Delete all jobs where jobTrigger = 'Automation'
    const deleteJobBoard = await bigquery.query({
      query: linkedInQueries.deleteOldAutomationJobs
    });

    console.log('Deleted Data', JSON.stringify(deleteJobBoard));
    console.log('After 1 months old Automation jobs deleted successfully.');

    const browser = await chromium.launch({ headless: false }); // Debugging
    const page = await browser.newPage();
    let allJobs: LinkedIn[] = [];

    // ✅ Define job roles inside the function
    // const jobRoles = [
    //   'Data Analyst',
    //   'Data Scientist',
    //   'Data Engineering',
    //   'Full-Stack',
    //   'Software Engineering'
    // ];
    const jobRoles = [
      'Data Scientist',
      'Junior Data Scientist',
      'Senior Data Scientist',
      'Lead Data Scientist',
      'Principal Data Scientist',
      'Data Science Consultant',
      'Data Science Manager',
      'Applied Data Scientist',
      'AI Scientist',
      'Machine Learning Engineer',
      'Senior Machine Learning Engineer',
      'Lead Machine Learning Engineer',
      'Principal Machine Learning Engineer',
      'Machine Learning Researcher',
      'AI Engineer',
      'AI Specialist',
      'AI Research Scientist',
      'NLP Engineer',
      'Computer Vision Engineer',
      'Deep Learning Engineer',
      'AI Product Manager',
      'AI Solutions Architect',
      'AI Consultant',
      'Associate Data Scientist',
      'Research Data Scientist',
      'Data Science Engineer',
      'Computational Data Scientist',
      'Statistical Data Scientist',
      'Machine Learning Developer',
      'AI/ML Engineer',
      'Applied Machine Learning Engineer',
      'AI Algorithm Engineer',
      'Data Engineer',
      'Senior Data Engineer',
      'Lead Data Engineer',
      'Principal Data Engineer',
      'Big Data Engineer',
      'Cloud Data Engineer',
      'ETL Developer',
      'Data Architect',
      'Database Engineer',
      'Data Infrastructure Engineer',
      'DataOps Engineer',
      'Data Pipeline Engineer',
      'Hadoop Engineer',
      'Snowflake Engineer',
      'Data Platform Engineer',
      'Data Engineering Consultant',
      'Data Pipeline Developer',
      'ETL Engineer',
      'Big Data Consultant',
      'Spark Engineer',
      'Cloud Data Solutions Engineer',
      'Data Analyst',
      'Junior Data Analyst',
      'Senior Data Analyst',
      'Data Science Analyst',
      'Business Data Analyst',
      'Quantitative Data Analyst',
      'Decision Science Analyst',
      'Data Insights Analyst',
      'Reporting Analyst',
      'BI Data Analyst',
      'BI Reporting Analyst',
      'Data Visualization Analyst',
      'Marketing Data Analyst',
      'Financial Data Analyst',
      'Product Data Analyst',
      'Risk Data Analyst',
      'Healthcare Data Analyst',
      'Customer Insights Analyst',
      'Operations Data Analyst',
      'HR Data Analyst',
      'Workforce Analyst',
      'Pricing Analyst',
      'Fraud Analyst',
      'Predictive Analytics Specialist',
      'Operations Research Analyst',
      'Data Strategy Analyst',
      'Insights & Analytics Manager',
      'Business Intelligence Consultant',
      'ETL Analyst',
      'Big Data Analyst',
      'Power BI Developer',
      'Tableau Developer',
      'Generative AI Engineer',
      'AI Prompt Engineer',
      'AI Solutions Engineer',
      'AI Developer',
      'AI Research Engineer',
      'AI Data Engineer',
      'AI Product Manager',
      'AI Content Creator',
      'AI Chatbot Developer',
      'AI Ethics Specialist',
      'AI Prompt Specialist',
      'AI Application Engineer',
      'Conversational AI Engineer',
      'AI Data Scientist',
      'AI/ML Consultant',
      'AI System Engineer',
      'LLM Engineer',
      'AI Automation Engineer',
      'AI Innovation Engineer',
      'ML Engineer (Generative AI)',
      'Foundation Model Engineer',
      'Data Labeling Specialist',
      'Domo Developer',
      'Domo Analyst',
      'Domo Consultant',
      'Domo Engineer',
      'BI Developer (Domo)',
      'Data Visualization Specialist (Domo)',
      'Data Visualization Engineer',
      'Dashboard Developer',
      'BI & Reporting Specialist',
      'Data Dashboard Designer'
    ];

    // ✅ Define locations inside the function
    const locations = ['India'];

    // Set to track unique entityURNs during scraping
    const scrapedEntityURNs = new Set<string>();

    try {
      for (const role of jobRoles) {
        for (const location of locations) {
          let hasMoreJobs = true;
          let currentPage = 0;

          while (hasMoreJobs && currentPage < 5) {
            // while (hasMoreJobs) {
            // Prevent infinite loop
            const LINKEDIN_URL = `https://www.linkedin.com/jobs/search/?keywords=${encodeURIComponent(
              role
            )}&location=${encodeURIComponent(location)}&start=${currentPage * 20}`;

            try {
              console.log(`Navigating to: ${LINKEDIN_URL}`);
              await page.goto(LINKEDIN_URL, {
                waitUntil: 'networkidle',
                timeout: 60000
              });

              const jobCards = await page.$$('.job-search-card');
              if (jobCards.length === 0) {
                console.log(`No jobs found for ${role} in ${location}`);
                hasMoreJobs = false;
                break;
              }

              const jobs: LinkedIn[] = [];
              for (const card of jobCards) {
                const job = await card.evaluate((node) => ({
                  title:
                    node
                      .querySelector('.base-search-card__title')
                      ?.textContent?.trim() || 'No title',
                  company:
                    node
                      .querySelector('.base-search-card__subtitle')
                      ?.textContent?.trim() || 'No company',
                  link:
                    node
                      .querySelector('.base-card__full-link')
                      ?.getAttribute('href') || 'No link',
                  location:
                    node
                      .querySelector('.job-search-card__location')
                      ?.textContent?.trim() || 'No location',
                  datePosted:
                    node
                      .querySelector('.job-search-card__listdate')
                      ?.textContent?.trim() || 'No date',
                  entityURN: node.getAttribute('data-entity-urn')?.trim() || '', // Ensure no empty URNs
                  imgSrc:
                    node
                      .querySelector('.artdeco-entity-image')
                      ?.getAttribute('src') || 'No image',
                  jobDescription:
                    node
                      .querySelector('.job-search-card__desc')
                      ?.textContent?.trim() || 'No description'
                }));

                // Ensure entityURN is valid and not already scraped
                if (job.entityURN && !scrapedEntityURNs.has(job.entityURN)) {
                  scrapedEntityURNs.add(job.entityURN); // Add to Set to avoid duplicates

                  jobs.push({
                    id: uuidv4(),
                    ...job,
                    createdAt: new Date().toISOString(),
                    jobTrigger: 'Automation',
                    carrierPathLink: ''
                  });
                }
              }

              if (jobs.length === 0) {
                hasMoreJobs = false;
              } else {
                allJobs = allJobs.concat(jobs);
                currentPage++;
              }
            } catch (error) {
              console.error(
                `Error loading page for "${role}" in "${location}":`,
                error
              );
              hasMoreJobs = false;
            }
            await page.waitForTimeout(5000); // Avoid detection
          }
        }
      }

      await browser.close();

      if (allJobs.length > 0) {
        await storeJobsInBigQuery(allJobs);
        console.log(`Fetched and stored ${allJobs.length} unique jobs.`);
      } else {
        console.log('No jobs found.');
      }

      return { status: 'success', jobs: allJobs };
    } catch (error) {
      console.error('Error scraping LinkedIn:', error);
      await browser.close();
      return {
        status: 'error',
        message: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  };

// Used to store the LinkedIn data in bigquery
const storeJobsInBigQuery = async (jobs: any[]) => {
  await createLinkedInTableIfNotExists();

  try {
    const existingEntityURNs = await getExistingEntityURNs();
    console.log('Existing entityURNs:', existingEntityURNs);

    // Ensure unique jobs filtering works correctly
    const uniqueJobs = jobs.filter((job) => {
      const isDuplicate = existingEntityURNs.has(job.entityURN);
      if (isDuplicate) {
        console.log(`Duplicate job skipped: ${job.entityURN}`);
      }
      return !isDuplicate;
    });

    console.log('Final unique jobs to store:', uniqueJobs);

    if (uniqueJobs.length === 0) {
      console.log('No new unique jobs to store.');
      return;
    }

    const createdAt = new Date().toISOString();

    for (const job of uniqueJobs) {
      await bigquery.query({
        query: linkedInQueries.insertLinkedInJob,
        params: {
          id: uuidv4(),
          title: job.title,
          company: job.company,
          link: job.link,
          carrierPathLink: job.carrierPathLink || '',
          location: job.location,
          datePosted: convertRelativeDate(job.datePosted),
          entityURN: job.entityURN,
          imgSrc: job.imgSrc,
          jobDescription: job.jobDescription,
          jobTrigger: job.jobTrigger || 'Automation',
          createdAt: job.createdAt || createdAt
        }
      });
    }

    console.log(`Stored ${uniqueJobs.length} unique jobs in BigQuery.`);
  } catch (error) {
    console.error('Error inserting jobs into BigQuery:', error);
  }
};

// **Get All Linkedin Datas **
export const getAllLinkedInHandler = async () => {
  await checkLinkedInTableExists();
  try {
    console.log('Fetching all LinkedIn Datas...');
    const [rows] = await bigquery.query({
      query: linkedInQueries.getAllLinkedInJobs
    });
    console.log(`Total LinkedIn found: ${rows.length}`);
    return rows;
  } catch (error) {
    console.error('Error fetching all LinkedIn Datas:', error);
    throw error;
  }
};

// Get all Jobs for admin and trainee - not trigger
// export const getAllJobsHandler = async () => {
//   try {
//     const [rows] = await bigquery.query({
//       query: linkedInQueries.getAllLinkedInJobs
//     });

//     return { jobs: rows };
//   } catch (error: any) {
//     console.error('Error fetching job roles:', error.message, error);
//     throw new Error(`Fetching job roles failed: ${error.message}`);
//   }
// };

//Update LinkedIn imgsrc
export const updateLinkedInJobHandler = async (
  company: string,
  file?: Express.Multer.File
) => {
  try {
    console.log(`Updating imgSrc for Company: ${company}`);

    // Check if the table exists
    if (!(await checkLinkedInTableExists())) {
      return {
        success: false,
        message: `Table ${TABLE_LINKEDIN_JOBS} does not exist.`
      };
    }

    // Fetch existing job data for the company
    const [linkedInResults] = await bigquery.query({
      query: `SELECT * FROM \`teqcertify.lms.${TABLE_LINKEDIN_JOBS}\` WHERE company = @company`,
      params: { company }
    });

    if (!Array.isArray(linkedInResults) || linkedInResults.length === 0) {
      console.error(`No jobs found for company ${company}.`);
      return {
        success: false,
        message: `No jobs found for company ${company}.`
      };
    }

    let uploadedImgUrl = linkedInResults[0].imgSrc;

    // Upload new image to GCS if provided
    if (file) {
      const fileName = `${company.replace(/\s+/g, '_')}.${file.mimetype.split('/')[1]}`;
      console.log('Uploading new job image to GCS...');
      uploadedImgUrl = await uploadLinkedInImageToGCS(
        file.buffer,
        fileName,
        file.mimetype
      );
    } else {
      return { success: false, message: 'No image file provided.' };
    }

    // Update the imgSrc field for all jobs under the company
    await bigquery.query({
      query: `UPDATE \`teqcertify.lms.${TABLE_LINKEDIN_JOBS}\` SET imgSrc = @imgSrc WHERE company = @company`,
      params: { imgSrc: uploadedImgUrl, company }
    });

    console.log(`Updated imgSrc for all jobs at company ${company}.`);

    return {
      success: true,
      message: `Updated imgSrc for all jobs at company ${company}.`,
      imgSrc: uploadedImgUrl
    };
  } catch (error) {
    console.error(`Error updating imgSrc for company ${company}:`, error);
    return {
      success: false,
      message: 'Internal server error occurred.',
      error
    };
  }
};

//Update CarrierPath Link
export const updateCarrierPathLinkJobHandler = async (
  req: any,
  id: string,
  updatedData: Partial<LinkedIn>
) => {
  try {
    console.log(`Updating carrierPathLink for Job ID: ${id}`);
    const { user } = req;
    // Check if the table exists
    if (!(await checkLinkedInTableExists())) {
      return {
        success: false,
        message: `Table ${TABLE_LINKEDIN_JOBS} does not exist.`
      };
    }

    // Fetch existing job data by ID
    const [linkedInResults] = await bigquery.query({
      query: `SELECT * FROM \`teqcertify.lms.${TABLE_LINKEDIN_JOBS}\` WHERE id = @id`,
      params: { id }
    });

    if (!Array.isArray(linkedInResults) || linkedInResults.length === 0) {
      console.error(`No job found for ID ${id}.`);
      return { success: false, message: `No job found for ID ${id}.` };
    }

    // Validate if `carrierPathLink` exists in the updated data
    if (!updatedData.carrierPathLink) {
      return {
        success: false,
        message: 'carrierPathLink is required for update.'
      };
    }

    // Update only carrierPathLink
    await bigquery.query({
      query: `UPDATE \`teqcertify.lms.${TABLE_LINKEDIN_JOBS}\` SET carrierPathLink = @carrierPathLink, updatedBy = @updatedBy WHERE id = @id`,
      params: {
        id,
        carrierPathLink: updatedData.carrierPathLink,
        updatedBy: user?.id || null
      }
    });

    console.log(`Updated carrierPathLink for Job ID ${id}.`);

    return {
      success: true,
      message: `Updated carrierPathLink for Job ID ${id}.`,
      carrierPathLink: updatedData.carrierPathLink
    };
  } catch (error) {
    console.error(`Error updating carrierPathLink for Job ID ${id}:`, error);
    return {
      success: false,
      message: 'Internal server error occurred.',
      error
    };
  }
};

// **Delete JobBoard Handler**
export const deleteLinkedInJobHandler = async (id: string, req: any) => {
  const { user } = req;
  try {
    console.log(`Deleting JobBoard with ID: ${id}`);

    if (!(await checkLinkedInTableExists()))
      throw new Error(`Table '${TABLE_LINKEDIN_JOBS}' does not exist.`);

    const [rows] = await bigquery.query({
      query: linkedInQueries.getAllLinkedInJobs,
      params: { id }
    });

    if (!rows.length) {
      console.log('JobBoard not found.');
      return { success: false, message: 'JobBoard not found.' };
    }

    const deleteJobBoard = await bigquery.query({
      query: linkedInQueries.deleteJobBoard,
      params: { jobId: id } // ✅ Fix: Match the parameter name
    });

    // Insert Audit Log
    const auditLogParams = {
      entityType: 'LinkedInJob',
      entityId: id,
      action: 'DELETE',
      previousData: JSON.stringify(deleteJobBoard),
      performedBy: user?.id
    };

    await bigquery.query({
      query: auditQueries.insertAuditLog,
      params: auditLogParams
    });

    console.log(`JobBoard with ID ${id} deleted successfully.`);

    return {
      success: true,
      message: `JobBoard with ID ${id} deleted successfully.`
    };
  } catch (error) {
    console.error(`Error deleting jobBoard with ID ${id}:`, error);
    return { success: false, errors: ['Internal server error occurred.'] };
  }
};

export const deleteLinkedInAutomationJobHandler = async (req: any) => {
  const { user } = req;
  try {
    console.log('Deleting all jobs with jobTrigger: Automation');

    if (!(await checkLinkedInTableExists()))
      throw new Error(`Table '${TABLE_LINKEDIN_JOBS}' does not exist.`);

    // Delete all jobs where jobTrigger = 'Automation'
    const deleteJobBoard = await bigquery.query({
      query: linkedInQueries.deleteAllAutomationJobs
    });

    // Insert Audit Log for this bulk deletion
    await bigquery.query({
      query: auditQueries.insertAuditLog,
      params: {
        entityType: 'LinkedInJob',
        entityId: 'ALL_AUTOMATION',
        action: 'DELETE',
        previousData: JSON.stringify(deleteJobBoard),
        performedBy: user?.id
      }
    });

    console.log('All Automation jobs deleted successfully.');

    return {
      success: true,
      message: 'All Automation jobs deleted successfully.'
    };
  } catch (error) {
    console.error('Error deleting Automation jobs:', error);
    return { success: false, errors: ['Internal server error occurred.'] };
  }
};
