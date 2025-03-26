"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.updateBatchValidator = exports.deleteBatchValidator = exports.createBatchValidator = void 0;
const createBatchValidator = exports.createBatchValidator = {
  batchName: {
    in: 'body',
    exists: {
      errorMessage: 'Batch name is required'
    },
    isString: {
      errorMessage: 'Batch name must be a string'
    },
    isLength: {
      options: {
        max: 255
      },
      errorMessage: 'Batch name cannot exceed 255 characters'
    }
  },
  courseId: {
    in: 'body',
    exists: {
      errorMessage: 'Course ID is required'
    },
    isString: {
      errorMessage: 'Course ID must be an string'
    }
  },
  traineeIds: {
    in: 'body',
    optional: true,
    isArray: {
      errorMessage: 'Trainee IDs must be an array'
    },
    custom: {
      options: traineeIds => {
        if (traineeIds && traineeIds.some(id => typeof id !== 'string')) {
          throw new Error('Each trainee ID must be a string');
        }
        return true;
      }
    }
  },
  startDate: {
    in: 'body',
    exists: {
      errorMessage: 'Start date is required'
    },
    isISO8601: {
      errorMessage: 'Start date must be a valid date in ISO8601 format'
    }
  },
  endDate: {
    in: 'body',
    exists: {
      errorMessage: 'End date is required'
    },
    isISO8601: {
      errorMessage: 'End date must be a valid date in ISO8601 format'
    }
  }
};
const updateBatchValidator = exports.updateBatchValidator = {
  id: {
    in: 'params',
    exists: {
      errorMessage: 'Batch ID is required'
    },
    isString: {
      errorMessage: 'Batch ID must be an string'
    }
  },
  batchName: {
    in: 'body',
    optional: true,
    isString: {
      errorMessage: 'Batch name must be a string'
    },
    isLength: {
      options: {
        max: 255
      },
      errorMessage: 'Batch name cannot exceed 255 characters'
    }
  },
  courseId: {
    in: 'body',
    optional: true,
    isString: {
      errorMessage: 'Course ID must be an string'
    }
  },
  traineeIds: {
    in: 'body',
    optional: true,
    isArray: {
      errorMessage: 'Trainee IDs must be an array'
    },
    custom: {
      options: traineeIds => {
        if (traineeIds && traineeIds.some(id => typeof id !== 'string')) {
          throw new Error('Each trainee ID must be a string');
        }
        return true;
      }
    }
  },
  startDate: {
    in: 'body',
    optional: true,
    isISO8601: {
      errorMessage: 'Start date must be a valid date in ISO8601 format'
    }
  },
  endDate: {
    in: 'body',
    optional: true,
    isISO8601: {
      errorMessage: 'End date must be a valid date in ISO8601 format'
    }
  }
};
const deleteBatchValidator = exports.deleteBatchValidator = {
  id: {
    in: 'params',
    exists: {
      errorMessage: 'Batch ID is required'
    },
    isString: {
      errorMessage: 'Batch ID must be an string'
    }
  }
};
//# sourceMappingURL=batch.validator.js.map