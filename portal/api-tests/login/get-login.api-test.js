jest.mock('csurf', () => () => (req, res, next) => next());
jest.mock('../../server/routes/middleware/csrf', () => ({
  ...(jest.requireActual('../../server/routes/middleware/csrf')),
  csrfToken: () => (req, res, next) => next(),
}));
jest.mock('../../server/api', () => ({
  login: jest.fn(),
  sendSignInLink: jest.fn(),
  loginWithSignInLink: jest.fn(),
  validateToken: () => true,
}));
const { withRoleValidationApiTests } = require('../common-tests/role-validation-api-tests');
const app = require('../../server/createApp');
const { get } = require('../create-api').createApi(app);
const { ROLES } = require('../../server/constants');

const allRoles = Object.values(ROLES);

describe('GET /login', () => {
  withRoleValidationApiTests({
    makeRequestWithHeaders: (headers) => get('/login', {}, headers),
    whitelistedRoles: allRoles,
    successCode: 200,
  });
});
