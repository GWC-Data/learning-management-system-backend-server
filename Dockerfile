# Stage 1: Build environment
FROM node:18-alpine as builder

WORKDIR /usr/src/app

# 1. Install system dependencies
RUN apk add --no-cache python3 make g++ git

# 2. Copy package files first for better caching
COPY package*.json ./  
COPY tsconfig*.json ./  

# 3. Install all dependencies including types
RUN npm install --include=dev
RUN npm install date-fns @types/date-fns --save-dev

# 4. Copy all source files (including config.js)
COPY . .

# 5. Run build
RUN npm run build

# Stage 2: Production image
FROM node:18-alpine

WORKDIR /usr/src/app

# Install production dependencies only
ENV NODE_ENV=production

# Copy necessary files from builder
COPY --from=builder /usr/src/app/package*.json ./  
COPY --from=builder /usr/src/app/node_modules ./node_modules  
COPY --from=builder /usr/src/app/dist ./dist  

# ✅ Explicitly copy env/config.js
COPY --from=builder /usr/src/app/env/config.js ./env/config.js  

COPY keys/jwks.json ./keys/jwks.json

# Required environment variables
# Required environment variables
ENV PORT=8080 \
    SECONDARY_PORT=8081 \
    ACCESS_TOKEN_AUDIENCE=domo \
    ACCESS_TOKEN_ISSUER=gwc \
    ADMIN_API_ACCESS_TOKEN_AUDIENCE=domo \
    ADMIN_ACCESS_TOKEN_ISSUER=authservice \
    ADMIN_API_ECDSA_PUBLIC_KEY=Test \
    DB_MIGRATION=false \
    DEBUG="" \
    PROJECT_ID=teqcertify \
    DATASET_ID=lms \
    # Database tables
    TABLE_AUDIT=audit \
    TABLE_USER=users \
    TABLE_PERMISSION=permissions \
    TABLE_ROLE=roles \
    TABLE_ROLE_PERMISSION=rolePermissions \
    TABLE_COURSE=course \
    TABLE_COURSE_CATEGORY=courseCategory \
    TABLE_COMPANY_INFO=companyinfo \
    TABLE_BATCH=batches \
    TABLE_BATCH_TRAINEE=batchTrainees \
    TABLE_BATCH_CLASS_SCHEDULE=batchClassSchedules \
    TABLE_BATCH_TRAINER=batchTrainers \
    TABLE_MODULE=modules \
    TABLE_JOBBOARD=jobboard \
    TABLE_CLASS=classes \
    TABLE_USERSAVEDJOBBOARD=userSavedJobBoard \
    TABLE_COURSE_ASSIGNMENT=courseAssignments \
    TABLE_ATTENDANCE_FILE=attendanceFiles \
    TABLE_ATTENDANCE=attendance \
    TABLE_ASSIGNMENTCOMPLETION=assignmentCompletions \
    TABLE_LINKEDIN_JOBS=jobTables \
    TABLE_ASSIGNMENT=assignments \
    # Bucket folders
    BUCKET_NAME=profile-pictures-wordpress \
    USERPROFILEPIC_BUCKET_FOLDER=users \
    COURSECATEGORY_BUCKET_FOLDER=courseCategory \
    COURSE_BUCKET_FOLDER=course \
    MODULE_BUCKET_FOLDER=module \
    CLASS_BUCKET_FOLDER=class \
    COURSE_ASSIGNMENT_BUCKET_FOLDER=courseAssignmentFile \
    ATTENDANCE_FILE_BUCKET_FOLDER=attendanceFile \
    ASSIGNMENTCOMPLETION_BUCKET_FOLDER=assignmentCompletion \
    LINKEDIN_JOBS_IMAGE_FOLDER=linkedInJobImage

EXPOSE 8080

# Use npm run start with proper signal handling
CMD ["npm", "run", "start"]