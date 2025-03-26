"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.updateCourseHandler = exports.getCourseByIdHandler = exports.getAllCoursesHandler = exports.deleteCourseHandler = exports.createCourseHandler = void 0;
var _uuid = require("uuid");
var _bigquery = require("../../config/bigquery");
var _courses = require("../../queries/courses/courses.queries");
var _courseStorage = require("../../config/courseStorage");
var _audit = require("../../queries/audit/audit.queries");
const TABLE_COURSE_CATEGORY = process.env.TABLE_COURSE_CATEGORY || 'courseCategory';
const TABLE_COURSE = process.env.TABLE_COURSE || 'course';

// Function to check if the course category table exists
const checkCourseTableExists = async () => {
  try {
    console.log('Checking if course table exists...');
    const [rows] = await _bigquery.bigquery.query({
      query: `SELECT table_name FROM \`teqcertify.lms.INFORMATION_SCHEMA.TABLES\` WHERE table_name = '${TABLE_COURSE}'`
    });
    console.log(`Table exists: ${rows.length > 0}`);
    return rows.length > 0;
  } catch (error) {
    console.error('Error checking table existence:', error);
    throw new Error('Database error while checking table existence.');
  }
};

// Function to create the course category table if it does not exist
const createCourseTableIfNotExists = async () => {
  const exists = await checkCourseTableExists();
  if (!exists) {
    try {
      console.log('Creating course table...');
      await _bigquery.bigquery.query({
        query: `
        CREATE TABLE \`${process.env.PROJECT_ID}.${process.env.DATASET_ID}.${process.env.TABLE_COURSE}\` (
          id STRING NOT NULL, 
          courseName STRING NOT NULL,
          courseDesc STRING,
          courseCategoryId STRING,
          courseImg STRING,
          courseLink STRING,
          createdBy STRING NOT NULL,
          updatedBy STRING,
          createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `
      });
      console.log('Course table created successfully.');
    } catch (error) {
      console.error('Error creating course table:', error);
      throw new Error('Failed to create course table.');
    }
  }
};

// **Create course**
// export const createCourseHandler = async (
//   courseData: Courses,
//   req: any,
//   file?: Express.Multer.File
// ) => {

//   const { user } = req;
//   const id = uuidv4();
//   const { courseName, courseDesc, courseCategoryId, courseLink } =
//     courseData;

//   try {
//     await createCourseTableIfNotExists();
//     console.log('Checking if course name already exists...');

//     // **Check if course category already exists**
//     const [existingCourse] = await bigquery.query({
//       query: `SELECT id FROM \`teqcertify.lms.${process.env.TABLE_COURSE}\` WHERE courseName = @courseName`,
//       params: { courseName }
//     });

//     if (existingCourse.length > 0) {
//       console.warn(`Course category "${courseName}" already exists.`);
//       return { success: false, message: 'Course Name already exists.' };
//     }

//     console.log('Creating new course...');
//     const courseId = uuidv4();
//     const createdAt = new Date().toISOString();
//     const updatedAt = createdAt;
//     let uploadedImgUrl = '';

//     // **Upload image to GCS if provided**
//     if (file) {
//       try {
//         const fileName = `${courseId}.${file.mimetype.split('/')[1]}`;
//         console.log('Uploading course image to GCS...');
//         uploadedImgUrl = await uploadCourseImageToGCS(
//           file.buffer,
//           fileName,
//           file.mimetype
//         );
//       } catch (uploadError) {
//         console.error('Error uploading image to GCS:', uploadError);
//         return { success: false, message: 'Failed to upload image.' };
//       }
//     }

//     console.log('Inserting course info into BigQuery...');

//     await bigquery.query({
//       query: courseQueries.createCourse,
//       params: {
//         id: courseId,
//         courseName,
//         courseDesc,
//         courseCategoryId,
//         courseImg: uploadedImgUrl,
//         courseLink,
//         createdBy: user?.id,
//         createdAt
//       }
//     });

//     console.log(`Course created successfully. ID: ${courseId}`);

//      //audit log
//      await bigquery.query({
//       query: auditQueries.insertAuditLog,
//       params: {
//         id: uuidv4(),
//         entityType: "Course",
//         entityId: courseId,
//         action: "CREATE",
//         previousData: null, 
//         newData: JSON.stringify({ id, courseName, courseDesc, courseCategoryId, courseLink }),
//         performedBy: user?.id,
//         createdAt: new Date().toISOString(),
//       },
//       types: {
//         previousData: "STRING",
//       },
//     });

//     return {
//       message: 'Course created successfully.',
//       courseId,
//       courseImg: uploadedImgUrl,
//       courseData: courseData
//     };
//   } catch (error) {
//     console.error('Error creating course:', error);
//     return {
//       success: false,
//       errors: [
//         error instanceof Error ? error.message : 'Unknown error occurred.'
//       ]
//     };
//   }
// };

const createCourseHandler = async (courseData, req, file) => {
  const {
    user
  } = req;
  const id = (0, _uuid.v4)();
  const {
    courseName,
    courseDesc,
    courseCategoryId = [],
    courseLink
  } = courseData;
  try {
    const validCategories = Array.isArray(courseCategoryId) ? courseCategoryId : [courseCategoryId]; // Ensure it's an array

    // Convert categories to a string representation for BigQuery storage
    const categoriesString = validCategories.join(',');
    await createCourseTableIfNotExists();
    console.log('Checking if course name already exists...');

    // Check if course name already exists
    const [existingCourse] = await _bigquery.bigquery.query({
      query: `SELECT id FROM \`teqcertify.lms.${process.env.TABLE_COURSE}\` WHERE courseName = @courseName`,
      params: {
        courseName
      }
    });
    if (existingCourse.length > 0) {
      console.warn(`Course "${courseName}" already exists.`);
      return {
        success: false,
        message: 'Course Name already exists.'
      };
    }
    console.log('Creating new course...');
    const courseId = (0, _uuid.v4)();
    const createdAt = new Date().toISOString();
    let uploadedImgUrl = '';

    // Upload image to GCS if provided
    if (file) {
      try {
        const fileName = `${courseId}.${file.mimetype.split('/')[1]}`;
        console.log('Uploading course image to GCS...');
        uploadedImgUrl = await (0, _courseStorage.uploadCourseImageToGCS)(file.buffer, fileName, file.mimetype);
      } catch (uploadError) {
        console.error('Error uploading image to GCS:', uploadError);
        return {
          success: false,
          message: 'Failed to upload image.'
        };
      }
    }
    console.log('Inserting course info into BigQuery...');
    await _bigquery.bigquery.query({
      query: _courses.courseQueries.createCourse,
      params: {
        id: courseId,
        courseName,
        courseDesc,
        courseCategoryId: categoriesString,
        courseImg: uploadedImgUrl,
        courseLink,
        createdBy: user?.id,
        createdAt
      }
    });
    console.log(`Course created successfully. ID: ${courseId}`);

    // Prepare audit log data
    const auditLogParams = {
      id: (0, _uuid.v4)(),
      entityType: "Course",
      entityId: courseId,
      action: "CREATE",
      previousData: null,
      // No previous data for a new course
      newData: JSON.stringify({
        id: courseId,
        courseName,
        courseDesc,
        courseCategoryId,
        courseLink
      }),
      // Serialize new data
      performedBy: user?.id,
      createdAt: new Date().toISOString()
    };
    console.log('Audit Log Params:', auditLogParams); // Debugging: Log audit log params

    // Insert Audit Log
    try {
      await _bigquery.bigquery.query({
        query: _audit.auditQueries.insertAuditLog,
        params: auditLogParams,
        types: {
          previousData: "STRING",
          newData: "STRING"
        } // Ensure JSON storage
      });
      console.log('Audit log inserted successfully.');
    } catch (auditError) {
      console.error('Error inserting audit log:', auditError);
      return {
        success: false,
        message: 'Course created, but audit log insertion failed.'
      };
    }

    // Explicitly set success: true in the success case
    return {
      success: true,
      message: 'Course created successfully.',
      courseId,
      courseImg: uploadedImgUrl,
      courseData: courseData
    };
  } catch (error) {
    console.error('Error creating course:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error occurred.'
    };
  }
};

// **Get All Course**
exports.createCourseHandler = createCourseHandler;
const getAllCoursesHandler = async () => {
  await checkCourseTableExists();
  try {
    console.log('Fetching all course...');
    const [rows] = await _bigquery.bigquery.query({
      query: _courses.courseQueries.getAllCourses
    });
    console.log(`Total course found: ${rows.length}`);
    return rows;
  } catch (error) {
    console.error('Error fetching all course:', error);
    throw error;
  }
};

// **Get Course By ID**
exports.getAllCoursesHandler = getAllCoursesHandler;
const getCourseByIdHandler = async courseId => {
  await checkCourseTableExists();
  try {
    console.log(`Fetching course with ID: ${courseId}`);
    const [rows] = await _bigquery.bigquery.query({
      query: _courses.courseQueries.getCourse,
      params: {
        courseId
      } // Ensure the param matches the query placeholder
    });
    if (!rows.length) {
      console.log(`No course found with ID: ${courseId}`);
      return null;
    }
    console.log(`Course found:`, rows[0]);
    return rows[0];
  } catch (error) {
    console.error(`Error fetching course with ID ${courseId}:`, error);
    throw error;
  }
};

//UPDATE course
exports.getCourseByIdHandler = getCourseByIdHandler;
const updateCourseHandler = async (id, req, updatedData, file) => {
  const {
    user
  } = req;
  try {
    console.log(`Updating company info for ID: ${id}`);

    // Check if the table exists
    const tableExists = await checkCourseTableExists();
    if (!tableExists) {
      return {
        success: false,
        message: `Table '${TABLE_COURSE}' does not exist.`
      };
    }

    // Fetch existing company data
    const [courseResults] = await _bigquery.bigquery.query({
      query: `SELECT * FROM \`teqcertify.lms.${TABLE_COURSE}\` WHERE id = @id`,
      params: {
        id
      }
    });
    if (!Array.isArray(courseResults) || courseResults.length === 0) {
      console.error(`course with ID ${id} is not registered.`);
      return {
        status: 400,
        success: false,
        errors: [`course with ID ${id} is not registered.`]
      };
    }
    const course = courseResults[0];
    let newCourseImgUrl = course.courseImg;

    // Handle Company Logo Update
    if (file) {
      try {
        // Delete old image if exists
        const oldFileName = course.courseImg?.split('/').pop();
        if (oldFileName) {
          await (0, _courseStorage.deleteCourseImageFromGCS)(oldFileName);
        }

        // Upload new image
        const fileName = `${id}.${file.mimetype.split('/')[1]}`;
        newCourseImgUrl = await (0, _courseStorage.uploadCourseImageToGCS)(file.buffer, fileName, file.mimetype);
      } catch (uploadError) {
        console.error('Error uploading company image:', uploadError);
        return {
          success: false,
          message: 'Failed to upload company image.'
        };
      }
    }

    // Prepare update values
    const queryParams = {
      id,
      updatedBy: user?.id,
      updatedAt: new Date().toISOString()
    };

    // Handle image update
    if (newCourseImgUrl !== course.courseImg) {
      queryParams.courseImg = newCourseImgUrl;
    }

    // Process updated data with special handling for categories
    Object.entries(updatedData).forEach(([key, value]) => {
      if (value !== undefined) {
        if (key === 'courseCategoryId') {
          // Ensure categories are processed as an array and converted to comma-separated string
          const categories = Array.isArray(value) ? value : [value].filter(Boolean);
          queryParams[key] = categories.join(',');
        } else {
          queryParams[key] = value;
        }
      }
    });
    Object.entries(updatedData).forEach(([key, value]) => {
      if (value !== undefined) {
        queryParams[key] = value;
      }
    });

    // Construct dynamic update query
    const updateFields = Object.keys(queryParams).filter(key => key !== 'id').map(key => `${key} = @${key}`).join(', ');
    if (!updateFields) {
      return {
        success: false,
        message: 'No fields provided for update.'
      };
    }

    // Execute update query
    await _bigquery.bigquery.query({
      query: `UPDATE \`teqcertify.lms.${TABLE_COURSE}\` SET ${updateFields} WHERE id = @id`,
      params: queryParams
    });
    console.log(`Course with ID ${id} updated successfully.`);

    // Insert Audit Log
    const auditLogParams = {
      id: (0, _uuid.v4)(),
      entityType: "Course",
      entityId: id,
      action: "UPDATE",
      previousData: JSON.stringify(course),
      newData: JSON.stringify(queryParams),
      performedBy: user?.id,
      createdAt: new Date().toISOString()
    };
    await _bigquery.bigquery.query({
      query: _audit.auditQueries.insertAuditLog,
      params: auditLogParams,
      types: {
        previousData: "STRING",
        newData: "STRING"
      } // Ensures JSON storage
    });
    return {
      message: `Course with ID ${id} updated successfully.`,
      // courseCategoryImg: queryParams.coursecategoryImg || courseCategory.coursecategoryImg,
      courseData: updatedData
    };
  } catch (error) {
    console.error(`Error updating course with ID ${id}:`, error);
    return {
      status: 500,
      success: false,
      errors: ['Internal server error occurred.']
    };
  }
};

// **Delete Course Handler**
exports.updateCourseHandler = updateCourseHandler;
const deleteCourseHandler = async (id, req) => {
  const {
    user
  } = req;
  try {
    console.log(`Deleting course with ID: ${id}`);

    // Check if the course table exists
    if (!(await checkCourseTableExists())) {
      throw new Error(`Table '${TABLE_COURSE}' does not exist.`);
    }

    // Fetch the course data before deletion
    const [rows] = await _bigquery.bigquery.query({
      query: `SELECT * FROM \`teqcertify.lms.${TABLE_COURSE}\` WHERE id = @id`,
      params: {
        id
      }
    });
    if (!rows.length) {
      console.log('Course not found.');
      return {
        success: false,
        message: 'Course not found.'
      };
    }

    // Delete the course image from GCS if it exists
    const fileName = rows[0].courseImg?.split('/').pop();
    if (fileName) {
      console.log('Deleting Course image...');
      await (0, _courseStorage.deleteCourseImageFromGCS)(fileName);
    }

    // Delete the course from BigQuery
    await _bigquery.bigquery.query({
      query: _courses.courseQueries.deleteCourse,
      params: {
        id
      } // Use id here
    });
    console.log(`Course with ID ${id} deleted successfully.`);

    // Insert Audit Log
    const auditLogParams = {
      id: (0, _uuid.v4)(),
      entityType: "Course",
      entityId: id,
      action: "DELETE",
      previousData: JSON.stringify(rows[0]),
      // Store full course data before deletion
      newData: null,
      performedBy: user?.id,
      createdAt: new Date().toISOString()
    };
    await _bigquery.bigquery.query({
      query: _audit.auditQueries.insertAuditLog,
      params: auditLogParams,
      types: {
        previousData: "STRING",
        newData: "STRING"
      }
    });
    return {
      success: true,
      message: `Course with ID ${id} deleted successfully.`
    };
  } catch (error) {
    console.error(`Error deleting Course with ID ${id}:`, error);
    return {
      success: false,
      errors: ['Internal server error occurred.']
    };
  }
};
exports.deleteCourseHandler = deleteCourseHandler;
//# sourceMappingURL=courses.handler.js.map