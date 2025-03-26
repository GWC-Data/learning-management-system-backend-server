import { bigquery } from '../../config/bigquery';
import { v4 as uuidv4 } from 'uuid';
import { Batch } from 'db';
import { batchQueries } from 'queries/batch/batch.queries';
import { batchTraineeQueries } from 'queries/batchTrainee/batchTrainee.queries';
import { auditQueries } from 'queries/audit/audit.queries';


// Function to check if the batch table exists
const checkBatchTableExists = async () => {
  try {
    const [rows] = await bigquery.query({
      query: `
        SELECT table_name 
        FROM \`teqcertify.lms.INFORMATION_SCHEMA.TABLES\` 
        WHERE table_name = 'batches'
      `
    });

    return rows.length > 0;
  } catch (error) {
    console.error("Error checking table existence:", error);
    throw error;
  }
};

// Function to create the batch table if it does not exist
const createBatchTableIfNotExists = async () => {
  const exists = await checkBatchTableExists();
  if (!exists) {
    try {
      await bigquery.query({
        query: `
          CREATE TABLE \`teqcertify.lms.batches\` (
            id STRING NOT NULL, 
            courseId STRING NOT NULL,
            batchName STRING NOT NULL,
            startDate DATE NOT NULL,
            endDate DATE NOT NULL,
            createdBy STRING NOT NULL,
            updatedBy STRING,
            createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          )
        `
      });
      console.log("Batch table created successfully.");
    } catch (error) {
      console.error("Error creating Batch table:", error);
      throw error;
    }
  }
};

// Function to check if the batchTrainee table exists
const checkBatchTraineeTableExists = async () => {
  try {
    const [rows] = await bigquery.query({
      query: `
        SELECT table_name 
        FROM \`teqcertify.lms.INFORMATION_SCHEMA.TABLES\` 
        WHERE table_name = 'batchTrainees'
      `
    });
    return rows.length > 0;
  } catch (error) {
    console.error("Error checking table existence:", error);
    throw error;
  }
};

const createBatchTraineeTableIfNotExists = async () => {
  const exists = await checkBatchTraineeTableExists();
  if (!exists) {
    try {
      await bigquery.query({
        query: `
          CREATE TABLE \`teqcertify.lms.batchTrainees\` (
            batchId STRING NOT NULL,
            traineeId STRING NOT NULL,
            createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          )
        `
      });
      console.log("BatchTrainee table created successfully.");
    } catch (error) {
      console.error("Error creating BatchTrainee table:", error);
      throw error;
    }
  }
};

//create batch table
// export const createBatchTable = async (req: any, batch: Batch) => {
//   await createBatchTableIfNotExists();
//   await createBatchTraineeTableIfNotExists();

//   const { courseId, batchName, traineeIds, startDate, endDate } = batch;
//   const batchId = uuidv4();
//   const { user } = req;

//   try {
//     // Step 1: Validate Course Existence
//     const [courseExists] = await bigquery.query({
//       query: `
//         SELECT id FROM \`${process.env.PROJECT_ID}.${process.env.DATASET_ID}.${process.env.TABLE_COURSE}\`
//         WHERE id = @courseId`,
//       params: { courseId },
//     });

//     if (courseExists.length === 0) {
//       throw new Error(`Course with ID ${courseId} not found.`);
//     }

//     // Step 2: Validate Trainees
//     let matchedTraineeIds: string[] = [];
//     if (traineeIds.length > 0) {
//       const [traineeResults] = await bigquery.query({
//         query: `
//           SELECT id FROM \`${process.env.PROJECT_ID}.${process.env.DATASET_ID}.${process.env.TABLE_USER}\`
//           WHERE id IN UNNEST(@traineeIds)`,
//         params: { traineeIds },
//       });

//       matchedTraineeIds = traineeResults.map((row: any) => row.id);

//       if (matchedTraineeIds.length !== traineeIds.length) {
//         const missingTraineeIds = traineeIds.filter(
//           (id) => !matchedTraineeIds.includes(id)
//         );
//         throw new Error(
//           `Some trainees were not found: ${missingTraineeIds.join(", ")}`
//         );
//       }
//     }

//     // Step 3: Insert Batch Data
//     await bigquery.query({
//       query: batchQueries.createBatch,
//       params: {
//         id: batchId,
//         courseId,
//         batchName,
//         startDate,
//         endDate,
//         createdBy: user?.id,
//         createdAt: new Date().toISOString(),
//       },
//     });
//     console.log("Batch created successfully:", batchId);

//     // Step 4: Bulk Insert Batch-Trainee Mappings
//     if (matchedTraineeIds.length > 0) {
//       const batchTraineeInsertData = matchedTraineeIds.map((traineeId) => ({
//         batchId,
//         traineeId,
//       }));

//       await bigquery.query({
//         query: `
//       INSERT INTO \`${process.env.PROJECT_ID}.${process.env.DATASET_ID}.${process.env.TABLE_BATCH_TRAINEE}\`
//       (batchId, traineeId, createdAt, updatedAt)
//       SELECT
//         batchId,
//         traineeId,
//         TIMESTAMP(createdAt) AS createdAt,
//         TIMESTAMP(updatedAt) AS updatedAt
//       FROM UNNEST(@batchTraineeInsertData) AS batchTraineeInsertData
//       WHERE NOT EXISTS (
//         SELECT 1
//         FROM \`${process.env.PROJECT_ID}.${process.env.DATASET_ID}.${process.env.TABLE_BATCH_TRAINEE}\` bt
//         WHERE bt.batchId = @batchId AND bt.traineeId = batchTraineeInsertData.traineeId
//       )`,
//         params: {
//           batchTraineeInsertData,
//           batchId,
//           createdAt: new Date().toISOString(),
//           updatedAt: new Date().toISOString(),
//         },
//       });

//       console.log("Batch-Trainee linked successfully.");

//        // **Step 6: Audit Log for Batch-Trainee Mapping**
//        await bigquery.query({
//         query: auditQueries.insertAuditLog,
//         params: {
//           id: uuidv4(),
//           entityType: "Batch",
//           entityId: batchId,
//           action: "CREATE",
//           previousData: null,
//           newData: JSON.stringify(matchedTraineeIds),
//           performedBy: user?.id,
//           createdAt: new Date().toISOString(),
//         },
//         types: {
//           previousData: 'STRING',
//           newData: 'STRING',
//         }
//       });
//       console.log("Audit log inserted for batch-trainee linking.");
//     }

//     return { id: batchId, ...batch, traineeIds };
//   } catch (error: any) {
//     console.error("Error creating Batch:", error.message, error);
//     throw new Error(`Batch creation failed: ${error.message}`);
//   }
// };

export const createBatchTable = async (req: any, batch: Batch) => {
  await createBatchTableIfNotExists();
  await createBatchTraineeTableIfNotExists();

  const { courseId, batchName, traineeIds, startDate, endDate } = batch;
  const batchId = uuidv4();
  const { user } = req;
  const currentTimestamp = new Date().toISOString();

  try {
    // Step 1: Validate Course Existence
    const [courseExists] = await bigquery.query({
      query: `
        SELECT id FROM \`${process.env.PROJECT_ID}.${process.env.DATASET_ID}.${process.env.TABLE_COURSE}\`
        WHERE id = @courseId`,
      params: { courseId },
    });

    if (courseExists.length === 0) {
      throw new Error(`Course with ID ${courseId} not found.`);
    }

    // Step 2: Validate Trainees
    let matchedTraineeIds: string[] = [];
    if (traineeIds.length > 0) {
      const [traineeResults] = await bigquery.query({
        query: `
          SELECT id FROM \`${process.env.PROJECT_ID}.${process.env.DATASET_ID}.${process.env.TABLE_USER}\`
          WHERE id IN UNNEST(@traineeIds)`,
        params: { traineeIds },
      });

      matchedTraineeIds = traineeResults.map((row: any) => row.id);

      if (matchedTraineeIds.length !== traineeIds.length) {
        const missingTraineeIds = traineeIds.filter(
          (id) => !matchedTraineeIds.includes(id)
        );
        throw new Error(
          `Some trainees were not found: ${missingTraineeIds.join(", ")}`
        );
      }
    }

    // Step 3: Insert Batch Data
    await bigquery.query({
      query: `
        INSERT INTO \`${process.env.PROJECT_ID}.${process.env.DATASET_ID}.${process.env.TABLE_BATCH}\`
         (id, courseId, batchName, startDate, endDate, createdBy, createdAt)
        VALUES (@id, @courseId, @batchName, @startDate, @endDate, @createdBy, TIMESTAMP(@createdAt))
      `,
      params: {
        id: batchId,
        courseId,
        batchName,
        startDate,
        endDate,
        createdBy: user?.id,
        createdAt: currentTimestamp,
      },
    });
    console.log("Batch created successfully:", batchId);

    // Step 4: Bulk Insert Batch-Trainee Mappings
    if (matchedTraineeIds.length > 0) {
      const batchTraineeInsertData = matchedTraineeIds.map((traineeId) => ({
        batchId,
        traineeId,
      }));

      await bigquery.query({
        query: `
          INSERT INTO \`${process.env.PROJECT_ID}.${process.env.DATASET_ID}.${process.env.TABLE_BATCH_TRAINEE}\`
          (batchId, traineeId, createdAt, updatedAt)
          SELECT
            batchTraineeData.batchId,
            batchTraineeData.traineeId,
            TIMESTAMP(@timestamp) AS createdAt,
            TIMESTAMP(@timestamp) AS updatedAt
          FROM UNNEST(@batchTraineeInsertData) AS batchTraineeData
          WHERE NOT EXISTS (
            SELECT 1
            FROM \`${process.env.PROJECT_ID}.${process.env.DATASET_ID}.${process.env.TABLE_BATCH_TRAINEE}\` bt
            WHERE bt.batchId = @batchId AND bt.traineeId = batchTraineeData.traineeId
          )`,
        params: {
          batchTraineeInsertData,
          batchId,
          timestamp: currentTimestamp,
        },
      });

      console.log("Batch-Trainee linked successfully.");

      // Step 6: Audit Log for Batch-Trainee Mapping
      await bigquery.query({
        query: auditQueries.insertAuditLog,
        params: {
          id: uuidv4(),
          entityType: "Batch",
          entityId: batchId,
          action: "CREATE",
          previousData: null,
          newData: JSON.stringify(matchedTraineeIds),
          performedBy: user?.id,
          createdAt: currentTimestamp,
        },
        types: {
          previousData: 'STRING',
          newData: 'STRING',
        }
      });
      console.log("Audit log inserted for batch-trainee linking.");
    }

    return { id: batchId, ...batch, traineeIds };
  } catch (error: any) {
    console.error("Error creating Batch:", error.message, error);
    throw new Error(`Batch creation failed: ${error.message}`);
  }
};

//getall Batches
export const getAllBatchesHandler = async () => {
  try {
    const [rows] = await bigquery.query({ query: batchQueries.getBatches });

    const batchMap = new Map();

    rows.forEach((row: any) => {
      const { batchId, batchCourseId, batchName, batchStartDate, batchEndDate, traineeId, traineeFirstName, traineeLastName, courseName, courseImg, courseLink } = row;

      if (!batchMap.has(batchId)) {
        batchMap.set(batchId, {
          id: batchId,
          course: batchCourseId
            ? { id: batchCourseId, courseName, courseImg, courseLink }
            : null,
          batchName,
          startDate: batchStartDate,
          endDate: batchEndDate,
          trainees: [],
        });
      }

      // Add trainees if they exist
      if (traineeId) {
        batchMap.get(batchId).trainees.push({
          id: traineeId,
          firstName: traineeFirstName,
          lastName: traineeLastName,
        });
      }
    });

    return Array.from(batchMap.values());
  } catch (error) {
    console.error("Error fetching all batches:", error);
    throw error;
  }
};

//getBatch based on id
export const getBatchDetailsHandler = async (id: string) => {
  try {

    console.log("Fetching batch with ID:", id);

    const options = {
      query: batchQueries.getBatchDetails,
      params: { batchId: id }
    };

    const [rows] = await bigquery.query(options);

    if (rows.length === 0) {
      throw new Error("Batch not found");
    }

    const batchData = {
      id: rows[0].batchId,
      courseId: rows[0].batchCourseId,
      batchName: rows[0].batchName,
      startDate: rows[0].batchStartDate,
      endDate: rows[0].batchEndDate,
      trainees: rows[0].trainees || [],
      course: {
        courseName: rows[0].courseName,
        courseImg: rows[0].courseImg,
        courseLink: rows[0].courseLink
      }
    };

    return batchData;
  } catch (error) {
    console.error("Error fetching batch details:", error);
    throw error;
  }
};

export const getBatchByBatchNameHandler = async (batchName: string) => {
  try {
    console.log("Fetching Batch Details for Batch Name:", batchName);

    const options = {
      query: batchQueries.getBatchByBatchName,
      params: { batchName },
    };

    const [rows] = await bigquery.query(options);

    if (rows.length === 0) {
      throw new Error("Batch not found");
    }

    // Transform the result into a structured response
    const batchData = {
      batchId: rows[0].batchId,
      batchName: rows[0].batchName,
      startDate: rows[0].startDate,
      endDate: rows[0].endDate,
      course: rows[0].courseId
        ? {
            id: rows[0].courseId,
            courseName: rows[0].courseName,
            courseImg: rows[0].courseImg,
            courseLink: rows[0].courseLink,
          }
        : null,
      trainees: rows
        .filter((row) => row.traineeId !== null) // Remove null values if no trainees exist
        .map((row) => ({
          id: row.traineeId,
          firstName: row.traineeFirstName,
          lastName: row.traineeLastName,
        })),
    };

    return batchData;
  } catch (error) {
    console.error("Error fetching batch:", error);
    throw error;
  }
};

export const getBatchIdsByTraineeIdHandler = async (id: string) => {
  try {
    console.log("Fetching batches for traineeId:", id);

    const options = {
      query: batchQueries.getBatchIdsByTraineeId,
      params: { traineeId: id },
    };

    const [rows] = await bigquery.query(options);

    if (!rows || rows.length === 0) {
      throw new Error("No batches found for this trainee");
    }

    // Extract only batch IDs
    const batchIds = rows.map(row => row.batchId);

    return batchIds;
  } catch (error) {
    console.error("Error fetching batch IDs:", error);
    throw error;
  }
};

//update batch
export const updateBatchesHandler = async (id: string, req: any, updateBatch: Partial<Batch>) => {
  const { user } =req;
  try {
    console.log(`Updating batch with ID: ${id}`);

    // Step 1: Fetch existing batch data
    const batchOptions = {
      query: batchQueries.getBatchDetails,
      params: { batchId: id },
    };

    const [existingRows] = await bigquery.query(batchOptions);
    if (existingRows.length === 0) {
      throw new Error("Batch not found");
    }

    const existingBatch = existingRows[0];

    // Step 2: Update batch details
    const updateBatchOptions = {
      query: batchQueries.updateBatch,
      params: {
        batchId: id,
        batchName: updateBatch.batchName || existingBatch.batchName,
        courseId: updateBatch.courseId || existingBatch.batchCourseId,
        startDate: updateBatch.startDate || existingBatch.batchStartDate,
        endDate: updateBatch.endDate || existingBatch.batchEndDate,
        updatedBy: user.id,
        updatedAt: new Date().toISOString(),
      },
    };

      // **Step 3: Audit Log for Batch Update**
      // await bigquery.query({
      //   query: auditQueries.insertAuditLog,
      //   params: {
      //     id: uuidv4(),
      //     entityType: "Batch",
      //     entityId: id,
      //     action: "UPDATE",
      //     previousData: JSON.stringify(existingBatch),
      //     newData: JSON.stringify(updateBatch),
      //     performedBy: user?.id,
      //     createdAt: new Date().toISOString(),
      //   },
      // });
      
    await bigquery.query(updateBatchOptions);

    if (updateBatch.traineeIds && updateBatch.traineeIds.length > 0) {
      // Step 1: Delete existing batch-trainee relationships
      const deleteBatchOptions = {
        query: batchTraineeQueries.deleteBatchTrainee,
        params: { batchId: id },
      };
      await bigquery.query(deleteBatchOptions);

      // Step 2: Validate the trainee IDs
      const [validTrainees] = await bigquery.query({
        query: batchTraineeQueries.getBatchTraineeIds,
        params: { traineeIds: updateBatch.traineeIds },
      });

      const matchedTraineeIds = validTrainees.map((row: any) => row.id);

      if (matchedTraineeIds.length !== updateBatch.traineeIds.length) {
        throw new Error("Some traineeIds were not found.");
      }

      // Step 3: Insert new trainees using `UNNEST`
      const batchTraineeInsertData = matchedTraineeIds.map((traineeId) => ({
        batchId: id,
        traineeId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }));

      const insertBatchTraineesOptions = {
        query: `
          INSERT INTO \`${process.env.PROJECT_ID}.${process.env.DATASET_ID}.${process.env.TABLE_BATCH_TRAINEE}\`
          (batchId, traineeId, createdAt, updatedAt)
          SELECT
            batchId,
            traineeId,
            TIMESTAMP(createdAt) AS createdAt,
            TIMESTAMP(updatedAt) AS updatedAt
          FROM UNNEST(@batchTraineeInsertData) AS batchTraineeInsertData
        `,
        params: {
          batchTraineeInsertData,
        },
      };

      await bigquery.query(insertBatchTraineesOptions);
    }

    // **Step 3: Audit Log for Batch Update**
    await bigquery.query({
      query: auditQueries.insertAuditLog,
      params: {
        id: uuidv4(),
        entityType: "Batch",
        entityId: id,
        action: "UPDATE",
        previousData: JSON.stringify(existingBatch),
        newData: JSON.stringify(updateBatch),
        performedBy: user?.id,
        createdAt: new Date().toISOString(),
      },
    });

    console.log("Audit log inserted for batch-trainee update.");

    console.log(`Batch updated successfully.`);

    return { id, ...updateBatch };
  } catch (error) {
    console.error(`Error updating batch ${id}:`, error);
    throw error;
  }
};

//DELETE batch
export const deleteBatchHandler = async (req: any, id: string) => {
  const exist = await checkBatchTableExists();
  const { user } = req;

  if (!exist) {
    console.error("Batch table does not exist");
    return { success: false, message: "Batch table does not exist" };
  }

  try {
    console.log(`Deleting trainees associated with batch ID: ${id}`);
    await bigquery.query({
      query: batchTraineeQueries.deleteBatchTrainee,
      params: { batchId: id },
    });

    console.log(`Deleting batch with ID: ${id}`);
    await bigquery.query({
      query: batchQueries.deleteBatch,
      params: { id },
    });

    // **Audit Log for Deleting Batch**
    console.log(`Inserting audit log for batch deletion (ID: ${id})...`);
    
    //audit log
    await bigquery.query({
      query: auditQueries.insertAuditLog,
      params: {
        id: uuidv4(),
        entityType: "Batch",
        entityId: id,
        action: "DELETE",
        previousData: JSON.stringify({ batchId: id }), // Store previous data as a string
        newData: "", // Instead of `null`, use an empty string
        performedBy: user?.id || "SYSTEM",
        createdAt: new Date().toISOString(),
      },
      types: {
        previousData: "STRING",
        newData: "STRING",
      },
    });

    console.log(`Batch and associated trainees deleted successfully.`);
    return { success: true, message: "Batch deleted successfully" };
  } catch (error) {
    console.error(`Error deleting batch ${id}:`, error);
    return { success: false, message: `Error deleting batch` };
  }
};
