const externalApis = require('../../../src/v1/api');
const mapDeals = require('../../../src/v1/mappings/map-deals');

const MOCK_BSS_DEAL = require('../../../src/v1/__mocks__/mock-deal');
const MOCK_GEF_DEAL = require('../../../src/v1/__mocks__/mock-gef-deal');

describe('mappings - map-deals', () => {
  const mockFindFacilitiesByDealIdResponse = MOCK_GEF_DEAL.facilities.map((facility) => ({
    facilitySnapshot: facility,
    tfm: {},
  }));

  const mockFindOneFacilityResponse = {
    facilitySnapshot: MOCK_BSS_DEAL.bondTransactions.items[0],
    tfm: {},
  };

  const findFacilitiesByDealIdSpy = jest.fn(() => Promise.resolve(mockFindFacilitiesByDealIdResponse));
  const findOneFacilitySpy = jest.fn(() => Promise.resolve(mockFindOneFacilityResponse));

  beforeEach(() => {
    findFacilitiesByDealIdSpy.mockClear();
    findOneFacilitySpy.mockClear();

    externalApis.findFacilitiesByDealId = findFacilitiesByDealIdSpy;
    externalApis.findOneFacility = findOneFacilitySpy;
  });

  describe('GEF deals', () => {
    const mockDeals = [
      { _id: MOCK_GEF_DEAL._id, dealSnapshot: MOCK_GEF_DEAL },
      { _id: MOCK_GEF_DEAL._id, dealSnapshot: MOCK_GEF_DEAL },
    ];

    it('should call api.findFacilitiesByDealId with deal id', async () => {
      await mapDeals(mockDeals);

      const expectedCallCount = mockDeals.length;

      expect(findFacilitiesByDealIdSpy).toHaveBeenCalledTimes(expectedCallCount);

      const findOneFacilityCalls = externalApis.findFacilitiesByDealId.mock.calls;

      // both deals use the same mock deals
      const expectedCalls = [
        [MOCK_GEF_DEAL._id],
        [MOCK_GEF_DEAL._id],
      ];

      expect(findOneFacilityCalls).toEqual(expectedCalls);
    });

    it('should return deals mapped with facilities returned from API', async () => {
      const result = await mapDeals(mockDeals);

      const expectedDealShape = {
        ...mockDeals[0],
        dealSnapshot: {
          ...mockDeals[0].dealSnapshot,
          facilities: mockFindFacilitiesByDealIdResponse,
        },
      };

      const expected = [
        expectedDealShape,
        expectedDealShape,
      ];

      expect(result).toEqual(expected);
    });
  });

  describe('BSS/EWCS deals', () => {
    const mockBonds = MOCK_BSS_DEAL.bondTransactions.items.map(({ _id }) => ({ _id }));
    const mockLoans = MOCK_BSS_DEAL.loanTransactions.items.map(({ _id }) => ({ _id }));

    const mockDeal = {
      dealSnapshot: MOCK_BSS_DEAL,
    };

    const mockDeals = [
      mockDeal,
      mockDeal,
    ];

    const allFacilities = [...mockBonds, ...mockLoans];

    it('should call api.findOneFacility with facility id, for each facility', async () => {
      await mapDeals(mockDeals);

      const totalFacilities = allFacilities.length;
      const totalDeals = mockDeals.length;
      const expectedCallCount = (totalFacilities * totalDeals);

      expect(findOneFacilitySpy).toHaveBeenCalledTimes(expectedCallCount);

      const findOneFacilityCalls = externalApis.findOneFacility.mock.calls;

      const facilityIds = allFacilities.map((facility) => facility._id);

      // both deals use the same mock facilities
      const expectedCalls = [
        ...facilityIds.map((id) => [id]),
        ...facilityIds.map((id) => [id]),
      ];

      expect(findOneFacilityCalls).toEqual(expectedCalls);
    });

    it('should return deals mapped with facilities returned from API and remove items array from bondTransactions and loanTransactions', async () => {
      const result = await mapDeals(mockDeals);

      const mockDealWithoutBondsAndLoans = mockDeal;
      delete mockDealWithoutBondsAndLoans.bondTransactions;
      delete mockDealWithoutBondsAndLoans.loanTransactions;

      const expectedDealShape = {
        dealSnapshot: {
          ...mockDeal.dealSnapshot,
          bondTransactions: {},
          loanTransactions: {},
          facilities: [
            mockFindOneFacilityResponse,
            mockFindOneFacilityResponse,
          ],
        },
      };

      const expected = [
        expectedDealShape,
        expectedDealShape,
      ];

      expect(result).toEqual(expected);
    });
  });
});
