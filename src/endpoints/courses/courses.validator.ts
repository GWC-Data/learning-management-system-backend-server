import { Schema } from 'express-validator';

export const createCourseValidator: Schema = {
    courseName: {
        in: 'body',
        optional: true, 
        exists: {
            errorMessage: 'Course Name is Required'
        },
        isLength: {
            errorMessage: 'CourseName must be at least 5 characters long',
            options: { min: 5 }
        }
    },
    courseDesc: {
        in: 'body',
        optional: true, 
        exists: {
            errorMessage: 'Course Description is Required'
        },
        isLength: {
            errorMessage: 'Course Description must be at least 20 characters long',
        }
    },
    courseCategoryId: {
        in: 'body',
        optional: true, 
        exists: {
            errorMessage: 'CourseCategoryId is Required'
        },
        isString: {
            errorMessage: 'CourseCategoryId must be an String'
        }
    },
    courseImg: {
        in: 'body',
        optional: true, 
        exists: {
            errorMessage: 'Course Image is Required'
        }
    },
    courseLink: {
        in: 'body',
        optional: true, 
        isString: {
            errorMessage: 'Course Link must be a String'
        }
    },
};


export const updateCourseValidator: Schema = {
    courseName: {
        in: 'body',
        optional: true, 
        isLength: {
            errorMessage: 'Course Name must be at least 5 characters long',
            options: { min: 5 }
        }
    },
    courseDesc: {
        in: 'body',
        optional: true, 
        isLength: {
            errorMessage: 'Course Description must be at least 20 characters long',
            options: { min: 20 }
        }
    },
    courseCategoryId: {
        in: 'body',
        optional: true, 
        isString: {
            errorMessage: 'CourseCategoryId must be an String'
        }
    },
    courseImg: {
        in: 'body',
        optional: true, 
        exists: {
            errorMessage: 'Course Image is Required'
        }
    },
    courseLink: {
        in: 'body',
        optional: true, 
        isString: {
            errorMessage: 'Course Link must be a String'
        }
    },
};

export const getCourseByIdValidator: Schema = {
    id: {
        in: 'params',
        optional: true, 
        exists: {
            errorMessage: 'CourseId is Required'
        },
        isString: {
            errorMessage: 'CourseId must be an String'
        }
    }
}

export const deleteCourseValidator: Schema = {
    id: {
        in: 'params',
        optional: true, 
        exists: {
            errorMessage: 'CourseId is Required'
        },
        isString: {
            errorMessage: 'CourseId must be an String'
        }
    }
}