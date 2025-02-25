const wipeDB = require('../../../wipeDB');
const app = require('../../../../src/createApp');
const api = require('../../../api')(app);
const CONSTANTS = require('../../../../src/constants');
const { MOCK_DEAL } = require('../../mocks/mock-data');
const aDeal = require('../../deal-builder');

describe('GET TFM amendments', () => {
  let dealId;

  const mockUser = {
    _id: '123456789',
    username: 'temp',
    roles: [],
    bank: {
      id: '956',
      name: 'Barclays Bank',
    },
  };

  const newFacility = {
    type: 'Bond',
    dealId: MOCK_DEAL.DEAL_ID,
  };

  const newDeal = aDeal({
    dealType: CONSTANTS.DEALS.DEAL_TYPE.BSS_EWCS,
    additionalRefName: 'mock name',
    bankInternalRefName: 'mock id',
    editedBy: [],
    eligibility: {
      status: 'Not started',
      criteria: [{}],
    },
  });

  const createDeal = async () => {
    const { body } = await api.post({ deal: newDeal, user: mockUser }).to('/v1/portal/deals');
    return body;
  };

  beforeEach(async () => {
    await wipeDB.wipe(['tfm-facilities', 'tfm-deals']);
    const deal = await createDeal();
    dealId = deal._id;

    newFacility.dealId = dealId;
  });

  describe('GET /v1/tfm/facilities/:id/amendments', () => {
    it('should return all amendments based on facilityId', async () => {
      const postResult = await api.post({ facility: newFacility, user: mockUser }).to('/v1/portal/facilities');
      const facilityId = postResult.body._id;

      await api.put({ dealType: CONSTANTS.DEALS.DEAL_TYPE.BSS_EWCS, dealId }).to('/v1/tfm/deals/submit');

      const { body: bodyPostResponse } = await api.post().to(`/v1/tfm/facilities/${facilityId}/amendments`);
      const updatePayload = { status: CONSTANTS.AMENDMENT.AMENDMENT_STATUS.IN_PROGRESS };
      await api.put(updatePayload).to(`/v1/tfm/facilities/${facilityId}/amendments/${bodyPostResponse.amendmentId}`);

      const { status, body } = await api.get(`/v1/tfm/facilities/${facilityId}/amendments`);

      expect(status).toEqual(200);

      const exp = [
        {
          amendmentId: expect.any(String),
          createdAt: expect.any(Number),
          updatedAt: expect.any(Number),
          status: expect.any(String),
          dealId: expect.any(String),
          facilityId: expect.any(String),
          version: 1
        }
      ];

      expect(body).toEqual(exp);
    });

    it('should return 400 if the facilityId is not valid', async () => {
      const { status, body } = await api.get('/v1/tfm/facilities/1234/amendments');
      expect(status).toEqual(400);
      expect(body).toEqual({ status: 400, message: 'Invalid facility Id' });
    });

    it('should return 200 with an empty array if the facility does not have any amendments', async () => {
      const { status, body } = await api.get('/v1/tfm/facilities/626a9270184ded001357c010/amendments');
      expect(status).toEqual(200);
      expect(body).toEqual([]);
    });
  });

  describe('GET /v1/tfm/facilities/:id/amendments/:amendmentId', () => {
    it('should return 200 status if the facility has amendments', async () => {
      const postResult = await api.post({ facility: newFacility, user: mockUser }).to('/v1/portal/facilities');
      const facilityId = postResult.body._id;

      await api.put({ dealType: CONSTANTS.DEALS.DEAL_TYPE.BSS_EWCS, dealId }).to('/v1/tfm/deals/submit');

      const { body: { amendmentId } } = await api.post().to(`/v1/tfm/facilities/${facilityId}/amendments`);
      const { status, body } = await api.get(`/v1/tfm/facilities/${facilityId}/amendments/${amendmentId}`);

      expect(status).toEqual(200);
      expect(body).toEqual({
        amendmentId: expect.any(String),
        createdAt: expect.any(Number),
        status: expect.any(String),
        updatedAt: expect.any(Number),
        dealId: expect.any(String),
        facilityId: expect.any(String),
        version: 1,
      });
    });

    it('should return 400 status if the  amendmentId has the wrong format', async () => {
      await api.post({ facility: newFacility, user: mockUser }).to('/v1/portal/facilities');
      await api.put({ dealType: CONSTANTS.DEALS.DEAL_TYPE.BSS_EWCS, dealId }).to('/v1/tfm/deals/submit');

      const { status, body } = await api.get('/v1/tfm/facilities/626a9270184ded001357c010/amendments/123');

      expect(status).toEqual(400);
      expect(body).toEqual({ message: 'Invalid amendment Id', status: 400 });
    });

    it('should return 400 status if the facilityId has the wrong format', async () => {
      await api.post({ facility: newFacility, user: mockUser }).to('/v1/portal/facilities');
      await api.put({ dealType: CONSTANTS.DEALS.DEAL_TYPE.BSS_EWCS, dealId }).to('/v1/tfm/deals/submit');

      const { status, body } = await api.get('/v1/tfm/facilities/123/amendments/626a9270184ded001357c010');

      expect(status).toEqual(400);
      expect(body).toEqual({ status: 400, message: 'Invalid facility Id' });
    });

    it('should return 400 status if the facilityId and amendmentId have the wrong format', async () => {
      await api.post({ facility: newFacility, user: mockUser }).to('/v1/portal/facilities');
      await api.put({ dealType: CONSTANTS.DEALS.DEAL_TYPE.BSS_EWCS, dealId }).to('/v1/tfm/deals/submit');

      const { status, body } = await api.get('/v1/tfm/facilities/123/amendments/1234');

      expect(status).toEqual(400);
      expect(body).toEqual({ status: 400, message: 'Invalid facility Id' });
    });
  });

  describe('GET /v1/tfm/facilities/:id/amendments/in-progress', () => {
    it('should return 200 status if the facility has an amendment that\'s in progress', async () => {
      const postResult = await api.post({ facility: newFacility, user: mockUser }).to('/v1/portal/facilities');
      const facilityId = postResult.body._id;

      await api.put({ dealType: CONSTANTS.DEALS.DEAL_TYPE.BSS_EWCS, dealId }).to('/v1/tfm/deals/submit');

      const { body: bodyPostResponse } = await api.post().to(`/v1/tfm/facilities/${facilityId}/amendments`);
      const updatePayload = { status: CONSTANTS.AMENDMENT.AMENDMENT_STATUS.IN_PROGRESS };
      await api.put(updatePayload).to(`/v1/tfm/facilities/${facilityId}/amendments/${bodyPostResponse.amendmentId}`);
      const { status, body } = await api.get(`/v1/tfm/facilities/${facilityId}/amendments/in-progress`);

      expect(status).toEqual(200);
      expect(body).toEqual({
        amendmentId: expect.any(String),
        createdAt: expect.any(Number),
        status: expect.any(String),
        updatedAt: expect.any(Number),
        dealId: expect.any(String),
        facilityId: expect.any(String),
        version: 1,
      });
    });

    it('should return 200 status if the facility does NOT have an amendment that\'s in progress', async () => {
      const postResult = await api.post({ facility: newFacility, user: mockUser }).to('/v1/portal/facilities');
      const facilityId = postResult.body._id;

      await api.put({ dealType: CONSTANTS.DEALS.DEAL_TYPE.BSS_EWCS, dealId }).to('/v1/tfm/deals/submit');

      const { status, body } = await api.get(`/v1/tfm/facilities/${facilityId}/amendments/in-progress`);

      expect(status).toEqual(200);
      expect(body).toEqual({});
    });

    it('should return 400 status if the facilityId has the wrong format', async () => {
      await api.post({ facility: newFacility, user: mockUser }).to('/v1/portal/facilities');
      await api.put({ dealType: CONSTANTS.DEALS.DEAL_TYPE.BSS_EWCS, dealId }).to('/v1/tfm/deals/submit');

      const { status, body } = await api.get('/v1/tfm/facilities/123/amendments/in-progress');

      expect(status).toEqual(400);
      expect(body).toEqual({ status: 400, message: 'Invalid facility Id' });
    });
  });

  describe('GET /v1/tfm/facilities/:id/amendments/completed', () => {
    it('should return 200 status if the facility has an amendment that\'s COMPLETED', async () => {
      const postResult = await api.post({ facility: newFacility, user: mockUser }).to('/v1/portal/facilities');
      const facilityId = postResult.body._id;

      await api.put({ dealType: CONSTANTS.DEALS.DEAL_TYPE.BSS_EWCS, dealId }).to('/v1/tfm/deals/submit');

      const { body: { amendmentId } } = await api.post().to(`/v1/tfm/facilities/${facilityId}/amendments`);
      await api.put({ status: CONSTANTS.AMENDMENT.AMENDMENT_STATUS.COMPLETED }).to(`/v1/tfm/facilities/${facilityId}/amendments/${amendmentId}`);

      const { body: { amendmentId: amendmentId2 } } = await api.post().to(`/v1/tfm/facilities/${facilityId}/amendments`);
      await api.put({ status: CONSTANTS.AMENDMENT.AMENDMENT_STATUS.COMPLETED }).to(`/v1/tfm/facilities/${facilityId}/amendments/${amendmentId2}`);

      await api.post().to(`/v1/tfm/facilities/${facilityId}/amendments`);

      const { status, body } = await api.get(`/v1/tfm/facilities/${facilityId}/amendments/completed`);

      expect(status).toEqual(200);
      expect(body).toEqual([
        {
          amendmentId: expect.any(String),
          createdAt: expect.any(Number),
          status: expect.any(String),
          updatedAt: expect.any(Number),
          dealId: expect.any(String),
          facilityId: expect.any(String),
          version: 1,
        }, {
          amendmentId: expect.any(String),
          createdAt: expect.any(Number),
          status: expect.any(String),
          updatedAt: expect.any(Number),
          dealId: expect.any(String),
          facilityId: expect.any(String),
          version: 2,
        }
      ]);
    });

    it('should return 200 status if the facility does NOT have an amendment that\'s COMPLETED', async () => {
      const postResult = await api.post({ facility: newFacility, user: mockUser }).to('/v1/portal/facilities');
      const facilityId = postResult.body._id;

      await api.put({ dealType: CONSTANTS.DEALS.DEAL_TYPE.BSS_EWCS, dealId }).to('/v1/tfm/deals/submit');

      const { status, body } = await api.get(`/v1/tfm/facilities/${facilityId}/amendments/completed`);

      expect(status).toEqual(200);
      expect(body).toEqual([]);
    });

    it('should return 400 status if the facilityId has the wrong format', async () => {
      await api.post({ facility: newFacility, user: mockUser }).to('/v1/portal/facilities');
      await api.put({ dealType: CONSTANTS.DEALS.DEAL_TYPE.BSS_EWCS, dealId }).to('/v1/tfm/deals/submit');

      const { status, body } = await api.get('/v1/tfm/facilities/123/amendments/completed');

      expect(status).toEqual(400);
      expect(body).toEqual({ status: 400, message: 'Invalid facility Id' });
    });
  });

  describe('GET /v1/tfm/facilities/:id/amendments/completed/latest', () => {
    it('should return 200 status if the facility has an amendment that\'s COMPLETED', async () => {
      const postResult = await api.post({ facility: newFacility, user: mockUser }).to('/v1/portal/facilities');
      const facilityId = postResult.body._id;

      await api.put({ dealType: CONSTANTS.DEALS.DEAL_TYPE.BSS_EWCS, dealId }).to('/v1/tfm/deals/submit');

      const { body: { amendmentId } } = await api.post().to(`/v1/tfm/facilities/${facilityId}/amendments`);
      await api.put({
        status: CONSTANTS.AMENDMENT.AMENDMENT_STATUS.COMPLETED, submittedByPim: true, requireUkefApproval: false, changeFacilityValue: true, value: 123
      }).to(`/v1/tfm/facilities/${facilityId}/amendments/${amendmentId}`);

      const { status, body } = await api.get(`/v1/tfm/facilities/${facilityId}/amendments/completed/latest-value`);
      expect(status).toEqual(200);
      expect(body).toEqual({
        amendmentId: expect.any(String),
        value: expect.any(Number),
      });
    });

    it('should return 200 status if the facility does NOT have an amendment that\'s COMPLETED', async () => {
      const postResult = await api.post({ facility: newFacility, user: mockUser }).to('/v1/portal/facilities');
      const facilityId = postResult.body._id;

      await api.put({ dealType: CONSTANTS.DEALS.DEAL_TYPE.BSS_EWCS, dealId }).to('/v1/tfm/deals/submit');

      const { status, body } = await api.get(`/v1/tfm/facilities/${facilityId}/amendments/completed/latest-value`);

      expect(status).toEqual(200);
      expect(body).toEqual({});
    });

    it('should return 400 status if the facilityId has the wrong format', async () => {
      await api.post({ facility: newFacility, user: mockUser }).to('/v1/portal/facilities');
      await api.put({ dealType: CONSTANTS.DEALS.DEAL_TYPE.BSS_EWCS, dealId }).to('/v1/tfm/deals/submit');

      const { status, body } = await api.get('/v1/tfm/facilities/123/amendments/completed/latest-value');

      expect(status).toEqual(400);
      expect(body).toEqual({ status: 400, message: 'Invalid facility Id' });
    });
  });

  describe('GET /v1/tfm/amendments', () => {
    it('should return 200 status and all amendments that are in progress', async () => {
      const postResult = await api.post({ facility: newFacility, user: mockUser }).to('/v1/portal/facilities');
      const facilityId1 = postResult.body._id;

      await api.put({ dealType: CONSTANTS.DEALS.DEAL_TYPE.BSS_EWCS, dealId }).to('/v1/tfm/deals/submit');

      const { body: bodyPostResponse1 } = await api.post().to(`/v1/tfm/facilities/${facilityId1}/amendments`);
      const updatePayload1 = { status: CONSTANTS.AMENDMENT.AMENDMENT_STATUS.IN_PROGRESS };
      await api.put(updatePayload1).to(`/v1/tfm/facilities/${facilityId1}/amendments/${bodyPostResponse1.amendmentId}`);

      const postResult2 = await api.post({ facility: newFacility, user: mockUser }).to('/v1/portal/facilities');
      const facilityId2 = postResult2.body._id;

      await api.put({ dealType: CONSTANTS.DEALS.DEAL_TYPE.BSS_EWCS, dealId }).to('/v1/tfm/deals/submit');

      const { body: bodyPostResponse2 } = await api.post().to(`/v1/tfm/facilities/${facilityId2}/amendments`);
      const updatePayload2 = { status: CONSTANTS.AMENDMENT.AMENDMENT_STATUS.IN_PROGRESS };
      await api.put(updatePayload2).to(`/v1/tfm/facilities/${facilityId2}/amendments/${bodyPostResponse2.amendmentId}`);

      const { status, body } = await api.get('/v1/tfm/amendments');

      expect(status).toEqual(200);
      expect(body).toEqual([
        {
          amendmentId: expect.any(String),
          createdAt: expect.any(Number),
          status: expect.any(String),
          updatedAt: expect.any(Number),
          dealId: expect.any(String),
          facilityId: expect.any(String),
          version: 1,
        },
        {
          amendmentId: expect.any(String),
          createdAt: expect.any(Number),
          status: expect.any(String),
          updatedAt: expect.any(Number),
          dealId: expect.any(String),
          facilityId: expect.any(String),
          version: 1,
        }
      ]);
    });
  });
});
