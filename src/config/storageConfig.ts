import { Storage } from '@google-cloud/storage';
import dotenv from 'dotenv';

dotenv.config();

// Initialize Google Cloud Storage
const storage = new Storage({
  projectId: 
    process.env.PROJECT_ID,
  keyFilename: 
    process.env.GOOGLE_APPLICATION_CREDENTIALS
});

const bucketName = 
  process.env.BUCKET_NAME || 'profile-pictures-wordpress';

// const folderName = 'users';

const bucket = storage.bucket(bucketName);

const userProfilePicFolder =
  process.env.USERPROFILEPIC_BUCKET_FOLDER || 'users';
const courseCategoryFolder =
  process.env.COURSECATEGORY_BUCKET_FOLDER || 'courseCategory';
const companyInfoFolder =
  process.env.COMPANYINFO_BUCKET_FOLDER || 'companyInfo';
const courseFolder = 
  process.env.COURSE_BUCKET_FOLDER || 'course';
const moduleFolder = 
  process.env.MODULE_BUCKET_FOLDER || 'module';
const courseAssignmentFolder = 
  process.env.COURSE_ASSIGNMENT_BUCKET_FOLDER || 'courseAssignmentFile';
const assignmentCompletionFolder =
  process.env.ASSIGNMENTCOMPLETION_BUCKET_FOLDER || 'assignmentCompletion';
const classFolder = 
  process.env.CLASS_BUCKET_FOLDER || 'class';
const attendanceFileFolder =
  process.env.ATTENDANCE_FILE_BUCKET_FOLDER || 'attendanceFile';
const LinkedInJobImageFolder = 
  process.env.LINKEDIN_JOBS_IMAGE_FOLDER || 'linkedInJobImage';


// Export only once
export {
  bucket,
  companyInfoFolder,
  courseCategoryFolder,
  courseFolder,
  moduleFolder,
  courseAssignmentFolder,
  assignmentCompletionFolder,
  classFolder,
  attendanceFileFolder,
  userProfilePicFolder,
  LinkedInJobImageFolder
};
