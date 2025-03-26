"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.updateCourseCategoryValidator = exports.getCourseCategoryByIdValidator = exports.deleteCourseCategoryValidator = exports.createCourseCategoryValidator = void 0;
const createCourseCategoryValidator = exports.createCourseCategoryValidator = {
  coursecategoryName: {
    in: "body",
    optional: true,
    exists: {
      errorMessage: "Course Category name is required"
    },
    isString: {
      errorMessage: "Course Category name must be a string"
    },
    isLength: {
      options: {
        max: 255
      },
      errorMessage: "Course Category name cannot exceed 255 characters"
    }
  },
  description: {
    in: "body",
    optional: true,
    isString: {
      errorMessage: "Description must be a string"
    },
    isLength: {
      options: {
        max: 500
      },
      errorMessage: "Description cannot exceed 500 characters"
    }
  },
  courseCategoryImg: {
    in: "body",
    optional: true,
    isString: {
      errorMessage: "Course Category image must be a string (URL)"
    },
    isURL: {
      errorMessage: "Invalid image URL"
    }
  }
};
const updateCourseCategoryValidator = exports.updateCourseCategoryValidator = {
  id: {
    in: "params",
    exists: {
      errorMessage: "Course Category ID is required"
    },
    isString: {
      errorMessage: "Course Category ID must be a string"
    }
  },
  coursecategoryName: {
    in: "body",
    optional: true,
    isString: {
      errorMessage: "Course Category name must be a string"
    },
    isLength: {
      options: {
        max: 255
      },
      errorMessage: "Course Category name cannot exceed 255 characters"
    }
  },
  description: {
    in: "body",
    optional: true,
    isString: {
      errorMessage: "Description must be a string"
    },
    isLength: {
      options: {
        max: 500
      },
      errorMessage: "Description cannot exceed 500 characters"
    }
  },
  courseCategoryImg: {
    in: "body",
    optional: true,
    isString: {
      errorMessage: "Course Category image must be a string (URL)"
    },
    isURL: {
      errorMessage: "Invalid image URL"
    }
  }
};
const deleteCourseCategoryValidator = exports.deleteCourseCategoryValidator = {
  id: {
    in: "params",
    exists: {
      errorMessage: "Course Category ID is required"
    },
    isString: {
      errorMessage: "Course Category ID must be a string"
    }
  }
};
const getCourseCategoryByIdValidator = exports.getCourseCategoryByIdValidator = {
  id: {
    in: "params",
    exists: {
      errorMessage: "Course Category ID is required"
    },
    isString: {
      errorMessage: "Course Category ID must be a string"
    }
  }
};
//# sourceMappingURL=courseCategory.validator.js.map