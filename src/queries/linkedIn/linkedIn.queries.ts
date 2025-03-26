export const linkedInQueries = {
  //manual job creation
  createLinkedInJob: `
    INSERT INTO \`${process.env.PROJECT_ID}.${process.env.DATASET_ID}.${process.env.TABLE_LINKEDIN_JOBS}\`
  (id, title, company, link, carrierPathLink, location, datePosted, entityURN, imgSrc, jobDescription, jobTrigger, createdAt) VALUES 
  (@id, @title, @company, @link, @carrierPathLink, @location, @datePosted, @entityURN, @imgSrc, @jobDescription, @jobTrigger, @createdAt)`,

  //automation jobs queries
  insertLinkedInJob: `
  INSERT INTO \`${process.env.PROJECT_ID}.${process.env.DATASET_ID}.${process.env.TABLE_LINKEDIN_JOBS}\`
    (id, title, company, link, carrierPathLink, location, datePosted, entityURN, imgSrc, jobDescription, jobTrigger, createdAt)
  VALUES (@id, @title, @company, @link, @carrierPathLink, @location, @datePosted, @entityURN, @imgSrc, @jobDescription, @jobTrigger, @createdAt);
`,

  // insertLinkedInJob: `
  //   MERGE INTO \`${process.env.PROJECT_ID}.${process.env.DATASET_ID}.${process.env.TABLE_LINKEDIN_JOBS}\` AS target
  //   USING (SELECT @id AS id, @title AS title, @company AS company, @link AS link,
  //                 @carrierPathLink AS carrierPathLink, @location AS location, @datePosted AS datePosted,
  //                 @entityURN AS entityURN, @imgSrc AS imgSrc, @jobDescription AS jobDescription) AS source
  //   ON target.entityURN = source.entityURN
  //   WHEN NOT MATCHED THEN
  //     INSERT (id, title, company, link, carrierPathLink, location, datePosted, entityURN, imgSrc, jobDescription)
  //     VALUES (source.id, source.title, source.company, source.link, source.carrierPathLink, source.location, source.datePosted,
  //             source.entityURN, source.imgSrc, source.jobDescription); `,

  getAllLinkedInJobs: `
  SELECT
    id AS jobId,
    title AS jobTitle,
    company AS companyName,
    link AS jobLink,
    carrierPathLink AS jobLink1,
    location AS jobLocation,
    datePosted AS datePosted,
    entityURN AS entityURN,
    imgSrc AS companyLogo,
    jobDescription AS jobDescription,
    createdAt AS createdAt
  FROM \`${process.env.PROJECT_ID}.${process.env.DATASET_ID}.${process.env.TABLE_LINKEDIN_JOBS}\`;
`,

  updateJobBoard: `
  UPDATE \`${process.env.PROJECT_ID}.${process.env.DATASET_ID}.${process.env.TABLE_LINKEDIN_JOBS}\`
      SET carrierPathLink = @carrierPathLink, imgSrc = @imgSrc, updatedBy = @updatedBy
      WHERE id = @jobId`,

  deleteJobBoard: `
  DELETE FROM \`${process.env.PROJECT_ID}.${process.env.DATASET_ID}.${process.env.TABLE_LINKEDIN_JOBS}\`
  WHERE id = @jobId;`,

  deleteAllAutomationJobs:`
  DELETE FROM  \`${process.env.PROJECT_ID}.${process.env.DATASET_ID}.${process.env.TABLE_LINKEDIN_JOBS}\`
  WHERE jobTrigger = 'Automation';`,

   deleteOldAutomationJobs:`
   DELETE FROM \`${process.env.PROJECT_ID}.${process.env.DATASET_ID}.${process.env.TABLE_LINKEDIN_JOBS}\`
        WHERE jobTrigger = 'Automation' 
        AND PARSE_DATE('%Y-%m-%d', datePosted) < DATE_SUB(CURRENT_DATE(), INTERVAL 1 MONTH);`

};
