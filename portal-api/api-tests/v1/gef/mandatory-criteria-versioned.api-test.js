const wipeDB = require('../../wipeDB');

const app = require('../../../src/createApp');
const testUserCache = require('../../api-test-users');
const { withClientAuthenticationTests } = require('../../common-tests/client-authentication-tests');
const { withRoleAuthorisationTests } = require('../../common-tests/role-authorisation-tests');
const { MAKER, CHECKER, READ_ONLY, ADMIN } = require('../../../src/v1/roles/roles');

const { as, get } = require('../../api')(app);
const { expectMongoId } = require('../../expectMongoIds');

const allMandatoryCriteria = require('../../fixtures/gef/mandatoryCriteriaVersioned');

const newMandatoryCriteria = allMandatoryCriteria[0];
const updatedMandatoryCriteria = {
  ...newMandatoryCriteria,
  title: 'Updated mandatory criteria versioned',
};

const baseUrl = '/v1/gef/mandatory-criteria-versioned';

describe(baseUrl, () => {
  let aMaker;
  let anAdmin;
  let testUsers;

  beforeAll(async () => {
    testUsers = await testUserCache.initialise(app);
    aMaker = testUsers().withRole(MAKER).one();
    anAdmin = testUsers().withRole(ADMIN).one();
  });

  beforeEach(async () => {
    await wipeDB.wipe(['gef-mandatoryCriteriaVersioned']);
  });

  describe('GET /v1/gef/mandatory-criteria-versioned', () => {
    withClientAuthenticationTests({
      makeRequestWithoutAuthHeader: () => get(baseUrl),
      makeRequestWithAuthHeader: (authHeader) => get(baseUrl, { headers: { Authorization: authHeader } })
    });

    withRoleAuthorisationTests({
      allowedRoles: [MAKER, CHECKER, READ_ONLY, ADMIN],
      getUserWithRole: (role) => testUsers().withRole(role).one(),
      getUserWithoutAnyRoles: () => testUsers().withoutAnyRoles().one(),
      makeRequestAsUser: (user) => as(user).get(baseUrl),
      successStatusCode: 200,
    });
  });

  describe('GET /v1/gef/mandatory-criteria-versioned/latest', () => {
    const latestMandatoryCriteriaVersionedUrl = `${baseUrl}/latest`;

    beforeEach(async () => {
      await as(anAdmin).post(allMandatoryCriteria[0]).to(baseUrl);
    });

    withClientAuthenticationTests({
      makeRequestWithoutAuthHeader: () => get(latestMandatoryCriteriaVersionedUrl),
      makeRequestWithAuthHeader: (authHeader) => get(latestMandatoryCriteriaVersionedUrl, { headers: { Authorization: authHeader } })
    });

    withRoleAuthorisationTests({
      allowedRoles: [MAKER, CHECKER, READ_ONLY, ADMIN],
      getUserWithRole: (role) => testUsers().withRole(role).one(),
      getUserWithoutAnyRoles: () => testUsers().withoutAnyRoles().one(),
      makeRequestAsUser: (user) => as(user).get(latestMandatoryCriteriaVersionedUrl),
      successStatusCode: 200,
    });

    it('returns the latest mandatory-criteria version', async () => {
      await as(anAdmin).post(allMandatoryCriteria[1]).to(baseUrl);
      await as(anAdmin).post(allMandatoryCriteria[2]).to(baseUrl);
      await as(anAdmin).post(allMandatoryCriteria[3]).to(baseUrl);
      await as(anAdmin).post(allMandatoryCriteria[4]).to(baseUrl);

      const { body } = await as(aMaker).get(latestMandatoryCriteriaVersionedUrl);

      expect(body).toEqual(expect.objectContaining({
        ...expectMongoId(allMandatoryCriteria[2]),
        createdAt: expect.any(Number),
        introText: expect.any(String),
        criteria: expect.arrayContaining([
          expect.objectContaining({
            id: expect.any(String),
            body: expect.any(String),
          }),
        ]),
      }));
    });
  });

  describe('GET /v1/gef/mandatory-criteria-versioned/:id', () => {
    let oneMandatoryCriteriaVersionedUrl;

    beforeEach(async () => {
      const { body: { _id: newId } } = await as(anAdmin).post(newMandatoryCriteria).to(baseUrl);
      oneMandatoryCriteriaVersionedUrl = `${baseUrl}/${newId}`;
    });

    withClientAuthenticationTests({
      makeRequestWithoutAuthHeader: () => get(oneMandatoryCriteriaVersionedUrl),
      makeRequestWithAuthHeader: (authHeader) => get(oneMandatoryCriteriaVersionedUrl, { headers: { Authorization: authHeader } })
    });

    withRoleAuthorisationTests({
      allowedRoles: [MAKER, CHECKER, READ_ONLY, ADMIN],
      getUserWithRole: (role) => testUsers().withRole(role).one(),
      getUserWithoutAnyRoles: () => testUsers().withoutAnyRoles().one(),
      makeRequestAsUser: (user) => as(user).get(oneMandatoryCriteriaVersionedUrl),
      successStatusCode: 200,
    });

    it('returns a mandatory-criteria-versioned', async () => {
      const { status, body } = await as(anAdmin).get(oneMandatoryCriteriaVersionedUrl);
      expect(status).toEqual(200);
      const expected = {
        ...expectMongoId(newMandatoryCriteria),
        createdAt: expect.any(Number),
        criteria: expect.arrayContaining([
          expect.objectContaining({
            id: expect.any(String),
            body: expect.any(String),
          }),
        ]),
      };
      expect(body).toEqual(expected);
    });
  });

  describe('POST /v1/gef/mandatory-criteria-versioned', () => {
    it('rejects requests that do not present a valid Authorization token', async () => {
      const { status } = await as().post(newMandatoryCriteria).to(baseUrl);
      expect(status).toEqual(401);
    });

    it('rejects requests that present a valid Authorization token but do not have "admin" role', async () => {
      const { status } = await as(aMaker).post(newMandatoryCriteria).to(baseUrl);

      expect(status).toEqual(401);
    });

    it('accepts requests that present a valid Authorization token with "admin" role', async () => {
      const { status } = await as(anAdmin).post(newMandatoryCriteria).to(baseUrl);

      expect(status).toEqual(201);
    });
  });

  describe('PUT /v1/gef/mandatory-criteria-versioned/:id', () => {
    it('rejects requests that do not present a valid Authorization token', async () => {
      const { status } = await as().put(updatedMandatoryCriteria).to(`${baseUrl}/12345678`);
      expect(status).toEqual(401);
    });

    it('rejects requests that present a valid Authorization token but do not have "admin" role', async () => {
      const { status } = await as(aMaker).put(updatedMandatoryCriteria).to(`${baseUrl}/1`);
      expect(status).toEqual(401);
    });

    it('accepts requests that present a valid Authorization token with "admin" role', async () => {
      const item = await as(anAdmin).post(newMandatoryCriteria).to(baseUrl);
      const { status } = await as(anAdmin).put(updatedMandatoryCriteria).to(`${baseUrl}/${item.body._id}`);
      expect(status).toEqual(200);
    });

    it('rejects requests that do not have a valid mongodb id', async () => {
      const { status, body } = await as(anAdmin).put(updatedMandatoryCriteria).to(`${baseUrl}/abc`);
      expect(status).toEqual(400);
      expect(body).toStrictEqual({ status: 400, message: 'Invalid Id' });
    });

    it('successfully updates item', async () => {
      const item = await as(anAdmin).post(newMandatoryCriteria).to(baseUrl);
      const itemUpdate = {
        ...JSON.parse(item.text),
        version: 99,
        isInDraft: true,
        title: 'test 99',
        introText: 'intro 99',
        criteria: [
          { id: '1', body: 'Testing' },
        ],
      };
      delete itemUpdate._id; // immutable key

      const { status } = await as(anAdmin).put(itemUpdate).to(`${baseUrl}/${item.body._id}`);

      expect(status).toEqual(200);

      const { body } = await as(aMaker).get(`${baseUrl}/${item.body._id}`);

      expect(body).toEqual(expectMongoId({
        ...itemUpdate,
        createdAt: expect.any(Number),
        updatedAt: expect.any(Number),
        criteria: [
          { id: '1', body: 'Testing' },
        ],
      }));
    });
  });

  describe('DELETE /v1/gef/mandatory-criteria-versioned/:id', () => {
    it('rejects requests that do not present a valid Authorization token', async () => {
      const item = await as(anAdmin).post(newMandatoryCriteria).to(baseUrl);
      const { status } = await as().remove(`${baseUrl}/${item.body._id}`);
      expect(status).toEqual(401);
    });

    it('accepts requests that present a valid Authorization token with "admin" role', async () => {
      const item = await as(anAdmin).post(newMandatoryCriteria).to(baseUrl);
      const { status } = await as(anAdmin).remove(`${baseUrl}/${item.body._id}`);
      expect(status).toEqual(200);
    });

    it('deletes the mandatory-criteria', async () => {
      const { body: createdItem } = await as(anAdmin).post(newMandatoryCriteria).to(baseUrl);
      const { body: item } = await as(anAdmin).get(`${baseUrl}/${createdItem._id}`);

      const { status, body } = await as(anAdmin).remove(`${baseUrl}/${createdItem._id}`);
      expect(status).toEqual(200);
      expect(body).toEqual(item);
    });
  });
});
