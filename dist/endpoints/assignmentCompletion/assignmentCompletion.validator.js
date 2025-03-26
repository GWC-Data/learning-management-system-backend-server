"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.updateAssignmentCompletionValidator = exports.deleteAssignmentCompletionValidator = exports.assignmentCompletionValidator = void 0;
// Validator for creating an assignment completion
const assignmentCompletionValidator = exports.assignmentCompletionValidator = {
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
const updateAssignmentCompletionValidator = exports.updateAssignmentCompletionValidator = {
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
const deleteAssignmentCompletionValidator = exports.deleteAssignmentCompletionValidator = {
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
//# sourceMappingURL=assignmentCompletion.validator.js.map