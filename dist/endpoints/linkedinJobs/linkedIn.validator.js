"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.updateLinkedInJobValidator = exports.deleteLinkedInJobValidator = exports.createLinkedInJobValidator = void 0;
const createLinkedInJobValidator = exports.createLinkedInJobValidator = {
  title: {
    in: 'body',
    optional: true,
    exists: {
      errorMessage: 'title is required'
    },
    isString: {
      errorMessage: 'title must be a string'
    }
  },
  company: {
    in: 'body',
    optional: true,
    exists: {
      errorMessage: 'company is required'
    },
    isString: {
      errorMessage: 'company must be a string'
    }
  },
  carrierPathLink: {
    in: 'body',
    optional: true,
    exists: {
      errorMessage: 'carrierPathLink Link is required'
    },
    isURL: {
      errorMessage: 'carrierPathLink Link must be a valid URL'
    }
  },
  location: {
    in: 'body',
    optional: true,
    exists: {
      errorMessage: 'location is required'
    },
    isString: {
      errorMessage: 'location must be a string'
    }
  },
  datePosted: {
    in: 'body',
    optional: true,
    exists: {
      errorMessage: 'datePosted is required'
    }
  },
  imgSrc: {
    in: 'body',
    optional: true,
    exists: {
      errorMessage: 'imgSrc is required'
    }
  },
  jobDescription: {
    in: 'body',
    optional: true,
    exists: {
      errorMessage: 'jobDescription is required'
    }
  }
};
// Update LinkedInJob
const updateLinkedInJobValidator = exports.updateLinkedInJobValidator = {
  id: {
    in: 'params',
    exists: {
      errorMessage: 'LinkedinJobId is Required'
    },
    isString: {
      errorMessage: 'LinkedinJobId must be a String'
    }
  },
  link1: {
    in: 'body',
    optional: true,
    exists: {
      errorMessage: 'CarrierPath Link is Required'
    },
    isString: {
      errorMessage: 'CarrierPath Link must be a String'
    }
  },
  imgSrc: {
    in: 'body',
    optional: true,
    exists: {
      errorMessage: 'Image is Required'
    }
  }
};

// Delete LinkedInJob
const deleteLinkedInJobValidator = exports.deleteLinkedInJobValidator = {
  id: {
    in: 'params',
    exists: {
      errorMessage: 'LinkedinJobId is Required'
    },
    isString: {
      errorMessage: 'LinkedinJobId must be a String'
    }
  }
};
//# sourceMappingURL=linkedIn.validator.js.map