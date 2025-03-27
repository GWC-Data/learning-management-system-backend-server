"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.updateUserValidator = exports.idValidator = exports.createUserValidator = void 0;
const createUserValidator = exports.createUserValidator = {
  firstName: {
    in: ["body"],
    isString: {
      errorMessage: "First name must be a string"
    },
    isLength: {
      options: {
        min: 2
      },
      errorMessage: "First name must be at least 2 characters long"
    }
  },
  lastName: {
    in: ["body"],
    isString: {
      errorMessage: "Last name must be a string"
    },
    isLength: {
      options: {
        min: 1
      },
      errorMessage: "Last name must be at least 1 characters long"
    }
  },
  email: {
    in: ["body"],
    isEmail: {
      errorMessage: "Invalid email format"
    },
    normalizeEmail: true
  },
  dateOfBirth: {
    in: ["body"],
    optional: true,
    isString: {
      errorMessage: "Date of birth must be a string"
    },
    isDate: {
      errorMessage: 'DateOf Birth must be a valid date'
    }
  },
  phoneNumber: {
    in: ["body"],
    isString: {
      errorMessage: "Phone number must be a string"
    },
    matches: {
      options: /^\d{10}$/,
      errorMessage: "Phone number must be 10 digits long"
    }
  },
  password: {
    in: ["body"],
    isString: {
      errorMessage: "Password must be a string"
    },
    isLength: {
      options: {
        min: 8
      },
      errorMessage: "Password must be at least 8 characters long"
    }
  },
  dateOfJoining: {
    in: ["body"],
    optional: true,
    isString: {
      errorMessage: "Date of joining must be a string"
    },
    isDate: {
      errorMessage: "Date of joining must be a valid date"
    }
  },
  accountStatus: {
    in: ["body"],
    optional: true,
    isString: {
      errorMessage: "Account status must be a string"
    },
    isIn: {
      options: ["active", "inactive", "suspended"],
      errorMessage: "Invalid account status"
    }
  },
  roleId: {
    in: ["body"],
    isString: {
      errorMessage: "Role ID must be an string"
    }
  }
};

// Update User Validator (Partial validation for updates)
const updateUserValidator = exports.updateUserValidator = {
  firstName: {
    in: ["body"],
    optional: true,
    isString: {
      errorMessage: "First name must be a string"
    },
    isLength: {
      options: {
        min: 2
      },
      errorMessage: "First name must be at least 2 characters long"
    }
  },
  lastName: {
    in: ["body"],
    optional: true,
    isString: {
      errorMessage: "Last name must be a string"
    },
    isLength: {
      options: {
        min: 1
      },
      errorMessage: "Last name must be at least 1 characters long"
    }
  },
  email: {
    in: ["body"],
    optional: true,
    isEmail: {
      errorMessage: "Invalid email format"
    },
    normalizeEmail: true
  },
  phoneNumber: {
    in: ["body"],
    optional: true,
    isString: {
      errorMessage: "Phone number must be a string"
    },
    matches: {
      options: /^\d{10}$/,
      errorMessage: "Phone number must be 10 digits long"
    }
  },
  accountStatus: {
    in: ["body"],
    optional: true,
    isString: {
      errorMessage: "Account status must be a string"
    },
    isIn: {
      options: [["active", "inactive", "suspended"]],
      errorMessage: "Invalid account status"
    }
  },
  roleId: {
    in: ["body"],
    optional: true,
    isString: {
      errorMessage: "Role ID must be an string"
    }
  }
  // jobBoardAccess: {
  //   in: ["body"],
  //   optional: true,
  //   isString: { errorMessage: "jobBoardAccess must be a string" },
  //   isIn: {
  //     options: ["enable", "disable"],
  //     errorMessage: "Invalid Job Board Access",
  //   },
  // },
};

// ID Validator for endpoints requiring a user ID
const idValidator = exports.idValidator = {
  id: {
    in: ["params"],
    isString: {
      errorMessage: "ID must be an string"
    }
  }
};
//# sourceMappingURL=users.validator.js.map