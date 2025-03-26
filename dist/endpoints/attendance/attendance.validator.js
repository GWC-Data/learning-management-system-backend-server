"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.updateAttendanceValidator = exports.updateAttendanceFileValidator = exports.getUserByIdValidator = exports.getAttendanceFileValidator = exports.deleteAttendanceValidator = exports.deleteAttendanceFileValidator = exports.createAttendanceValidator = exports.createAttendanceFileValidator = void 0;
//AttendanceFileTable validator
const createAttendanceFileValidator = exports.createAttendanceFileValidator = {
  teamsAttendanceFile: {
    in: 'body',
    optional: false,
    exists: {
      errorMessage: 'teamsAttendanceFile is required'
    },
    isString: {
      errorMessage: 'teamsAttendanceFile must be a string'
    }
  }
};
const getAttendanceFileValidator = exports.getAttendanceFileValidator = {
  id: {
    in: 'params',
    exists: {
      errorMessage: 'id is required'
    },
    isInt: {
      errorMessage: 'id must be a integer'
    }
  }
};
const updateAttendanceFileValidator = exports.updateAttendanceFileValidator = {
  id: {
    in: 'params',
    exists: {
      errorMessage: 'id is required'
    },
    isInt: {
      errorMessage: 'id must be a integer'
    }
  },
  teamsAttendanceFile: {
    in: 'body',
    exists: {
      errorMessage: 'teamsAttendanceFile is required'
    },
    isString: {
      errorMessage: 'teamsAttendanceFile must be a string'
    }
  }
};
const deleteAttendanceFileValidator = exports.deleteAttendanceFileValidator = {
  id: {
    in: 'params',
    exists: {
      errorMessage: 'id is required'
    },
    isString: {
      errorMessage: 'id must be a String'
    }
  }
};

//AttendanceTable Validator
const createAttendanceValidator = exports.createAttendanceValidator = {
  batchId: {
    in: 'body',
    exists: {
      errorMessage: 'batchId is require'
    },
    isInt: {
      errorMessage: 'batchId must be an Integer'
    }
  },
  moduleId: {
    in: 'body',
    exists: {
      errorMessage: 'moduleId is required'
    },
    isInt: {
      errorMessage: 'moduleId must be an Integer'
    }
  },
  courseId: {
    in: 'body',
    exists: {
      errorMessage: 'CourseId is required'
    },
    isInt: {
      errorMessage: 'CourseId must be a integer'
    }
  },
  classId: {
    in: 'body',
    exists: {
      errorMessage: 'classId is required'
    },
    isInt: {
      errorMessage: 'classId must be integer'
    }
  },
  excelFile: {
    in: 'body',
    optional: true,
    exists: {
      errorMessage: 'excelFile is Required'
    },
    isString: {
      errorMessage: 'excelFile must be string'
    }
  }
};
const getUserByIdValidator = exports.getUserByIdValidator = {
  userId: {
    in: 'params',
    exists: {
      errorMessage: 'userId is required'
    },
    isInt: {
      errorMessage: 'userId must be integer'
    }
  },
  batchId: {
    in: 'params',
    exists: {
      errorMessage: 'batchId is require'
    },
    isInt: {
      errorMessage: 'batchId must be an Integer'
    }
  },
  courseId: {
    in: 'params',
    exists: {
      errorMessage: 'CourseId is required'
    },
    isInt: {
      errorMessage: 'CourseId must be a integer'
    }
  }
};
const updateAttendanceValidator = exports.updateAttendanceValidator = {
  id: {
    in: 'params',
    exists: {
      errorMessage: 'id is required'
    },
    isInt: {
      errorMessage: 'id must be an Integer'
    }
  },
  batchId: {
    in: 'body',
    exists: {
      errorMessage: 'batchId is required'
    },
    isInt: {
      errorMessage: 'batchId must be an Integer'
    }
  },
  courseId: {
    in: 'body',
    exists: {
      errorMessage: 'CourseId is required'
    },
    isInt: {
      errorMessage: 'CourseId must be a integer'
    }
  },
  moduleId: {
    in: 'body',
    exists: {
      errorMessage: 'moduleId is required'
    },
    isInt: {
      errorMessage: 'moduleId must be an Integer'
    }
  },
  classId: {
    in: 'body',
    exists: {
      errorMessage: 'classId is required'
    },
    isInt: {
      errorMessage: 'classId must be integer'
    }
  },
  excelFile: {
    in: 'body',
    optional: true,
    exists: {
      errorMessage: 'excelFile is Required'
    },
    isString: {
      errorMessage: 'excelFile must be string'
    }
  }
};
const deleteAttendanceValidator = exports.deleteAttendanceValidator = {
  id: {
    in: 'params',
    exists: {
      errorMessage: 'Id is required'
    },
    isString: {
      errorMessage: 'Id must be a String'
    }
  }
};
//# sourceMappingURL=attendance.validator.js.map