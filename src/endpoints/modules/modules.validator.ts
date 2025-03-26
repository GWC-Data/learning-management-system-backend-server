import { Schema } from 'express-validator';

export const createModuleValidator: Schema = {
  courseId: {
    in: 'body',
    exists: {
      errorMessage: 'Course ID is required',
    },
    isString: {
      errorMessage: 'Course ID must be a string',
    },
  },
  moduleName: {
    in: 'body',
    optional: true,
    exists: {
      errorMessage: 'Module Name is required',
    },
    isString: {
      errorMessage: 'Module Name must be a string',
    },
  },
  moduleDescription: {
    in: 'body',
    optional: { options: { nullable: true } },
    isString: {
      errorMessage: 'Module Description must be a string',
    },
    isLength: {
      errorMessage: 'Module Description must be at least 10 characters long',
      options: { min: 10 },
    },
  },
};

export const updateModuleValidator: Schema = {
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
      options: { min: 3 }, // Fixed from min: 255
    },
  },
  moduleDescription: {
    in: 'body',
    optional: { options: { nullable: true } },
    isLength: {
      errorMessage: 'Module Description must be at least 10 characters long',
      options: { min: 10 },
    },
  },
  sequence: {
    in: 'body',
    optional: { options: { nullable: true } },
    isInt: {
      errorMessage: 'sequence must be integer',
    }
  }
}

export const getModuleByIdValidator: Schema = {
  id: {
    in: 'params',
    exists: {
      errorMessage: 'Module ID is required',
    },
    isString: {
      errorMessage: 'Module ID must be an string',
    },
  },
};

export const deleteModuleValidator: Schema = {
  id: {
    in: 'params',
    exists: {
      errorMessage: 'Module ID is required',
    },
    isString: {
      errorMessage: 'Module ID must be an string',
    },
  },
};

