const axios = require('axios');
const FormData = require('form-data');
const { isValidMongoId, isValidResetPasswordToken, isValidDocumentType, isValidFileName } = require('./validation/validate-ids');
const { FEATURE_FLAGS } = require('./config/feature-flag.config');

require('dotenv').config();

const { PORTAL_API_URL, PORTAL_API_KEY } = process.env;

const login = async (username, password) => {
  if (FEATURE_FLAGS.MAGIC_LINK) {
    const response = await axios({
      method: 'post',
      url: `${PORTAL_API_URL}/v1/login`,
      headers: {
        'Content-Type': 'application/json',
      },
      data: { username, password },
    });
    const { token, loginStatus, user } = response.data;
    return { token, loginStatus, user };
  }

  try {
    const response = await axios({
      method: 'post',
      url: `${PORTAL_API_URL}/v1/login`,
      headers: {
        'Content-Type': 'application/json',
      },
      data: { username, password },
    });

    return response.data
      ? {
        success: response.data.success,
        token: response.data.token,
        user: response.data.user,
      }
      : '';
  } catch (error) {
    return new Error('error with token'); // do something proper here, but for now just reject failed logins..
  }
};

const sendSignInLink = async (token) => axios({
  method: 'post',
  url: `${PORTAL_API_URL}/v1/users/me/sign-in-link`,
  headers: {
    'Content-Type': 'application/json',
    Authorization: token,
  },
});

const loginWithSignInLink = async ({ token: requestAuthToken, signInToken }) => {
  const response = await axios({
    method: 'post',
    url: `${PORTAL_API_URL}/v1/users/me/sign-in-link/${signInToken}/login`,
    headers: {
      'Content-Type': 'application/json',
      Authorization: requestAuthToken,
    },
  });

  const { token, loginStatus, user } = response.data;
  return {
    loginStatus,
    token,
    user,
  };
};

const resetPassword = async (email) => {
  const response = await axios({
    method: 'post',
    url: `${PORTAL_API_URL}/v1/users/reset-password`,
    headers: {
      'Content-Type': 'application/json',
    },
    data: { email },
  });

  return { success: response.status === 200 };
};

const resetPasswordFromToken = async (resetPwdToken, formData) => {
  if (!isValidResetPasswordToken(resetPwdToken)) {
    console.error('Reset password from token API call failed for token %s', resetPwdToken);
    return false;
  }

  try {
    const response = await axios({
      method: 'post',
      url: `${PORTAL_API_URL}/v1/users/reset-password/${resetPwdToken}`,
      headers: {
        'Content-Type': 'application/json',
      },
      data: formData,
    });
    return {
      status: response.status,
      data: response.data,
    };
  } catch (error) {
    console.error('Reset password failed %s', error?.response?.data);
    return {
      status: error?.response?.status || 500,
      data: error?.response?.data,
    };
  }
};

const allDeals = async (start, pagesize, filters, token, sort) => {
  const payload = {
    start,
    pagesize,
    filters,
    sort,
  };

  const response = await axios({
    method: 'get',
    url: `${PORTAL_API_URL}/v1/deals`,
    headers: {
      Authorization: token,
      'Content-Type': 'application/json',
    },
    data: payload,
  });

  return response.data;
};

const allFacilities = async (start, pagesize, filters, token, sort) => {
  const payload = {
    start,
    pagesize,
    filters,
    sort,
  };

  const response = await axios({
    method: 'get',
    url: `${PORTAL_API_URL}/v1/facilities`,
    headers: {
      Authorization: token,
      'Content-Type': 'application/json',
    },
    data: payload,
  });

  return response.data;
};

const createDeal = async (deal, token) => {
  const response = await axios({
    method: 'post',
    url: `${PORTAL_API_URL}/v1/deals`,
    headers: {
      Authorization: token,
      'Content-Type': 'application/json',
    },
    data: deal,
  });

  return response.data;
};

const updateDealName = async (id, newName, token) => {
  if (!isValidMongoId(id)) {
    console.error('Update deal name API call failed for id %s', id);
    return {
      status: 400,
    };
  }

  const response = await axios({
    method: 'put',
    url: `${PORTAL_API_URL}/v1/deals/${id}/additionalRefName`,
    headers: {
      Authorization: token,
      'Content-Type': 'application/json',
    },
    data: { additionalRefName: newName },
  });

  return {
    status: response.status,
    data: response.data,
  };
};

const updateDealStatus = async (statusUpdate, token) => {
  if (!isValidMongoId(statusUpdate._id)) {
    console.error('Update deal status API call failed for id %s', statusUpdate._id);
    return false;
  }

  const response = await axios({
    method: 'put',
    url: `${PORTAL_API_URL}/v1/deals/${statusUpdate._id}/status`,
    headers: {
      Authorization: token,
      'Content-Type': 'application/json',
    },
    data: statusUpdate,
  });

  return {
    status: response.status,
    data: response.data,
  };
};

const getSubmissionDetails = async (id, token) => {
  if (!isValidMongoId(id)) {
    console.error('Get submission details API call failed for id %s', id);
    return {
      status: 400,
    };
  }

  const response = await axios({
    method: 'get',
    url: `${PORTAL_API_URL}/v1/deals/${id}/submission-details`,
    headers: {
      Authorization: token,
      'Content-Type': 'application/json',
    },
  });

  return {
    status: response.status,
    validationErrors: response.data.validationErrors,
    data: response.data.data,
  };
};

const updateSubmissionDetails = async (deal, submissionDetails, token) => {
  const response = await axios({
    method: 'put',
    url: `${PORTAL_API_URL}/v1/deals/${deal._id}/submission-details`,
    headers: {
      Authorization: token,
      'Content-Type': 'application/json',
    },
    data: submissionDetails,
  });

  return {
    status: response.status,
    validationErrors: response.data.validationErrors,
    data: response.data.data,
  };
};

const cloneDeal = async (dealId, newDealData, token) => {
  if (!isValidMongoId(dealId)) {
    console.error('Clone deal API call failed for id %s', dealId);
    return false;
  }

  const response = await axios({
    method: 'post',
    url: `${PORTAL_API_URL}/v1/deals/${dealId}/clone`,
    headers: {
      Authorization: token,
      'Content-Type': 'application/json',
    },
    data: newDealData,
  });

  return response.data;
};

const updateEligibilityCriteria = async (dealId, criteria, token) => {
  if (!isValidMongoId(dealId)) {
    console.error('Update eligibility criteria API call failed for id %s', dealId);
    return false;
  }

  const response = await axios({
    method: 'put',
    url: `${PORTAL_API_URL}/v1/deals/${dealId}/eligibility-criteria`,
    headers: {
      Authorization: token,
      'Content-Type': 'application/json',
    },
    data: criteria,
  });
  return response.data;
};

const updateEligibilityDocumentation = async (dealId, body, files, token) => {
  if (!isValidMongoId(dealId)) {
    console.error('Update eligibility documentation API call failed for id %s', dealId);
    return false;
  }

  const formData = new FormData();

  Object.entries(body).forEach(([fieldname, value]) => {
    if (Array.isArray(value)) {
      value.forEach((v) => formData.append(fieldname, v));
    } else {
      formData.append(`${fieldname}`, value);
    }
  });

  files.forEach((file) => {
    formData.append(file.fieldname, file.buffer, file.originalname, file.size);
  });

  const formHeaders = formData.getHeaders();

  const response = await axios({
    method: 'put',
    url: `${PORTAL_API_URL}/v1/deals/${dealId}/eligibility-documentation`,
    headers: {
      Authorization: token,
      ...formHeaders,
    },
    data: formData.getBuffer(),
    maxContentLength: Infinity,
    maxBodyLength: Infinity,
  });

  return response.data;
};

const createLoan = async (dealId, token) => {
  if (!isValidMongoId(dealId)) {
    console.error('Create loan API call failed for id %s', dealId);
    return false;
  }

  const response = await axios({
    method: 'put',
    url: `${PORTAL_API_URL}/v1/deals/${dealId}/loan/create`,
    headers: {
      Authorization: token,
      'Content-Type': 'application/json',
    },
  });
  return response.data;
};

const getLoan = async (dealId, loanId, token) => {
  if (!isValidMongoId(dealId) || !isValidMongoId(loanId)) {
    console.error('Get loan API call failed for id %s %s', dealId, loanId);
    return false;
  }
  const response = await axios({
    method: 'get',
    url: `${PORTAL_API_URL}/v1/deals/${dealId}/loan/${loanId}`,
    headers: {
      Authorization: token,
      'Content-Type': 'application/json',
    },
  });
  return response.data;
};

const updateLoan = async (dealId, loanId, formData, token) => {
  if (!isValidMongoId(dealId) || !isValidMongoId(loanId)) {
    console.error('Update loan API call failed for id %s %s', dealId, loanId);
    return false;
  }

  const response = await axios({
    method: 'put',
    url: `${PORTAL_API_URL}/v1/deals/${dealId}/loan/${loanId}`,
    headers: {
      Authorization: token,
      'Content-Type': 'application/json',
    },
    data: formData,
  });
  return response.data;
};

const updateLoanIssueFacility = async (dealId, loanId, formData, token) => {
  if (!isValidMongoId(dealId) || !isValidMongoId(loanId)) {
    console.error('Update loan issue facility API call failed for id %s %s', dealId, loanId);
    return false;
  }

  const response = await axios({
    method: 'put',
    url: `${PORTAL_API_URL}/v1/deals/${dealId}/loan/${loanId}/issue-facility`,
    headers: {
      Authorization: token,
      'Content-Type': 'application/json',
    },
    data: formData,
  });
  return response.data;
};

const updateLoanCoverStartDate = async (dealId, loanId, formData, token) => {
  if (!isValidMongoId(dealId) || !isValidMongoId(loanId)) {
    console.error('Get loan cover start date API call failed for id %s %s', dealId, loanId);
    return false;
  }

  const response = await axios({
    method: 'put',
    url: `${PORTAL_API_URL}/v1/deals/${dealId}/loan/${loanId}/change-cover-start-date`,
    headers: {
      Authorization: token,
      'Content-Type': 'application/json',
    },
    data: formData,
  });
  return response.data;
};

const deleteLoan = async (dealId, loanId, token) => {
  if (!isValidMongoId(dealId) || !isValidMongoId(loanId)) {
    console.error('Delete loan API call failed for id %s %s', dealId, loanId);
    return false;
  }

  const response = await axios({
    method: 'delete',
    url: `${PORTAL_API_URL}/v1/deals/${dealId}/loan/${loanId}`,
    headers: {
      Authorization: token,
      'Content-Type': 'application/json',
    },
  });
  return response.data;
};

const createBond = async (dealId, token) => {
  if (!isValidMongoId(dealId)) {
    console.error('Create bond API call failed for id %s', dealId);
    return false;
  }

  const response = await axios({
    method: 'put',
    url: `${PORTAL_API_URL}/v1/deals/${dealId}/bond/create`,
    headers: {
      Authorization: token,
      'Content-Type': 'application/json',
    },
  });
  return response.data;
};

const contractBond = async (dealId, bondId, token) => {
  if (!isValidMongoId(dealId) || !isValidMongoId(bondId)) {
    console.error('Get contract bond API call failed for id %s %s', dealId, bondId);
    return false;
  }
  const response = await axios({
    method: 'get',
    url: `${PORTAL_API_URL}/v1/deals/${dealId}/bond/${bondId}`,
    headers: {
      Authorization: token,
      'Content-Type': 'application/json',
    },
  });
  return response.data;
};

const updateBond = async (dealId, bondId, formData, token) => {
  if (!isValidMongoId(dealId) || !isValidMongoId(bondId)) {
    console.error('Update bond API call failed for id %s %s', dealId, bondId);
    return false;
  }

  const response = await axios({
    method: 'put',
    url: `${PORTAL_API_URL}/v1/deals/${dealId}/bond/${bondId}`,
    headers: {
      Authorization: token,
      'Content-Type': 'application/json',
    },
    data: formData,
  });
  return response.data;
};

const updateBondIssueFacility = async (dealId, bondId, formData, token) => {
  if (!isValidMongoId(dealId) || !isValidMongoId(bondId)) {
    console.error('Update bond issue facility API call failed for id %s %s', dealId, bondId);
    return false;
  }

  const response = await axios({
    method: 'put',
    url: `${PORTAL_API_URL}/v1/deals/${dealId}/bond/${bondId}/issue-facility`,
    headers: {
      Authorization: token,
      'Content-Type': 'application/json',
    },
    data: formData,
  });
  return response.data;
};

const updateBondCoverStartDate = async (dealId, bondId, formData, token) => {
  if (!isValidMongoId(dealId) || !isValidMongoId(bondId)) {
    console.error('Update bond cover start date API call failed for id %s %s', dealId, bondId);
    return false;
  }

  const response = await axios({
    method: 'put',
    url: `${PORTAL_API_URL}/v1/deals/${dealId}/bond/${bondId}/change-cover-start-date`,
    headers: {
      Authorization: token,
      'Content-Type': 'application/json',
    },
    data: formData,
  });
  return response.data;
};

const deleteBond = async (dealId, bondId, token) => {
  if (!isValidMongoId(dealId) || !isValidMongoId(bondId)) {
    console.error('Delete bond API call failed for id %s %s', dealId, bondId);
    return false;
  }

  const response = await axios({
    method: 'delete',
    url: `${PORTAL_API_URL}/v1/deals/${dealId}/bond/${bondId}`,
    headers: {
      Authorization: token,
      'Content-Type': 'application/json',
    },
  });
  return response.data;
};

const banks = async (token) => {
  const response = await axios({
    method: 'get',
    url: `${PORTAL_API_URL}/v1/banks`,
    headers: {
      Authorization: token,
      'Content-Type': 'application/json',
    },
  });

  return response.data.banks;
};

const getCurrencies = async (token, includeDisabled) => {
  const response = await axios({
    method: 'get',
    url: `${PORTAL_API_URL}/v1/currencies`,
    headers: {
      Authorization: token,
      'Content-Type': 'application/json',
    },
  });

  const filteredCurrencies = response.data.currencies.filter((currency) => includeDisabled || !currency.disabled);

  return {
    status: response.status,
    currencies: filteredCurrencies,
  };
};

const getCountries = async (token, includeDisabled) => {
  const response = await axios({
    method: 'get',
    url: `${PORTAL_API_URL}/v1/countries`,
    headers: {
      Authorization: token,
      'Content-Type': 'application/json',
    },
  });

  const filteredCountries = response.data.countries.filter((country) => includeDisabled || !country.disabled);

  return {
    status: response.status,
    countries: filteredCountries,
  };
};

const getIndustrySectors = async (token) => {
  const response = await axios({
    method: 'get',
    url: `${PORTAL_API_URL}/v1/industry-sectors`,
    headers: {
      Authorization: token,
      'Content-Type': 'application/json',
    },
  });

  return {
    status: response.status,
    industrySectors: response.data.industrySectors,
  };
};

const validateToken = async (token) => {
  if (!token) return false;

  const response = await axios({
    method: 'get',
    headers: {
      Authorization: token,
      'Content-Type': 'application/json',
    },
    url: `${PORTAL_API_URL}/v1/validate`,
  }).catch((error) => error.response);
  return response.status === 200;
};

const validatePartialAuthToken = (token) => axios({
  method: 'get',
  headers: {
    Authorization: token,
    'Content-Type': 'application/json',
  },
  url: `${PORTAL_API_URL}/v1/validate-partial-2fa-token`,
});

const validateBank = async (dealId, bankId, token) => {
  try {
    const { data } = await axios({
      method: 'get',
      url: `${PORTAL_API_URL}/v1/validate/bank`,
      headers: {
        Authorization: token,
        'Content-Type': 'application/json',
      },
      data: { dealId, bankId },
    });
    return data;
  } catch (error) {
    console.error('Unable to validate the bank %s', error);
    return 'Failed to validate the bank';
  }
};

const users = async (token) => {
  if (!token) {
    console.error('Get Users API call failed due to missing token');
    return false;
  }

  const response = await axios({
    method: 'get',
    headers: {
      Authorization: token,
      'Content-Type': 'application/json',
    },
    url: `${PORTAL_API_URL}/v1/users`,
  });

  return response.data;
};

const user = async (id, token) => {
  if (!token) {
    console.error('Get User API call failed due to missing token');
    return false;
  }

  if (!isValidMongoId(id)) {
    console.error('User API call failed for id %s', id);
    return false;
  }

  const response = await axios({
    method: 'get',
    headers: {
      Authorization: token,
      'Content-Type': 'application/json',
    },
    url: `${PORTAL_API_URL}/v1/users/${id}`,
  });

  return response.data;
};

const createUser = async (userToCreate, token) => {
  if (!token) {
    console.error('Create User API call failed due to missing token');
    return false;
  }

  const response = await axios({
    method: 'post',
    url: `${PORTAL_API_URL}/v1/users`,
    headers: {
      Authorization: token,
      'Content-Type': 'application/json',
    },
    data: userToCreate,
  }).catch((error) => {
    console.error('Unable to create user %s', error);
    return error.response;
  });

  return response;
};

const updateUser = async (id, update, token) => {
  if (!token) {
    console.error('Update User API call failed due to missing token');
    return false;
  }

  if (!isValidMongoId(id)) {
    console.error('Update user API call failed for id %s', id);
    return false;
  }

  const response = await axios({
    method: 'put',
    url: `${PORTAL_API_URL}/v1/users/${id}`,
    headers: {
      Authorization: token,
      'Content-Type': 'application/json',
    },
    data: update,
  }).catch((error) => {
    console.error('Unable to update user %s', error);
    return error.response;
  });

  return response;
};

const getDeal = async (id, token) => {
  if (!isValidMongoId(id)) {
    console.error('Get deal API call failed for deal id %s', id);
    return {
      status: 400,
    };
  }

  const response = await axios({
    method: 'get',
    url: `${PORTAL_API_URL}/v1/deals/${id}`,
    headers: {
      Authorization: token,
      'Content-Type': 'application/json',
    },
  });

  return {
    status: response.status,
    deal: response.data.deal,
    validationErrors: response.data.validationErrors,
  };
};

const getLatestMandatoryCriteria = async (token) => {
  const response = await axios({
    method: 'get',
    url: `${PORTAL_API_URL}/v1/mandatory-criteria/latest`,
    headers: {
      Authorization: token,
      'Content-Type': 'application/json',
    },
  });

  return response.data;
};

const downloadFile = async (id, fieldname, filename, token) => {
  if (!isValidMongoId(id)) {
    console.error('Download file API call failed for id %s', id);
    return false;
  }

  if (!isValidDocumentType(fieldname)) {
    console.error('Download file API call failed for fieldname %s', fieldname);
    return false;
  }

  if (!isValidFileName(filename)) {
    console.error('Download file API call failed for filename %s', filename);
    return false;
  }

  const response = await axios({
    method: 'get',
    responseType: 'stream',
    url: `${PORTAL_API_URL}/v1/deals/${id}/eligibility-documentation/${fieldname}/${filename}`,
    headers: {
      Authorization: token,
    },
  });

  return response.data;
};

const createFeedback = async (formData, token) => {
  const response = await axios({
    method: 'post',
    url: `${PORTAL_API_URL}/v1/feedback`,
    headers: {
      Authorization: token,
      'Content-Type': 'application/json',
      'x-api-key': PORTAL_API_KEY,
    },
    data: formData,
  });
  return response.data;
};

const getUnissuedFacilitiesReport = async (token) => {
  try {
    const response = await axios({
      method: 'get',
      url: `${PORTAL_API_URL}/v1/reports/unissued-facilities`,
      headers: {
        Authorization: token,
        'Content-Type': 'application/json',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Unable to return unissued facilities %s', error);
    return { status: error?.code || 500, data: 'Error getting unissued facilities report.' };
  }
};

const getUkefDecisionReport = async (token, payload) => {
  try {
    const response = await axios({
      method: 'GET',
      url: `${PORTAL_API_URL}/v1/reports/review-ukef-decision`,
      headers: {
        Authorization: token,
        'Content-Type': 'application/json',
      },
      data: payload,
    });
    return response.data;
  } catch (error) {
    console.error('Unable to return UKEF decision report %s', error);
    return { status: error?.code || 500, data: 'Error getting Ukef decision report.' };
  }
};

module.exports = {
  allDeals,
  allFacilities,
  banks,
  cloneDeal,
  contractBond,
  createBond,
  createDeal,
  createLoan,
  createFeedback,
  login,
  resetPassword,
  resetPasswordFromToken,
  updateBond,
  updateBondIssueFacility,
  updateBondCoverStartDate,
  deleteBond,
  updateLoan,
  updateLoanIssueFacility,
  updateLoanCoverStartDate,
  deleteLoan,
  updateDealName,
  updateDealStatus,
  updateEligibilityCriteria,
  updateEligibilityDocumentation,
  getSubmissionDetails,
  updateSubmissionDetails,
  validateToken,
  validatePartialAuthToken,
  validateBank,
  users,
  user,
  createUser,
  sendSignInLink,
  loginWithSignInLink,
  updateUser,
  getCurrencies,
  getCountries,
  getDeal,
  getLoan,
  getIndustrySectors,
  getLatestMandatoryCriteria,
  downloadFile,
  getUnissuedFacilitiesReport,
  getUkefDecisionReport,
};
