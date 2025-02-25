const MOCK_USERS = require('../../../../fixtures/users');
const CONSTANTS = require('../../../../fixtures/constants');
const EXPORTER = require('../../../../fixtures/mockExporter');

const { BANK1_MAKER1 } = MOCK_USERS;

const BASE_DEAL = {
  bank: { id: BANK1_MAKER1.bank.id },
  additionalRefName: 'Mock',
  exporter: EXPORTER.exporterOne,
};

const BSS_DEAL_BASE = {
  ...BASE_DEAL,
  dealType: CONSTANTS.DEALS.DEAL_TYPE.BSS_EWCS,
  submissionType: CONSTANTS.DEALS.SUBMISSION_TYPE.AIN,
};

const GEF_DEAL_BASE = {
  ...BASE_DEAL,
  dealType: CONSTANTS.DEALS.DEAL_TYPE.GEF,
};

const BSS_DEAL_DRAFT = {
  ...BSS_DEAL_BASE,
  status: CONSTANTS.DEALS.DEAL_STATUS.DRAFT,
  bankInternalRefName: 'Draft BSS',
};

const BSS_DEAL_READY_FOR_CHECK = {
  ...BSS_DEAL_BASE,
  status: CONSTANTS.DEALS.DEAL_STATUS.READY_FOR_APPROVAL,
  bankInternalRefName: 'Ready Check BSS',
};

const BSS_DEAL_MIA = {
  ...BSS_DEAL_BASE,
  submissionType: CONSTANTS.DEALS.SUBMISSION_TYPE.MIA,
  bankInternalRefName: 'MIA BSS',
};

const GEF_DEAL_DRAFT = {
  ...GEF_DEAL_BASE,
  status: CONSTANTS.DEALS.DEAL_STATUS.DRAFT,
  bankInternalRefName: 'Draft GEF',
};

module.exports = {
  BSS_DEAL_DRAFT,
  BSS_DEAL_READY_FOR_CHECK,
  BSS_DEAL_MIA,
  GEF_DEAL_DRAFT,
};
