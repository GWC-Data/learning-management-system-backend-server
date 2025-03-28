import { bigquery } from '../../config/bigquery';
import { v4 as uuidv4 } from 'uuid';
import { batchClassScheduleQueries } from 'queries/batchClassSchedule/batchClassSchedule.queries';
import { batchTrainerQueries } from 'queries/batchTrainer/batchTrainer.queries';
import { auditQueries } from 'queries/audit/audit.queries';
import { BatchClassSchedule } from 'db';

// The interface is now defined in your file

// Function to check if the batchClassSchedule table exists
const checkBatchClassScheduleTableExists = async () => {
  try {
    const [rows] = await bigquery.query({
      query: `
        SELECT table_name 
        FROM \`teqcertify.lms.INFORMATION_SCHEMA.TABLES\` 
        WHERE table_name = 'batchClassSchedules'
      `
    });
    return rows.length > 0;
  } catch (error) {
    console.error('Error checking table existence:', error);
    throw error;
  }
};

// Function to create the batchClassSchedule table if it does not exist
const createBatchClassScheduleTableIfNotExists = async () => {
  const exists = await checkBatchClassScheduleTableExists();
  if (!exists) {
    try {
      await bigquery.query({
        query: `
          CREATE TABLE \`teqcertify.lms.batchClassSchedules\` (
            id STRING NOT NULL, 
            batchId STRING NOT NULL,
            moduleId STRING NOT NULL,
            classId STRING NOT NULL,
            startDate DATE NOT NULL,
            startTime TIME NOT NULL,
            endDate DATE NOT NULL,
            endTime TIME NOT NULL,
            meetingLink STRING NOT NULL,
            assignmentEndDate STRING,
            createdBy STRING NOT NULL,
            updatedBy STRING,
            createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          )
        `
      });
      console.log('BatchClassSchedule table created successfully.');
    } catch (error) {
      console.error('Error creating BatchClassSchedule table:', error);
      throw error;
    }
  }
};

const checkAssignmentTableExists = async () => {
  try {
    const [rows] = await bigquery.query({
      query: `
        SELECT table_name 
        FROM \`teqcertify.lms.INFORMATION_SCHEMA.TABLES\` 
        WHERE table_name = 'assignments'
      `
    });
    return rows.length > 0;
  } catch (error) {
    console.error('Error checking table existence:', error);
    throw error;
  }
};

const createAssignmentTableIfNotExists = async () => {
  const exists = await checkAssignmentTableExists();
  if (!exists) {
    try {
      await bigquery.query({
        query: `
          CREATE TABLE \`teqcertify.lms.assignments\` (
            id STRING NOT NULL, 
            batchId STRING NOT NULL,
            classId STRING NOT NULL,
            traineeId STRING NOT NULL,
            assignmentEndDate STRING,
            createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          )
        `
      });
      console.log('Assignments table created successfully.');
    } catch (error) {
      console.error('Error creating Assignments table:', error);
      throw error;
    }
  }
};

// Function to check if the batchTrainer table exists
const checkBatchTrainerTableExists = async () => {
  try {
    const [rows] = await bigquery.query({
      query: `
        SELECT table_name 
        FROM \`teqcertify.lms.INFORMATION_SCHEMA.TABLES\` 
        WHERE table_name = 'batchTrainers'
      `
    });
    return rows.length > 0;
  } catch (error) {
    console.error('Error checking table existence:', error);
    throw error;
  }
};

//create batchClassSchedule table
const createBatchTrainerTableIfNotExists = async () => {
  const exists = await checkBatchTrainerTableExists();
  if (!exists) {
    try {
      await bigquery.query({
        query: `
          CREATE TABLE \`teqcertify.lms.batchTrainers\` (
            batchClassScheduleId STRING NOT NULL,
            trainerId STRING NOT NULL,
            createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          )
        `
      });
      console.log('BatchTrainer table created successfully.');
    } catch (error) {
      console.error('Error creating BatchTrainer table:', error);
      throw error;
    }
  }
};

//Create batchClassSchedule
export const createBatchClassScheduleTableHandler = async (
  req: any,
  batchModule: BatchClassSchedule
) => {
  await createBatchClassScheduleTableIfNotExists();
  await createBatchTrainerTableIfNotExists();

  const {
    batchId,
    moduleId,
    classId,
    trainerIds = [],
    startDate,
    startTime,
    endDate,
    endTime,
    meetingLink
  } = batchModule;
  const batchClassScheduleId = uuidv4();
  const { user } = req;
  try {
    // Step 1: Validate Batch Existence
    const [batchExists] = await bigquery.query({
      query: `
          SELECT id FROM \`${process.env.PROJECT_ID}.${process.env.DATASET_ID}.${process.env.TABLE_BATCH}\`
          WHERE id = @batchId`,
      params: { batchId }
    });

    if (batchExists.length === 0) {
      throw new Error(`Batch with ID ${batchId} not found.`);
    }

    // Step 2: Validate Module Existence
    const [moduleExists] = await bigquery.query({
      query: `
          SELECT id FROM \`${process.env.PROJECT_ID}.${process.env.DATASET_ID}.${process.env.TABLE_MODULE}\`
          WHERE id = @moduleId`,
      params: { moduleId }
    });

    if (moduleExists.length === 0) {
      throw new Error(`Module with ID ${moduleId} not found.`);
    }

    // Step 2: Validate Module Existence
    const [classExit] = await bigquery.query({
      query: `
          SELECT id FROM \`${process.env.PROJECT_ID}.${process.env.DATASET_ID}.${process.env.TABLE_CLASS}\`
          WHERE id = @classId`,
      params: { classId }
    });

    if (classExit.length === 0) {
      throw new Error(`Class with ID ${classId} not found.`);
    }

    // Step 3: Validate Trainers
    let matchedTrainerIds: string[] = [];
    if (trainerIds.length > 0) {
      const [traineeResults] = await bigquery.query({
        query: `
            SELECT id FROM \`${process.env.PROJECT_ID}.${process.env.DATASET_ID}.${process.env.TABLE_USER}\`
            WHERE id IN UNNEST(@trainerIds)`,
        params: { trainerIds }
      });

      matchedTrainerIds = traineeResults.map((row: any) => row.id);

      if (matchedTrainerIds.length !== trainerIds.length) {
        const missingTrainerIds = trainerIds.filter(
          (id: string) => !matchedTrainerIds.includes(id)
        );
        throw new Error(
          `Some trainers were not found: ${missingTrainerIds.join(', ')}`
        );
      }
    }

    const assignmentEndDate = new Date(endDate);
    assignmentEndDate.setDate(assignmentEndDate.getDate() + 1); // Add 1 day

    // Step 4: Insert BatchModule Data
    await bigquery.query({
      query: batchClassScheduleQueries.createBatchClassSchedule,
      params: {
        id: batchClassScheduleId,
        batchId,
        moduleId,
        classId,
        startDate,
        startTime,
        endDate,
        endTime,
        meetingLink,
        assignmentEndDate: assignmentEndDate.toISOString(),
        createdBy: user?.id,
        createdAt: new Date().toISOString()
      }
    });
    console.log(
      'BatchClassSchedule created successfully:',
      batchClassScheduleId
    );

    // Step 5: Bulk Insert Batch-Trainer Mappings
    if (matchedTrainerIds.length > 0) {
      const batchTrainerInsertData = matchedTrainerIds.map((trainerId) => ({
        batchClassScheduleId,
        trainerId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }));

      await bigquery.query({
        query: `
        INSERT INTO \`${process.env.PROJECT_ID}.${process.env.DATASET_ID}.${process.env.TABLE_BATCH_TRAINER}\`
        (batchClassScheduleId, trainerId, createdAt, updatedAt)
        SELECT
          batchClassScheduleId,
          trainerId,
          TIMESTAMP(createdAt) AS createdAt,
          TIMESTAMP(updatedAt) AS updatedAt
        FROM UNNEST(@batchTrainerInsertData) AS batchTrainerInsertData
        WHERE NOT EXISTS (
          SELECT 1
          FROM \`${process.env.PROJECT_ID}.${process.env.DATASET_ID}.${process.env.TABLE_BATCH_TRAINER}\` bt
          WHERE bt.batchClassScheduleId = @batchClassScheduleId AND bt.trainerId = batchTrainerInsertData.trainerId
        )`,
        params: {
          batchTrainerInsertData,
          batchClassScheduleId
        }
      });

      console.log('Batch-Trainer linked successfully.');
    }

    // Insert Audit Log
    const auditLogParams = {
      id: uuidv4(),
      entityType: 'BatchClassSchedule',
      entityId: batchClassScheduleId,
      action: 'CREATE',
      previousData: null, // Since it's a new role, there's no previous data
      newData: JSON.stringify({
        batchClassScheduleId,
        batchId,
        moduleId,
        classId,
        startDate,
        startTime,
        endDate,
        endTime,
        meetingLink,
        assignmentEndDate
      }),
      performedBy: user?.id,
      CreatedAt: new Date().toISOString()
    };

    await bigquery.query({
      query: auditQueries.insertAuditLog,
      params: auditLogParams,
      types: { previousData: 'STRING', newData: 'STRING' }
    });

    return {
      id: batchClassScheduleId,
      ...batchModule,
      trainerIds,
      assignmentEndDate
    };
  } catch (error: any) {
    console.error('Error creating BatchClassSchedule:', error.message, error);
    throw new Error(`BatchClassSchedule creation failed: ${error.message}`);
  }
};

//Getall BatchClassSchedule
export const getAllBatchClassSchedulesHandler = async () => {
  try {
    const [rows] = await bigquery.query({
      query: batchClassScheduleQueries.getAllBatchClassSchedules
    });

    return {
      batchClassSchedules: rows.map((row) => ({
        id: row.batchClassScheduleId,
        batch: row.batchId
          ? {
              id: row.batchId,
              batchName: row.batchName
            }
          : null,
        module: row.moduleId
          ? {
              id: row.moduleId,
              moduleName: row.moduleName
            }
          : null,
        class: row.classId
          ? {
              id: row.classId,
              classTitle: row.classTitle
            }
          : null,
        startDate: row.startDate,
        startTime: row.startTime,
        endDate: row.endDate,
        endTime: row.endTime,
        meetingLink: row.meetingLink,
        assignmentEndDate: row.assignmentEndDate,
        trainers: row.trainers
          ? row.trainers.map(
              (trainer: { trainerId: any; firstName: any; lastName: any }) => ({
                id: trainer.trainerId || null,
                firstName: trainer.firstName || null,
                lastName: trainer.lastName || null
              })
            )
          : [],
        assignments: row.assignments
          ? row.assignments.map(
              (assignment: {
                assignmentId: any;
                assignmentBatchId: any;
                assignmentTraineeId: any;
                traineeFirstName: any;
                traineeLastName: any;
                assignmentEndDate: any;
              }) => ({
                id: assignment.assignmentId || null,
                batchId: assignment.assignmentBatchId || null,
                traineeId: assignment.assignmentTraineeId || null,
                traineeFirstName: assignment.traineeFirstName || null,
                traineeLastName: assignment.traineeLastName || null,
                assignmentEndDate: assignment.assignmentEndDate || null
              })
            )
          : []
      }))
    };
  } catch (error) {
    console.error('Error fetching batch module schedules:', error);
    return {
      message: 'Error fetching batch module schedules',
      error
    };
  }
};

//GetBatchModule based on ID
export const getBatchClassScheduleDetailsHandler = async (id: string) => {
  try {
    console.log('Fetching BatchClassSchedule with ID:', id);

    const options = {
      query: batchClassScheduleQueries.getBatchClassScheduleDetails,
      params: { batchClassScheduleId: id }
    };

    const [rows] = await bigquery.query(options);

    if (rows.length === 0) {
      throw new Error('BatchClassSchedule not found');
    }

    return {
      batchClassSchedules: rows.map((row) => ({
        id: row.batchClassScheduleId,
        batch: row.batchId
          ? {
              id: row.batchId,
              batchName: row.batchName
            }
          : null,
        module: row.moduleId
          ? {
              id: row.moduleId,
              moduleName: row.moduleName
            }
          : null,
        class: row.classId
          ? {
              id: row.classId,
              classTitle: row.classTitle
            }
          : null,
        startDate: row.startDate,
        startTime: row.startTime,
        endDate: row.endDate,
        endTime: row.endTime,
        meetingLink: row.meetingLink,
        assignmentEndDate: row.assignmentEndDate,
        trainers: row.trainers
          ? row.trainers.map(
              (trainer: { trainerId: any; firstName: any; lastName: any }) => ({
                id: trainer.trainerId || null,
                firstName: trainer.firstName || null,
                lastName: trainer.lastName || null
              })
            )
          : [],
        assignments: row.assignments
          ? row.assignments.map(
              (assignment: {
                assignmentId: any;
                assignmentBatchId: any;
                assignmentTraineeId: any;
                traineeFirstName: any;
                traineeLastName: any;
                assignmentEndDate: any;
              }) => ({
                id: assignment.assignmentId || null,
                batchId: assignment.assignmentBatchId || null,
                traineeId: assignment.assignmentTraineeId || null,
                traineeFirstName: assignment.traineeFirstName || null,
                traineeLastName: assignment.traineeLastName || null,
                assignmentEndDate: assignment.assignmentEndDate || null
              })
            )
          : []
      }))
    };
  } catch (error) {
    console.error('Error fetching batch module schedule details:', error);
    throw error;
  }
};

export const getBatchClassScheduleByClassIdHandler = async (
  classId: string
) => {
  try {
    console.log('Fetching BatchClassSchedule with classId:', classId);

    const options = {
      query: batchClassScheduleQueries.getBatchClassScheduleByClassId,
      params: { classId }
    };

    const [rows] = await bigquery.query(options);

    if (rows.length === 0) {
      throw new Error('No BatchClassSchedule found for this classId');
    }

    const batchModuleClass = rows.map((row) => ({
      id: row.batchClassScheduleId,
      batchId: row.batchId,
      moduleId: row.module?.id || null,
      classId: row.class?.id || null,
      startDate: row.startDate,
      startTime: row.startTime,
      endDate: row.endDate,
      endTime: row.endTime,
      meetingLink: row.meetingLink,
      duration: row.duration || null,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,

      module: {
        id: row.module?.id || null,
        moduleName: row.module?.moduleName || null,
        materialForModule: row.module?.materialForModule || null
      },

      class: {
        id: row.class?.id || null,
        classTitle: row.class?.classTitle || null
      },

      batch: {
        id: row.batch?.id || null,
        batchName: row.batch?.batchName || null,
        startDate: row.batch?.startDate || null,
        endDate: row.batch?.endDate || null
      },

      trainers: row.trainers
        ? row.trainers.map(
            (trainer: {
              id: string;
              firstName: string;
              lastName: string;
              BatchTrainer: { batchClassScheduleId: string; trainerId: string };
            }) => ({
              id: trainer.id,
              firstName: trainer.firstName,
              lastName: trainer.lastName,
              BatchTrainer: {
                batchClassScheduleId:
                  trainer.BatchTrainer?.batchClassScheduleId || null,
                trainerId: trainer.BatchTrainer?.trainerId || null
              }
            })
          )
        : [],

      assignments: row.assignments
        ? row.assignments.map(
            (assignment: {
              assignmentId: string;
              assignmentBatchId: string;
              assignmentTraineeId: string;
              assignmentEndDate: string;
              traineeFirstName: string;
              traineeLastName: string;
            }) => ({
              assignmentId: assignment.assignmentId,
              batchId: assignment.assignmentBatchId,
              traineeId: assignment.assignmentTraineeId,
              assignmentEndDate: assignment.assignmentEndDate,
              traineeName: `${assignment.traineeFirstName} ${assignment.traineeLastName}`
            })
          )
        : []
    }));

    return { message: 'BatchClassSchedule found', batchModuleClass };
  } catch (error) {
    console.error('Error fetching batchClassSchedule by classId:', error);
    throw error;
  }
};

//GetBatchClassSchedule by BatchId
export const getBatchClassScheduleByBatchIdHandler = async (
  batchId: string
) => {
  try {
    console.log('Fetching Batch Class Schedule for Batch ID:', batchId);

    const options = {
      query: batchClassScheduleQueries.getBatchClassScheduleByBatchId,
      params: { batchId }
    };

    const [rows] = await bigquery.query(options);

    if (rows.length === 0) {
      return {
        message: 'Batch Class Schedule not found',
        batchClassSchedule: []
      };
    }

    // Transform result to match expected response structure
    const batchClassSchedule = rows.map((row) => ({
      id: row.batchClassScheduleId || null,
      batchId: row.batchId || null,
      moduleId: row.moduleId || null,
      classId: row.classId || null,
      startDate: row.startDate || null,
      startTime: row.startTime || null,
      endDate: row.endDate || null,
      endTime: row.endTime || null,
      meetingLink: row.meetingLink || null,
      assignmentEndDate: row.assignmentEndDate || null,
      module: {
        id: row.module?.id || null,
        moduleName: row.module?.moduleName || null,
        materialForModule: row.module?.materialForModule || null,
        sequence: row.module?.sequence || null
      },
      class: {
        id: row.class?.id || null,
        classTitle: row.class?.classTitle || null,
        classDescription: row.class?.classDescription || null,
        classRecordedLink: row.class?.classRecordedLink || null,
        materialForClass: row.class?.materialForClass || null,
        assignmentName: row.class?.assignmentName || null,
        assignmentFile: row.class?.assignmentFile || null,
        totalMarks: row.class?.totalMarks || null
      },
      batch: {
        id: row.batch?.id || null,
        batchName: row.batch?.batchName || null,
        startDate: row.batch?.startDate || null,
        endDate: row.batch?.endDate || null
      },
      trainers: row.trainers || [],
      assignments: row.assignments || []
    }));

    return {
      batchClassSchedule
    };
  } catch (error) {
    console.error('Error fetching Batch Class Schedule:', error);
    throw error;
  }
};

export const updateBatchClassScheduleHandler = async (
  req: any,
  id: string,
  updateBatchModule: Partial<BatchClassSchedule>
) => {
  const { user } = req;
  await createAssignmentTableIfNotExists();

  try {
    console.log(`Updating batchClassSchedule with ID: ${id}`);

    // Step 1: Fetch existing batch module schedule
    const [existingRows] = await bigquery.query({
      query: `
        SELECT * 
        FROM \`${process.env.PROJECT_ID}.${process.env.DATASET_ID}.${process.env.TABLE_BATCH_CLASS_SCHEDULE}\`
        WHERE id = @batchClassScheduleId
      `,
      params: { batchClassScheduleId: id }
    });

    if (existingRows.length === 0) {
      throw new Error('BatchClassSchedule not found');
    }

    const existingBatchClassSchedule = existingRows[0];

    // Step 2: Determine the correct assignmentEndDate
    let newAssignmentEndDate = existingBatchClassSchedule.assignmentEndDate;
    if (updateBatchModule.endDate) {
      if (!existingBatchClassSchedule.endDate) {
        // If creating a schedule, add +1 day
        const endDateObj = new Date(updateBatchModule.endDate);
        endDateObj.setDate(endDateObj.getDate() + 1);
        newAssignmentEndDate = endDateObj.toISOString().split('T')[0]; // Convert to YYYY-MM-DD string format
      } else {
        // If updating, keep the same date
        newAssignmentEndDate = updateBatchModule.endDate;
      }
    }

    // Step 3: Update batch module schedule details
    await bigquery.query({
      query: batchClassScheduleQueries.updateBatchClassSchedule,
      params: {
        batchClassScheduleId: id,
        moduleId:
          updateBatchModule.moduleId || existingBatchClassSchedule.moduleId,
        classId:
          updateBatchModule.classId || existingBatchClassSchedule.classId,
        startDate:
          updateBatchModule.startDate || existingBatchClassSchedule.startDate,
        startTime:
          updateBatchModule.startTime || existingBatchClassSchedule.startTime,
        endDate:
          updateBatchModule.endDate || existingBatchClassSchedule.endDate,
        endTime:
          updateBatchModule.endTime || existingBatchClassSchedule.endTime,
        meetingLink:
          updateBatchModule.meetingLink ||
          existingBatchClassSchedule.meetingLink,
        assignmentEndDate: newAssignmentEndDate, // Now properly formatted as a string
        updatedBy: user?.id,
        updatedAt: new Date().toISOString()
      }
    });

    // Step 4: Bulk update assignmentEndDate for all trainees in the batch
    if (updateBatchModule.endDate) {
      await bigquery.query({
        query: batchClassScheduleQueries.bulkUpdateAssignmentEndDate,
        params: {
          batchId: existingBatchClassSchedule.batchId,
          newAssignmentEndDate: newAssignmentEndDate
        }
      });

      console.log(
        `Bulk updated assignmentEndDate to ${newAssignmentEndDate} for batch ${existingBatchClassSchedule.batchId}`
      );
    }

    // Step 5: Handle trainee assignments
    if (
      updateBatchModule.traineeAssignments &&
      updateBatchModule.traineeAssignments.length > 0
    ) {
      console.log('Processing trainee assignments...');

      for (const assignment of updateBatchModule.traineeAssignments) {
        // Format the assignment end date if needed
        const assignmentEndDateStr =
          typeof assignment.assignmentEndDate === 'string'
            ? assignment.assignmentEndDate
            : new Date(assignment.assignmentEndDate)
                .toISOString()
                .split('T')[0];

        // Check if assignment already exists for this batch, trainee, and class
        const [existingAssignment] = await bigquery.query({
          query: `
            SELECT id 
            FROM \`${process.env.PROJECT_ID}.${process.env.DATASET_ID}.${process.env.TABLE_ASSIGNMENT}\`
            WHERE 
              batchId = @batchId AND 
              traineeId = @traineeId AND 
              classId = @classId
          `,
          params: {
            batchId: existingBatchClassSchedule.batchId,
            traineeId: assignment.traineeId,
            classId: existingBatchClassSchedule.classId
          }
        });

        if (existingAssignment.length === 0) {
          // Create new assignment record
          await bigquery.query({
            query: `
              INSERT INTO \`${process.env.PROJECT_ID}.${process.env.DATASET_ID}.${process.env.TABLE_ASSIGNMENT}\`
              (id, batchId, traineeId, classId, assignmentEndDate, createdAt, updatedAt)
              VALUES (@id, @batchId, @traineeId, @classId, @assignmentEndDate, @createdAt, @updatedAt)
            `,
            params: {
              id: uuidv4(),
              batchId: existingBatchClassSchedule.batchId,
              traineeId: assignment.traineeId,
              classId: existingBatchClassSchedule.classId,
              assignmentEndDate: assignmentEndDateStr,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            }
          });
          console.log(
            `Created new assignment record for trainee ${assignment.traineeId}`
          );
        } else {
          // Update existing assignment
          await bigquery.query({
            query: `
              UPDATE \`${process.env.PROJECT_ID}.${process.env.DATASET_ID}.${process.env.TABLE_ASSIGNMENT}\`
              SET 
                assignmentEndDate = @assignmentEndDate,
                updatedAt = @updatedAt
              WHERE 
                batchId = @batchId AND 
                traineeId = @traineeId AND 
                classId = @classId
            `,
            params: {
              batchId: existingBatchClassSchedule.batchId,
              traineeId: assignment.traineeId,
              classId: existingBatchClassSchedule.classId,
              assignmentEndDate: assignmentEndDateStr,
              updatedAt: new Date().toISOString()
            }
          });
          console.log(`Updated assignment for trainee ${assignment.traineeId}`);
        }
      }
    }

    // Step 6: Handle trainer assignments (only if trainerIds are provided)
    if (
      updateBatchModule.trainerIds &&
      updateBatchModule.trainerIds.length > 0
    ) {
      console.log('Updating trainer mappings...');

      // Delete existing batch-trainer relationships
      await bigquery.query({
        query: `
          DELETE FROM \`${process.env.PROJECT_ID}.${process.env.DATASET_ID}.${process.env.TABLE_BATCH_TRAINER}\`
          WHERE batchClassScheduleId = @batchClassScheduleId
        `,
        params: { batchClassScheduleId: id }
      });

      // Validate trainer IDs
      const [validTrainers] = await bigquery.query({
        query: `
          SELECT id 
          FROM \`${process.env.PROJECT_ID}.${process.env.DATASET_ID}.${process.env.TABLE_USER}\`
          WHERE id IN UNNEST(@trainerIds)
        `,
        params: { trainerIds: updateBatchModule.trainerIds }
      });

      const matchedTrainerIds = validTrainers.map((row: any) => row.id);
      if (matchedTrainerIds.length !== updateBatchModule.trainerIds.length) {
        throw new Error('Some trainerIds were not found.');
      }

      // Insert new trainers
      await bigquery.query({
        query: `
          INSERT INTO \`${process.env.PROJECT_ID}.${process.env.DATASET_ID}.${process.env.TABLE_BATCH_TRAINER}\`
          (batchClassScheduleId, trainerId, createdAt, updatedAt)
          SELECT 
            @batchClassScheduleId, 
            trainerId, 
            TIMESTAMP(@createdAt) AS createdAt, 
            TIMESTAMP(@updatedAt) AS updatedAt
          FROM UNNEST(@trainerIds) AS trainerId
        `,
        params: {
          batchClassScheduleId: id,
          trainerIds: matchedTrainerIds,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      });
    }

    // Step 7: Insert audit log
    await bigquery.query({
      query: auditQueries.insertAuditLog,
      params: {
        id: uuidv4(),
        entityType: 'BatchClassSchedule',
        entityId: id,
        action: 'UPDATE',
        previousData: JSON.stringify(existingBatchClassSchedule),
        newData: JSON.stringify({
          ...updateBatchModule,
          assignmentEndDate: newAssignmentEndDate
        }),
        performedBy: user?.id,
        createdAt: new Date().toISOString()
      },
      types: { previousData: 'STRING', newData: 'STRING' }
    });

    console.log(`BatchClassSchedule with ID ${id} updated successfully.`);

    return {
      id,
      ...updateBatchModule,
      assignmentEndDate: newAssignmentEndDate
    };
  } catch (error) {
    console.error(`Error updating batchClassSchedule ${id}:`, error);
    throw error;
  }
};

//DeleteBatchClassSchedule
export const deleteBatchClassScheduleHandler = async (id: string, req: any) => {
  if (!id) {
    throw new Error('BatchClassSchedule ID is required');
  }

  const exist = await checkBatchClassScheduleTableExists();
  if (!exist) {
    console.error('BatchClassSchedule table does not exist');
    throw new Error('BatchClassSchedule table does not exist');
  }

  const { user } = req;

  try {
    console.log(`Attempting to delete BatchClassSchedule with ID: ${id}`);

    // Fetch existing record before deletion (for audit logging)
    const [existingRecords] = await bigquery.query({
      query: `
        SELECT * FROM \`${process.env.PROJECT_ID}.${process.env.DATASET_ID}.${process.env.TABLE_BATCH_CLASS_SCHEDULE}\`
        WHERE id = @id
      `,
      params: { id }
    });

    if (!existingRecords.length) {
      throw new Error('BatchClassSchedule not found');
    }

    const existingData = existingRecords[0];

    await bigquery.query({
      query: `
        DELETE FROM \`${process.env.PROJECT_ID}.${process.env.DATASET_ID}.assignments\`
        WHERE batchId IN (
          SELECT batchId FROM \`${process.env.PROJECT_ID}.${process.env.DATASET_ID}.${process.env.TABLE_BATCH_CLASS_SCHEDULE}\`
          WHERE id = @id
        )
      `,
      params: { id }
    });

    // Step 1: Delete batch-trainers mappings first
    await bigquery.query({
      query: batchTrainerQueries.deleteBatchTrainer,
      params: { batchClassScheduleId: id } // ✅ Ensure parameter consistency
    });

    // Step 2: Delete the BatchClassSchedule
    await bigquery.query({
      query: batchClassScheduleQueries.deleteBatchClassSchedule,
      params: { id }
    });

    console.log(`BatchClassSchedule with ID ${id} deleted successfully.`);

    // Step 3: Insert Audit Log
    const auditLogParams = {
      id: uuidv4(),
      entityType: 'BatchClassSchedule',
      entityId: id,
      action: 'DELETE',
      previousData: JSON.stringify(existingData),
      newData: null,
      performedBy: user?.id || 'SYSTEM',
      createdAt: new Date().toISOString()
    };

    console.log('Audit Log Params:', auditLogParams);

    await bigquery.query({
      query: auditQueries.insertAuditLog,
      params: auditLogParams,
      types: {
        previousData: 'STRING',
        newData: 'STRING'
      }
    });

    console.log('Audit Log inserted successfully.');
  } catch (error) {
    console.error(`Error deleting BatchClassSchedule with ID ${id}:`, error);
    throw error;
  }
};
