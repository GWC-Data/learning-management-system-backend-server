import { Schema } from 'express-validator';

// Validator for creating a class
export const classValidator: Schema = {
    classTitle: {
        in: 'body',
        exists: {
            errorMessage: 'Class Title is required'
        },
        isString: {
            errorMessage: 'Class Title must be a string'
        }
    },
    classDescription: {
        in: 'body',
        optional: true,
        isString: {
            errorMessage: 'Class Description must be a string'
        }
    },
    moduleId: {
        in: 'body',
        exists: {
            errorMessage: 'Module ID is required',
        },
        isString: {
            errorMessage: 'Module ID must be a string',
        }
    },
    assignmentName: {
        in: 'body',
        exists: {
            errorMessage: 'assignmentName is required'
        }
    },
    assignmentFile: {
        in: 'body',
        exists: {
            errorMessage: 'assignmentFile is required'
        }
    },
    materialForClass: {
        in: 'body',
        exists: {
            errorMessage: 'materialForClass is required'
        }
    },
    totalMarks: {
        in: 'body',
        exists: {
            errorMessage: 'totalMarks is required'
        }
    },
    assignmentEndDate: {
        in: 'body',
        exists: {
            errorMessage: 'assignmentEndDate is required'
        }
    }
};

// Validator for getting a class by ID
export const getClassByIdValidator: Schema = {
    classId: {
        in: 'body',
        exists: {
            errorMessage: 'classId is required'
        },
        isString: {
            errorMessage: 'classId must be a string'
        }
    }
};

// Validator for getting a module by ID
export const getModuleByIdValidator: Schema = {
    moduleId: {
        in: 'body',
        exists: {
            errorMessage: 'moduleId is required'
        },
        isString: {
            errorMessage: 'moduleId must be a string'
        }
    }
};

// Validator for updating a class
export const updateClassValidator: Schema = {
    id: {
        in: 'params',
        exists: {
            errorMessage: 'Class ID is required'
        },
        isString: {
            errorMessage: 'Class ID must be a string'
        }
    },
    classTitle: {
        in: 'body',
        optional: true,
        isString: {
            errorMessage: 'Class Title must be a string'
        }
    },
    classRecordedLink: {
        in: 'body',
        optional: true,
        isString: {
            errorMessage: 'Class Recorded Link must be a string'
        }
    },
    assignmentFile: {
        in: 'body',
        exists: {
            errorMessage: 'assignmentFile is required'
        }
    },
    materialForClass: {
        in: 'body',
        exists: {
            errorMessage: 'materialForClass is required'
        }
    },
    totalMarks: {
        in: 'body',
        exists: {
            errorMessage: 'totalMarks is required'
        }
    },
};

// Validator for deleting a class
export const deleteClassValidator: Schema = {
    id: {
        in: 'params',
        exists: {
            errorMessage: 'Class ID is required'
        },
        isString: {
            errorMessage: 'Class ID must be a string'
        }
    }
};
