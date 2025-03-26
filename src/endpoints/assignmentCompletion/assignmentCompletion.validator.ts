import { Schema } from 'express-validator';

// Validator for creating an assignment completion
export const assignmentCompletionValidator: Schema = {
    classId: {
        in: 'body',
        optional: true,
        exists: {
            errorMessage: 'Course Assignment ID is required'
        },
        isString: {
            errorMessage: 'Course Assignment ID must be an String'
        }
    },
    traineeId: {
        in: 'body',
        optional: true,
        exists: {
            errorMessage: 'Trainee ID is required'
        },
        isString: {
            errorMessage: 'Trainee ID must be an String'
        }
    },
    courseAssignmentAnswerFile: {
        in: 'body',
        optional: true,
        exists: {
            errorMessage: 'courseAssignmentAnswerFile is required'
      }
    }
};

// Validator for updating an assignment completion
export const updateAssignmentCompletionValidator: Schema = {
    id: {
        in: 'params',
        exists: {
            errorMessage: 'Assignment Completion ID is required'
        },
        isString: {
            errorMessage: 'Assignment Completion ID must be an String'
        }
    },
    classId: {
        in: 'body',
        optional: true,
        exists: {
            errorMessage: 'Course Assignment ID is required'
        },
        isString: {
            errorMessage: 'Course Assignment ID must be an String'
        }
    },
    traineeId: {
        in: 'body',
        optional: true,
        exists: {
            errorMessage: 'Trainee ID is required'
        },
        isString: {
            errorMessage: 'Trainee ID must be an String'
        }
    },
    courseAssignmentAnswerFile: {
        in: 'body',
        optional: true,
        exists: {
            errorMessage: 'Assignment Answer File is required'
        },
        isString: {
            errorMessage: 'Assignment Answer File must be a string'
        }
    }
};

// Validator for deleting an assignment completion
export const deleteAssignmentCompletionValidator: Schema = {
    id: {
        in: 'params',
        exists: {
            errorMessage: 'Assignment Completion ID is required'
        },
        isString: {
            errorMessage: 'Assignment Completion ID must be an String'
        }
    }
};
