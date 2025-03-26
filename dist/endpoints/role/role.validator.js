"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.updateRoleValidator = exports.updatePermissionValidator = exports.deleteRoleValidator = exports.deletePermissionValidator = exports.createRoleValidator = exports.createPermissionValidator = void 0;
const createRoleValidator = exports.createRoleValidator = {
  name: {
    in: 'body',
    exists: {
      errorMessage: 'Role name is required'
    },
    isString: {
      errorMessage: 'Role name must be a string'
    },
    isLength: {
      options: {
        max: 255
      },
      errorMessage: 'Role name cannot exceed 255 characters'
    }
  },
  description: {
    in: 'body',
    optional: true,
    isString: {
      errorMessage: 'Description must be a string'
    },
    isLength: {
      options: {
        max: 500
      },
      errorMessage: 'Description cannot exceed 500 characters'
    }
  },
  permissions: {
    in: 'body',
    optional: true,
    isArray: {
      errorMessage: 'Permissions must be an array of actions'
    },
    custom: {
      options: permissions => {
        if (permissions && permissions.some(perm => typeof perm !== 'string')) {
          throw new Error('Each permission must be a string');
        }
        return true;
      }
    }
  }
};
const updateRoleValidator = exports.updateRoleValidator = {
  id: {
    in: 'params',
    exists: {
      errorMessage: 'Role ID is required'
    },
    isString: {
      errorMessage: 'Role ID must be an string'
    }
  },
  name: {
    in: 'body',
    optional: true,
    isString: {
      errorMessage: 'Role name must be a string'
    },
    isLength: {
      options: {
        max: 255
      },
      errorMessage: 'Role name cannot exceed 255 characters'
    }
  },
  description: {
    in: 'body',
    optional: true,
    isString: {
      errorMessage: 'Description must be a string'
    },
    isLength: {
      options: {
        max: 500
      },
      errorMessage: 'Description cannot exceed 500 characters'
    }
  },
  permissions: {
    in: 'body',
    optional: true,
    isArray: {
      errorMessage: 'Permissions must be an array of actions'
    },
    custom: {
      options: permissions => {
        if (permissions && permissions.some(perm => typeof perm !== 'string')) {
          throw new Error('Each permission must be a string');
        }
        return true;
      }
    }
  }
};
const deleteRoleValidator = exports.deleteRoleValidator = {
  id: {
    in: 'params',
    exists: {
      errorMessage: 'Role ID is required'
    },
    isString: {
      errorMessage: 'Role ID must be an string'
    }
  }
};
const createPermissionValidator = exports.createPermissionValidator = {
  action: {
    in: 'body',
    exists: {
      errorMessage: 'Action is required'
    },
    isString: {
      errorMessage: 'Action must be a string'
    },
    isLength: {
      options: {
        max: 255
      },
      errorMessage: 'Action cannot exceed 255 characters'
    }
  },
  description: {
    in: 'body',
    isLength: {
      options: {
        max: 255
      },
      errorMessage: 'Description cannot exceed 255 characters'
    }
  },
  groupName: {
    in: 'body',
    exists: {
      errorMessage: 'Group Name is required'
    },
    isString: {
      errorMessage: 'Group Name  must be a string'
    },
    isLength: {
      options: {
        max: 255
      },
      errorMessage: 'Group Name  cannot exceed 255 characters'
    }
  }
};
const updatePermissionValidator = exports.updatePermissionValidator = {
  action: {
    in: 'body',
    optional: true,
    isString: {
      errorMessage: 'Action must be a string'
    },
    isLength: {
      options: {
        max: 255
      },
      errorMessage: 'Action cannot exceed 255 characters'
    }
  }
};
const deletePermissionValidator = exports.deletePermissionValidator = {
  action: {
    in: 'params',
    exists: {
      errorMessage: 'Permission action is required'
    },
    isString: {
      errorMessage: 'Permission action must be a string'
    },
    isLength: {
      options: {
        max: 255
      },
      errorMessage: 'Permission action cannot exceed 255 characters'
    }
  }
};
//# sourceMappingURL=role.validator.js.map