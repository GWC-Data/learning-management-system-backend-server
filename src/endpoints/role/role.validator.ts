import { Schema } from 'express-validator';

export const createRoleValidator: Schema = {
  name: {
    in: 'body',
    exists: {
      errorMessage: 'Role name is required'
    },
    isString: {
      errorMessage: 'Role name must be a string'
    },
    isLength: {
      options: { max: 255 },
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
      options: { max: 500 },
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
      options: (permissions: any) => {
        if (permissions && permissions.some((perm: any) => typeof perm !== 'string')) {
          throw new Error('Each permission must be a string');
        }
        return true;
      }
    }
  }
};

export const updateRoleValidator: Schema = {
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
      options: { max: 255 },
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
      options: { max: 500 },
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
      options: (permissions: any) => {
        if (permissions && permissions.some((perm: any) => typeof perm !== 'string')) {
          throw new Error('Each permission must be a string');
        }
        return true;
      }
    }
  }
};

export const deleteRoleValidator: Schema = {
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

export const createPermissionValidator: Schema = {
  action: {
    in: 'body',
    exists: {
      errorMessage: 'Action is required'
    },
    isString: {
      errorMessage: 'Action must be a string'
    },
    isLength: {
      options: { max: 255 },
      errorMessage: 'Action cannot exceed 255 characters'
    }
  },
  description: {
    in: 'body',
    isLength: {
      options: { max: 255 },
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
      options: { max: 255 },
      errorMessage: 'Group Name  cannot exceed 255 characters'
    }
  }
};

export const updatePermissionValidator: Schema = {
  action: {
    in: 'body',
    optional: true,
    isString: {
      errorMessage: 'Action must be a string'
    },
    isLength: {
      options: { max: 255 },
      errorMessage: 'Action cannot exceed 255 characters'
    }
  }
};

export const deletePermissionValidator: Schema = {
  action: {
    in: 'params',
    exists: {
      errorMessage: 'Permission action is required'
    },
    isString: {
      errorMessage: 'Permission action must be a string'
    },
    isLength: {
      options: { max: 255 },
      errorMessage: 'Permission action cannot exceed 255 characters'
    }
  }
};

