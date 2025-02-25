const DEFAULTS = require('../defaults');
const { findLatestMandatoryCriteria } = require('./mandatoryCriteria.controller');
const { findOneDeal, createDeal, createDealEligibility } = require('./deal.controller');
const { getCloneDealErrors } = require('../validation/clone-bss-deal');
const facilitiesController = require('./facilities.controller');
const CONSTANTS = require('../../constants');

const CLONE_BOND_FIELDS = [
  'type',
  'facilityStage',
  'requestedCoverStartDate',
  'coverEndDate-day',
  'coverEndDate-month',
  'coverEndDate-year',
  'value',
  'currencySameAsSupplyContractCurrency',
  'currency',
  'conversionRate',
  'conversionRateDate-day',
  'conversionRateDate-month',
  'conversionRateDate-year',
  'name',
  'ukefGuaranteeInMonths',
];

const CLONE_LOAN_FIELDS = [
  'type',
  'name',
  'value',
  'currency',
  'currencySameAsSupplyContractCurrency',
  'conversionRate',
  'conversionRateDate-day',
  'conversionRateDate-month',
  'conversionRateDate-year',
  'disbursementAmount',
  'requestedCoverStartDate',
  'coverEndDate-day',
  'coverEndDate-month',
  'coverEndDate-year',
  'ukefGuaranteeInMonths',
];

const stripTransaction = (transaction, allowedFields) => {
  const stripped = {};

  Object.keys(transaction).forEach((key) => {
    if (allowedFields.includes(key)) {
      stripped[key] = transaction[key];
    }
  });

  return stripped;
};

exports.clone = async (req, res) => {
  await findOneDeal(req.params.id, async (existingDeal) => {
    if (!existingDeal) {
      return res.status(404).send();
    }

    const { bankInternalRefName, additionalRefName, cloneTransactions } = req.body;

    const { _id, previousStatus, tfm, ...existingDealWithoutCertainFields } = existingDeal;
    delete existingDealWithoutCertainFields.dataMigration;
    if (existingDealWithoutCertainFields?.submissionDetails?.v1Status) {
      delete existingDealWithoutCertainFields.submissionDetails.v1Status;
    }

    if (existingDealWithoutCertainFields.submissionType) {
      delete existingDealWithoutCertainFields.submissionType;
    }

    const modifiedDeal = {
      ...existingDealWithoutCertainFields,
      status: DEFAULTS.DEAL.status,
      updatedAt: existingDeal.updatedAt,
      bankInternalRefName,
      additionalRefName,
      bank: existingDeal.bank,
      details: {
        maker: req.user,
      },
      mandatoryCriteria: await findLatestMandatoryCriteria(),
      eligibility: await createDealEligibility(),
      editedBy: [],
      comments: [],
      ukefComments: [],
      ukefDecision: [],
      bondTransactions: DEFAULTS.DEAL.bondTransactions,
      loanTransactions: DEFAULTS.DEAL.loanTransactions,
      facilities: DEFAULTS.DEAL.facilities,
      supportingInformation: {},
      clonedDealId: existingDeal._id,
    };

    if (modifiedDeal.submissionType === CONSTANTS.DEAL.SUBMISSION_TYPE.MIN) {
      modifiedDeal.submissionType = CONSTANTS.DEAL.SUBMISSION_TYPE.MIA;
    }

    const validationErrors = getCloneDealErrors(modifiedDeal, cloneTransactions);

    if (validationErrors) {
      return res.status(400).send({
        ...modifiedDeal,
        validationErrors,
      });
    }

    const { data: createdDeal } = await createDeal(modifiedDeal, req.user);

    const createdDealId = createdDeal._id;

    if (cloneTransactions === 'true') {
      const hasBonds = existingDeal.bondTransactions.items.length > 0;
      const hasLoans = existingDeal.loanTransactions.items.length > 0;

      if (hasBonds || hasLoans) {
        const facilities = [...existingDeal.bondTransactions.items, ...existingDeal.loanTransactions.items];

        const strippedFacilities = facilities.map((facility) => {
          if (facility.type === CONSTANTS.FACILITIES.FACILITY_TYPE.BOND) {
            return stripTransaction(facility, CLONE_BOND_FIELDS);
          }

          if (facility.type === CONSTANTS.FACILITIES.FACILITY_TYPE.LOAN) {
            return stripTransaction(facility, CLONE_LOAN_FIELDS);
          }
          return facility;
        });

        await facilitiesController.createMultipleFacilities(strippedFacilities, createdDealId, req.user);
      }
    }

    return res.status(200).send(createdDeal);
  });
};
