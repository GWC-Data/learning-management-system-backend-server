"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.updateBatchClassScheduleValidator = exports.deleteBatchClassScheduleValidator = exports.batchClassScheduleValidator = void 0;
const batchClassScheduleValidator = exports.batchClassScheduleValidator = {
  batchId: {
    in: 'body',
    exists: {
      errorMessage: 'Batch ID is required'
    },
    isString: {
      errorMessage: 'Batch ID must be an string'
    }
  },
  moduleId: {
    in: 'body',
    exists: {
      errorMessage: 'Module ID is required'
    },
    isString: {
      errorMessage: 'Module ID must be an string'
    }
  },
  trainerIds: {
    in: 'body',
    optional: true,
    isArray: {
      errorMessage: 'Trainer IDs must be an array'
    },
    custom: {
      options: trainerIds => {
        if (trainerIds && trainerIds.some(id => typeof id !== 'string')) {
          throw new Error('Each trainer ID must be a string');
        }
        return true;
      }
    }
  },
  startDate: {
    in: 'body',
    optional: true,
    exists: {
      errorMessage: 'StartDate is required'
    },
    isDate: {
      errorMessage: 'StartDate must be a date'
    }
  },
  endDate: {
    in: 'body',
    optional: true,
    exists: {
      errorMessage: 'EndDate is required'
    },
    isDate: {
      errorMessage: 'EndDate must be a valid date'
    }
  },
  startTime: {
    in: 'body',
    optional: true,
    exists: {
      errorMessage: 'StartTime is required'
    }
  },
  endTime: {
    in: 'body',
    optional: true,
    exists: {
      errorMessage: 'EndTime is required'
    }
  },
  meetingLink: {
    in: 'body',
    exists: {
      errorMessage: 'MeetingLink is required'
    },
    isString: {
      errorMessage: 'MeetingLink must be a string'
    }
  }
};
const updateBatchClassScheduleValidator = exports.updateBatchClassScheduleValidator = {
  id: {
    in: 'params',
    exists: {
      errorMessage: 'Batch Module Schedule ID is required'
    },
    isString: {
      errorMessage: 'Batch Module Schedule ID must be an string'
    }
  },
  batchId: {
    in: 'body',
    optional: true,
    isString: {
      errorMessage: 'Batch ID must be an string'
    }
  },
  moduleId: {
    in: 'body',
    optional: true,
    isString: {
      errorMessage: 'Module ID must be an string'
    }
  },
  trainerIds: {
    in: 'body',
    optional: true,
    isArray: {
      errorMessage: 'Trainer IDs must be an array'
    },
    custom: {
      options: trainerIds => {
        if (trainerIds && trainerIds.some(id => typeof id !== 'string')) {
          throw new Error('Each trainer ID must be a string');
        }
        return true;
      }
    }
  },
  startDate: {
    in: 'body',
    optional: true,
    exists: {
      errorMessage: 'StartDate is required'
    },
    isDate: {
      errorMessage: 'StartDate must be a date'
    }
  },
  endDate: {
    in: 'body',
    optional: true,
    exists: {
      errorMessage: 'EndDate is required'
    },
    isDate: {
      errorMessage: 'EndDate must be a valid date'
    }
  },
  startTime: {
    in: 'body',
    optional: true,
    exists: {
      errorMessage: 'StartTime is required'
    }
  },
  endTime: {
    in: 'body',
    optional: true,
    exists: {
      errorMessage: 'EndTime is required'
    }
  },
  meetingLink: {
    in: 'body',
    optional: true,
    exists: {
      errorMessage: 'MeetingLink is required'
    },
    isString: {
      errorMessage: 'MeetingLink must be a string'
    }
  }
};
const deleteBatchClassScheduleValidator = exports.deleteBatchClassScheduleValidator = {
  id: {
    in: 'params',
    exists: {
      errorMessage: 'Batch Module Schedule ID is required'
    },
    isString: {
      errorMessage: 'Batch Module Schedule ID must be an string'
    }
  }
};
//# sourceMappingURL=batchClassSchedules.validator.js.map