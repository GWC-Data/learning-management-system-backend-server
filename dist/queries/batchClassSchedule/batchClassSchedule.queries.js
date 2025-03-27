"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.batchClassScheduleQueries = void 0;
const batchClassScheduleQueries = exports.batchClassScheduleQueries = {
  createBatchClassSchedule: `
        INSERT INTO \`${process.env.PROJECT_ID}.${process.env.DATASET_ID}.${process.env.TABLE_BATCH_CLASS_SCHEDULE}\`
         (id, batchId, moduleId, classId, startDate, startTime, endDate, endTime, assignmentEndDate, meetingLink, createdBy, createdAt)
    VALUES (@id, @batchId, @moduleId, @classId, @startDate, @startTime, @endDate, @endTime, @assignmentEndDate, @meetingLink, @createdBy, @createdAt)
`,
  getBatchClassScheduleDetails: `
 SELECT 
    bm.id AS batchClassScheduleId,
    bm.batchId AS batchId,
    bm.moduleId AS moduleId,
    bm.classId AS classId,
    bm.startDate AS startDate,
    bm.startTime AS startTime,
    bm.endDate AS endDate,
    bm.endTime AS endTime,
    bm.meetingLink AS meetingLink,
    bm.assignmentEndDate AS assignmentEndDate,
    b.id AS batchId,
    b.batchName AS batchName,
    md.id AS moduleId,
    md.moduleName AS moduleName,
    c.id AS classId,
    c.classTitle AS classTitle,
    ARRAY_AGG(
      STRUCT(
        t.id AS trainerId,
        t.firstName AS firstName,
        t.lastName AS lastName
      )
    ) AS trainers,
    (
      SELECT ARRAY_AGG(STRUCT(
          ass.id AS assignmentId,
          ass.batchId AS assignmentBatchId,
          ass.traineeId AS assignmentTraineeId,
          u.firstName AS traineeFirstName,
          u.lastName AS traineeLastName,
          ass.assignmentEndDate AS assignmentEndDate
      ))
    FROM \`${process.env.PROJECT_ID}.${process.env.DATASET_ID}.${process.env.TABLE_ASSIGNMENT}\` ass
      LEFT JOIN \`${process.env.PROJECT_ID}.${process.env.DATASET_ID}.${process.env.TABLE_USER}\` u 
        ON ass.traineeId = u.id
      WHERE ass.batchId = bm.batchId
    ) AS assignments
FROM \`${process.env.PROJECT_ID}.${process.env.DATASET_ID}.${process.env.TABLE_BATCH_CLASS_SCHEDULE}\` bm
LEFT JOIN \`${process.env.PROJECT_ID}.${process.env.DATASET_ID}.${process.env.TABLE_BATCH_TRAINER}\` bt 
  ON bm.id = bt.batchClassScheduleId
LEFT JOIN \`${process.env.PROJECT_ID}.${process.env.DATASET_ID}.${process.env.TABLE_USER}\` t 
  ON bt.trainerId = t.id
LEFT JOIN \`${process.env.PROJECT_ID}.${process.env.DATASET_ID}.${process.env.TABLE_BATCH}\` b
  ON bm.batchId = b.id
LEFT JOIN \`${process.env.PROJECT_ID}.${process.env.DATASET_ID}.${process.env.TABLE_MODULE}\` md
  ON bm.moduleId = md.id
LEFT JOIN \`${process.env.PROJECT_ID}.${process.env.DATASET_ID}.${process.env.TABLE_CLASS}\` c
  ON bm.classId = c.id
    WHERE bm.id = @batchClassScheduleId
    GROUP BY bm.id, bm.batchId, bm.moduleId, bm.classId, bm.startDate, bm.startTime, bm.endDate, bm.endTime, bm.meetingLink, bm.assignmentEndDate, 
             b.id, b.batchName, md.id, md.moduleName, c.id, c.classTitle`,
  getAllBatchClassSchedules: `
  SELECT 
    bm.id AS batchClassScheduleId,
    bm.batchId AS batchId,
    bm.moduleId AS moduleId,
    bm.classId AS classId,
    bm.startDate AS startDate,
    bm.startTime AS startTime,
    bm.endDate AS endDate,
    bm.endTime AS endTime,
    bm.meetingLink AS meetingLink,
    bm.assignmentEndDate AS assignmentEndDate,
    b.id AS batchId,
    b.batchName AS batchName,
    md.id AS moduleId,
    md.moduleName AS moduleName,
    c.id AS classId,
    c.classTitle AS classTitle,
    ARRAY_AGG(
      STRUCT(
        t.id AS trainerId,
        t.firstName AS firstName,
        t.lastName AS lastName
      )
    ) AS trainers,
    (
      SELECT ARRAY_AGG(STRUCT(
          ass.id AS assignmentId,
          ass.batchId AS assignmentBatchId,
          ass.traineeId AS assignmentTraineeId,
          u.firstName AS traineeFirstName,
          u.lastName AS traineeLastName,
          ass.assignmentEndDate AS assignmentEndDate
      ))
      FROM \`${process.env.PROJECT_ID}.${process.env.DATASET_ID}.${process.env.TABLE_ASSIGNMENT}\` ass
      LEFT JOIN \`${process.env.PROJECT_ID}.${process.env.DATASET_ID}.${process.env.TABLE_USER}\` u 
        ON ass.traineeId = u.id
      WHERE ass.batchId = bm.batchId
    ) AS assignments
FROM \`${process.env.PROJECT_ID}.${process.env.DATASET_ID}.${process.env.TABLE_BATCH_CLASS_SCHEDULE}\` bm
LEFT JOIN \`${process.env.PROJECT_ID}.${process.env.DATASET_ID}.${process.env.TABLE_BATCH_TRAINER}\` bt 
  ON bm.id = bt.batchClassScheduleId
LEFT JOIN \`${process.env.PROJECT_ID}.${process.env.DATASET_ID}.${process.env.TABLE_USER}\` t 
  ON bt.trainerId = t.id
LEFT JOIN \`${process.env.PROJECT_ID}.${process.env.DATASET_ID}.${process.env.TABLE_BATCH}\` b
  ON bm.batchId = b.id
LEFT JOIN \`${process.env.PROJECT_ID}.${process.env.DATASET_ID}.${process.env.TABLE_MODULE}\` md
  ON bm.moduleId = md.id
LEFT JOIN \`${process.env.PROJECT_ID}.${process.env.DATASET_ID}.${process.env.TABLE_CLASS}\` c
  ON bm.classId = c.id
GROUP BY bm.id, bm.batchId, bm.moduleId, bm.classId, bm.startDate, bm.startTime, bm.endDate, bm.endTime, bm.meetingLink, bm.assignmentEndDate, 
         b.id, b.batchName, md.id, md.moduleName, c.id, c.classTitle
ORDER BY bm.id;
`,
  getBatchClassScheduleByBatchId: `
SELECT 
bms.id AS batchClassScheduleId,
bms.batchId, 
bms.moduleId,
bms.classId,
CAST(bms.startDate AS STRING) AS startDate,
CAST(bms.startTime AS STRING) AS startTime,
CAST(bms.endDate AS STRING) AS endDate,
CAST(bms.endTime AS STRING) AS endTime,
bms.meetingLink,
bms.assignmentEndDate,
CAST(bms.createdAt AS STRING) AS createdAt,
CAST(bms.updatedAt AS STRING) AS updatedAt,

-- Fetching module details
STRUCT(
    COALESCE(m.id, '') AS id,
    COALESCE(m.moduleName, '') AS moduleName,
    COALESCE(m.materialForModule, '') AS materialForModule
) AS module,

-- Fetching batch details
STRUCT(
    b.id AS id,
    b.batchName AS batchName,
    CAST(b.startDate AS STRING) AS startDate,
    CAST(b.endDate AS STRING) AS endDate
) AS batch,

-- Fetching class details
STRUCT(
    COALESCE(c.id, '') AS id,
    COALESCE(c.classTitle, '') AS classTitle
) AS class,

-- Fetching trainers with a subquery
(
    SELECT ARRAY_AGG(STRUCT(
        u.id AS id,
        u.firstName AS firstName,
        u.lastName AS lastName,
        STRUCT(bt.batchClassScheduleId AS batchClassScheduleId, bt.trainerId AS trainerId) AS BatchTrainer
    ))
    FROM \`${process.env.PROJECT_ID}.${process.env.DATASET_ID}.${process.env.TABLE_BATCH_TRAINER}\` bt
    LEFT JOIN \`${process.env.PROJECT_ID}.${process.env.DATASET_ID}.${process.env.TABLE_USER}\` u 
        ON bt.trainerId = u.id
    WHERE bt.batchClassScheduleId = bms.id
) AS trainers,

-- Fetching assignments with a subquery
(
    SELECT ARRAY_AGG(STRUCT(
        ass.id AS assignmentId,
        ass.batchId AS assignmentBatchId,
        ass.traineeId AS assignmentTraineeId,
        u.firstName AS traineeFirstName,
        u.lastName AS traineeLastName,
        ass.assignmentEndDate AS assignmentEndDate
    ))
    FROM \`${process.env.PROJECT_ID}.${process.env.DATASET_ID}.${process.env.TABLE_ASSIGNMENT}\` ass
    LEFT JOIN \`${process.env.PROJECT_ID}.${process.env.DATASET_ID}.${process.env.TABLE_USER}\` u
        ON ass.traineeId = u.id
    WHERE ass.batchId = @batchId
) AS assignments
FROM \`${process.env.PROJECT_ID}.${process.env.DATASET_ID}.${process.env.TABLE_BATCH_CLASS_SCHEDULE}\` bms
LEFT JOIN \`${process.env.PROJECT_ID}.${process.env.DATASET_ID}.${process.env.TABLE_MODULE}\` m 
  ON bms.moduleId = m.id
LEFT JOIN \`${process.env.PROJECT_ID}.${process.env.DATASET_ID}.${process.env.TABLE_BATCH}\` b 
  ON bms.batchId = b.id
LEFT JOIN \`${process.env.PROJECT_ID}.${process.env.DATASET_ID}.${process.env.TABLE_CLASS}\` c 
  ON bms.classId = c.id
WHERE bms.batchId = @batchId
GROUP BY 
  bms.id, bms.batchId, bms.moduleId, bms.classId, bms.startDate, bms.startTime, 
  bms.endDate, bms.endTime, bms.meetingLink, bms.assignmentEndDate, 
  bms.createdAt, bms.updatedAt, 
  m.id, m.moduleName, m.materialForModule, 
  b.id, b.batchName, b.startDate, b.endDate,
  c.id, c.classTitle
`,
  getBatchClassScheduleByClassId: `
 WITH UniqueTrainers AS (
    SELECT 
        batchClassScheduleId,
        ARRAY_AGG(STRUCT(
            u.id AS id,
            u.firstName AS firstName,
            u.lastName AS lastName,
            STRUCT(bt.batchClassScheduleId AS batchClassScheduleId, bt.trainerId AS trainerId) AS BatchTrainer
        ) ORDER BY u.id LIMIT 100) AS trainers
    FROM \`${process.env.PROJECT_ID}.${process.env.DATASET_ID}.${process.env.TABLE_BATCH_TRAINER}\` bt
    LEFT JOIN \`${process.env.PROJECT_ID}.${process.env.DATASET_ID}.${process.env.TABLE_USER}\` u 
        ON bt.trainerId = u.id
    GROUP BY batchClassScheduleId
),
UniqueAssignments AS (
    SELECT 
        batchId,
        classId,
        ARRAY_AGG(STRUCT(
            ass.id AS assignmentId,
            ass.batchId AS assignmentBatchId,
            ass.traineeId AS assignmentTraineeId,
            u.firstName AS traineeFirstName,
            u.lastName AS traineeLastName,
            ass.assignmentEndDate AS assignmentEndDate
        ) ORDER BY ass.id LIMIT 100) AS assignments
    FROM \`${process.env.PROJECT_ID}.${process.env.DATASET_ID}.${process.env.TABLE_ASSIGNMENT}\` ass
    LEFT JOIN \`${process.env.PROJECT_ID}.${process.env.DATASET_ID}.${process.env.TABLE_USER}\` u
        ON ass.traineeId = u.id
    GROUP BY batchId, classId
)
SELECT 
    bms.id AS batchClassScheduleId,
    bms.batchId, 
    bms.moduleId,
    bms.classId,
    CAST(bms.startDate AS STRING) AS startDate,
    CAST(bms.startTime AS STRING) AS startTime,
    CAST(bms.endDate AS STRING) AS endDate,
    CAST(bms.endTime AS STRING) AS endTime,
    bms.meetingLink,
    bms.assignmentEndDate,
    CAST(bms.createdAt AS STRING) AS createdAt,
    CAST(bms.updatedAt AS STRING) AS updatedAt,

    -- Fetching module details
    STRUCT(
        COALESCE(m.id, '') AS id,
        COALESCE(m.moduleName, '') AS moduleName,
        COALESCE(m.materialForModule, '') AS materialForModule
    ) AS module,

    -- Fetching batch details
    STRUCT(
        b.id AS id,
        b.batchName AS batchName,
        CAST(b.startDate AS STRING) AS startDate,
        CAST(b.endDate AS STRING) AS endDate
    ) AS batch,

    -- Fetching class details
    STRUCT(
        COALESCE(c.id, '') AS id,
        COALESCE(c.classTitle, '') AS classTitle
    ) AS class,

    -- Fetching trainers from CTE
    COALESCE(ut.trainers, []) AS trainers,

    -- Fetching assignments from CTE
    COALESCE(ua.assignments, []) AS assignments

FROM \`${process.env.PROJECT_ID}.${process.env.DATASET_ID}.${process.env.TABLE_BATCH_CLASS_SCHEDULE}\` bms
LEFT JOIN \`${process.env.PROJECT_ID}.${process.env.DATASET_ID}.${process.env.TABLE_MODULE}\` m 
    ON bms.moduleId = m.id
LEFT JOIN \`${process.env.PROJECT_ID}.${process.env.DATASET_ID}.${process.env.TABLE_BATCH}\` b 
    ON bms.batchId = b.id
LEFT JOIN \`${process.env.PROJECT_ID}.${process.env.DATASET_ID}.${process.env.TABLE_CLASS}\` c 
    ON bms.classId = c.id
LEFT JOIN UniqueTrainers ut
    ON bms.id = ut.batchClassScheduleId
LEFT JOIN UniqueAssignments ua
    ON bms.batchId = ua.batchId AND bms.classId = ua.classId
WHERE bms.classId = @classId
`,
  updateBatchClassSchedule: `
UPDATE \`${process.env.PROJECT_ID}.${process.env.DATASET_ID}.${process.env.TABLE_BATCH_CLASS_SCHEDULE}\`
    SET  moduleId = @moduleId, classId = @classId, startDate = @startDate, startTime = @startTime, endDate = @endDate, endTime = @endTime, meetingLink = @meetingLink, assignmentEndDate = @assignmentEndDate, 
    updatedBy = @updatedBy, updatedAt = @updatedAt
    WHERE id = @batchClassScheduleId`,
  bulkUpdateAssignmentEndDate: `
    UPDATE \`${process.env.PROJECT_ID}.${process.env.DATASET_ID}.${process.env.TABLE_ASSIGNMENT}\`
    SET assignmentEndDate = @newAssignmentEndDate
    WHERE batchId = @batchId
  `,
  updateTraineeAssignmentEndDate: `
    UPDATE \`${process.env.PROJECT_ID}.${process.env.DATASET_ID}.${process.env.TABLE_ASSIGNMENT}\`
    SET assignmentEndDate = @assignmentEndDate
    WHERE batchId = @batchId AND traineeId = @traineeId
  `,
  deleteBatchClassSchedule: `
 DELETE FROM \`${process.env.PROJECT_ID}.${process.env.DATASET_ID}.${process.env.TABLE_BATCH_CLASS_SCHEDULE}\`
    WHERE id = @id`
};
//# sourceMappingURL=batchClassSchedule.queries.js.map