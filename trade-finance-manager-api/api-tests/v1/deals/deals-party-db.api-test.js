const { mockUpdateDeal } = require('../../../src/v1/__mocks__/common-api-mocks');
const { addPartyUrns } = require('../../../src/v1/controllers/deal.party-db');
const MOCK_DEAL = require('../../../src/v1/__mocks__/mock-deal');
const api = require('../../../src/v1/api');

describe('add partyUrn to deal', () => {
  beforeEach(() => {
    api.updateDeal.mockReset();
    mockUpdateDeal();
  });

  it('should return false when no deal passed as parameter', async () => {
    mockUpdateDeal();

    const noDeal = await addPartyUrns();
    expect(noDeal).toEqual(false);
  });

  it('should return false when companies house no is not given', async () => {
    mockUpdateDeal();

    const deal = {
      ...MOCK_DEAL,
      exporter: {
        companiesHouseRegistrationNumber: '',
      },
    };

    const noCompaniesHouse = await addPartyUrns(deal);
    expect(noCompaniesHouse.tfm.parties.exporter.partyUrn).toEqual('');
  });

  it('should return false when companies house no is not matched', async () => {
    mockUpdateDeal();

    const deal = {
      ...MOCK_DEAL,
      exporter: {
        companiesHouseRegistrationNumber: 'NO_MATCH',
      },
    };

    const noMatch = await addPartyUrns(deal);
    expect(noMatch.tfm.parties.exporter.partyUrn).toEqual('');
  });

  it('should return the deal with partyUrn is successfully matched', async () => {
    mockUpdateDeal();

    const deal = {
      ...MOCK_DEAL,
      exporter: {
        companiesHouseRegistrationNumber: 'MATCH',
      },
    };

    const match = await addPartyUrns(deal);
    expect(match.tfm.parties.exporter.partyUrn).toEqual('testPartyUrn');
  });

  it('should retain existing tfm data', async () => {
    mockUpdateDeal();

    const deal = {
      ...MOCK_DEAL,
      exporter: {
        companiesHouseRegistrationNumber: 'MATCH',
      },
      tfm: {
        mockField: 'mock data',
      },
    };

    const match = await addPartyUrns(deal);
    expect(match.tfm).toMatchObject(deal.tfm);
  });
});
