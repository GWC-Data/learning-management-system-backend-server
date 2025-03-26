"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.userProfilePicFolder = exports.moduleFolder = exports.courseFolder = exports.courseCategoryFolder = exports.courseAssignmentFolder = exports.companyInfoFolder = exports.classFolder = exports.bucket = exports.attendanceFileFolder = exports.assignmentCompletionFolder = exports.LinkedInJobImageFolder = void 0;
var _storage = require("@google-cloud/storage");
var _dotenv = _interopRequireDefault(require("dotenv"));
_dotenv.default.config();

// Initialize Google Cloud Storage
const storage = new _storage.Storage({
  projectId: process.env.PROJECT_ID,
  keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS
});
const bucketName = process.env.BUCKET_NAME || 'profile-pictures-wordpress';

// const folderName = 'users';

const bucket = exports.bucket = storage.bucket(bucketName);
const userProfilePicFolder = exports.userProfilePicFolder = process.env.USERPROFILEPIC_BUCKET_FOLDER || 'users';
const courseCategoryFolder = exports.courseCategoryFolder = process.env.COURSECATEGORY_BUCKET_FOLDER || 'courseCategory';
const companyInfoFolder = exports.companyInfoFolder = process.env.COMPANYINFO_BUCKET_FOLDER || 'companyInfo';
const courseFolder = exports.courseFolder = process.env.COURSE_BUCKET_FOLDER || 'course';
const moduleFolder = exports.moduleFolder = process.env.MODULE_BUCKET_FOLDER || 'module';
const courseAssignmentFolder = exports.courseAssignmentFolder = process.env.COURSE_ASSIGNMENT_BUCKET_FOLDER || 'courseAssignmentFile';
const assignmentCompletionFolder = exports.assignmentCompletionFolder = process.env.ASSIGNMENTCOMPLETION_BUCKET_FOLDER || 'assignmentCompletion';
const classFolder = exports.classFolder = process.env.CLASS_BUCKET_FOLDER || 'class';
const attendanceFileFolder = exports.attendanceFileFolder = process.env.ATTENDANCE_FILE_BUCKET_FOLDER || 'attendanceFile';
const LinkedInJobImageFolder = exports.LinkedInJobImageFolder = process.env.LINKEDIN_JOBS_IMAGE_FOLDER || 'linkedInJobImage';

// Export only once
//# sourceMappingURL=storageConfig.js.map