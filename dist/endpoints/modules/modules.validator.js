"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.updateModuleValidator = exports.getModuleByIdValidator = exports.deleteModuleValidator = exports.createModuleValidator = void 0;
const createModuleValidator = exports.createModuleValidator = {
  courseId: {
    in: 'body',
    exists: {
      errorMessage: 'Course ID is required'
    },
    isString: {
      errorMessage: 'Course ID must be a string'
    }
  },
  moduleName: {
    in: 'body',
    optional: true,
    exists: {
      errorMessage: 'Module Name is required'
    },
    isString: {
      errorMessage: 'Module Name must be a string'
    }
  },
  moduleDescription: {
    in: 'body',
    optional: {
      options: {
        nullable: true
      }
    },
    isString: {
      errorMessage: 'Module Description must be a string'
    },
    isLength: {
      errorMessage: 'Module Description must be at least 10 characters long',
      options: {
        min: 10
      }
    }
  }
};
const updateModuleValidator = exports.updateModuleValidator = {
  id: {
    in: 'params',
    exists: {
      errorMessage: 'id must be required'
    },
    isString: {
      errorMessage: 'id must be string'
    }
  },
  moduleName: {
    in: 'body',
    optional: true,
    isLength: {
      errorMessage: 'Module Name must be at least 3 characters long',
      options: {
        min: 3
      } // Fixed from min: 255
    }
  },
  moduleDescription: {
    in: 'body',
    optional: {
      options: {
        nullable: true
      }
    },
    isLength: {
      errorMessage: 'Module Description must be at least 10 characters long',
      options: {
        min: 10
      }
    }
  },
  sequence: {
    in: 'body',
    optional: {
      options: {
        nullable: true
      }
    },
    isInt: {
      errorMessage: 'sequence must be integer'
    }
  }
};
const getModuleByIdValidator = exports.getModuleByIdValidator = {
  id: {
    in: 'params',
    exists: {
      errorMessage: 'Module ID is required'
    },
    isString: {
      errorMessage: 'Module ID must be an string'
    }
  }
};
const deleteModuleValidator = exports.deleteModuleValidator = {
  id: {
    in: 'params',
    exists: {
      errorMessage: 'Module ID is required'
    },
    isString: {
      errorMessage: 'Module ID must be an string'
    }
  }
};
//# sourceMappingURL=modules.validator.js.map