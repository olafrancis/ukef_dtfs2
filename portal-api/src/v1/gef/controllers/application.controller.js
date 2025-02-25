const { ObjectId } = require('mongodb');
const db = require('../../../drivers/db-client');
const utils = require('../utils.service');
const { validateApplicationReferences, validatorStatusCheckEnums } = require('./validation/application');
const { exporterStatus } = require('./validation/exporter');
const { supportingInfoStatus } = require('./validation/supportingInfo');

const { eligibilityCriteriaStatus } = require('./validation/eligibilityCriteria');
const { isSuperUser } = require('../../users/checks');
const { getLatestCriteria: getLatestEligibilityCriteria } = require('./eligibilityCriteria.controller');

const { Application } = require('../models/application');
const { addSubmissionData } = require('./application-submit');
const api = require('../../api');
const { sendEmail } = require('../../../external-api/api');
const {
  EMAIL_TEMPLATE_IDS,
  DEAL: { DEAL_STATUS, DEAL_TYPE },
} = require('../../../constants');

const dealsCollection = 'deals';
const facilitiesCollection = 'facilities';

exports.create = async (req, res) => {
  const newDeal = {
    ...req.body,
    maker: {
      ...req.user,
      _id: String(req.user._id),
    },
  };

  const applicationCollection = await db.getCollection(dealsCollection);

  const validateErrs = validateApplicationReferences(newDeal);

  if (validateErrs) {
    return res.status(422).send(validateErrs);
  }

  const eligibility = await getLatestEligibilityCriteria();

  if (newDeal.exporter) {
    newDeal.exporter.status = exporterStatus(newDeal.exporter);

    newDeal.exporter.updatedAt = Date.now();
  }

  const response = await api.findLatestGefMandatoryCriteria();
  if (response?.data?.version) {
    newDeal.mandatoryVersionId = response.data.version;
  }

  const createdApplication = await applicationCollection.insertOne(new Application(newDeal, eligibility));

  const insertedId = String(createdApplication.insertedId);

  if (!ObjectId.isValid(insertedId)) {
    return res.status(400).send({ status: 400, message: 'Invalid Inserted Id' });
  }

  const application = await applicationCollection.findOne({
    _id: { $eq: ObjectId(insertedId) },
  });

  return res.status(201).json(application);
};

exports.getAll = async (req, res) => {
  const collection = await db.getCollection(dealsCollection);

  const doc = await collection.find({ dealType: { $eq: DEAL_TYPE.GEF } }).toArray();

  if (doc.length && doc.supportingInformation) {
    doc.supportingInformation.status = supportingInfoStatus(doc.supportingInformation);
  }

  return res.status(200).send({
    items: doc,
  });
};

exports.getById = async (req, res) => {
  const _id = req.params.id;

  if (!ObjectId.isValid(_id)) {
    return res.status(400).send({ status: 400, message: 'Invalid Deal Id' });
  }

  const collection = await db.getCollection(dealsCollection);

  const doc = await collection.findOne({ _id: { $eq: ObjectId(_id) } });

  if (doc) {
    if (doc.supportingInformation) {
      doc.supportingInformation.status = supportingInfoStatus(doc.supportingInformation);
    }

    if (doc.eligibility) {
      doc.eligibility.status = eligibilityCriteriaStatus(doc.eligibility.criteria);
    }
    return res.status(200).send(doc);
  }

  return res.status(204).send();
};

exports.getStatus = async (req, res) => {
  const _id = req.params.id;

  if (!ObjectId.isValid(_id)) {
    return res.status(400).send({ status: 400, message: 'Invalid Deal Id' });
  }

  const collection = await db.getCollection(dealsCollection);
  const doc = await collection.findOne({
    _id: { $eq: ObjectId(_id) },
  });

  if (doc) {
    return res.status(200).send({ status: doc.status });
  }

  return res.status(204).send();
};

exports.update = async (req, res) => {
  const { id } = req.params;
  if (!ObjectId.isValid(id)) {
    return res.status(400).send({ status: 400, message: 'Invalid Deal Id' });
  }

  const collection = await db.getCollection(dealsCollection);
  const update = new Application(req.body);
  const validateErrs = validateApplicationReferences(update);
  if (validateErrs) {
    return res.status(422).send(validateErrs);
  }

  // TODO: DTFS2-4987 Write unit tests for editorId
  const updateAction = {};
  if (update.editorId) {
    updateAction.$addToSet = { editedBy: update.editorId };
    delete update.editorId;
  }

  if (update.exporter) {
    update.exporter.status = exporterStatus(update.exporter);
    update.exporter.updatedAt = Date.now();
  }

  updateAction.$set = update;

  const result = await collection.findOneAndUpdate(
    { _id: { $eq: ObjectId(id) } },
    updateAction,
    { returnNewDocument: true, returnDocument: 'after' },
  );
  let response;
  if (result.value) {
    response = result.value;
  }

  return res.status(utils.mongoStatus(result)).send(response);
};

exports.updateSupportingInformation = async (req, res) => {
  const { id: dealId } = req.params;
  if (!ObjectId.isValid(dealId)) {
    return res.status(400).send({ status: 400, message: 'Invalid Deal Id' });
  }

  const { application, field, user } = req.body;
  const { _id: editorId } = user;

  const collection = await db.getCollection(dealsCollection);
  const result = await collection.findOneAndUpdate(
    { _id: { $eq: ObjectId(dealId) } },
    {
      $addToSet: { editedBy: editorId },
      // set the updatedAt property to the current time in EPOCH format
      $set: { updatedAt: Date.now() },
      // insert new documents into the supportingInformation object -> array. i.e. supportingInformation.manualInclusion
      $push: { [`supportingInformation.${field}`]: application },
    },
  );

  let response;
  if (result.value) {
    response = result.value;
  }

  return res.status(utils.mongoStatus(result)).send(response);
};

const sendStatusUpdateEmail = async (user, existingApplication, status) => {
  const { maker, status: previousStatus, bankInternalRefName, exporter } = existingApplication;

  // get maker user details
  const { firstname: firstName = '', surname = '' } = maker;

  // get exporter name
  const { companyName = '' } = exporter;

  user.bank.emails.forEach(async (email) => {
    await sendEmail(EMAIL_TEMPLATE_IDS.UPDATE_STATUS, email, {
      firstName,
      surname,
      submissionType: existingApplication.submissionType || '',
      supplierName: companyName,
      bankInternalRefName,
      currentStatus: status,
      previousStatus,
      updatedByName: `${user.firstname} ${user.surname}`,
      updatedByEmail: user.email,
    });
  });
};

exports.changeStatus = async (req, res) => {
  const dealId = req.params.id;

  if (!ObjectId.isValid(dealId)) {
    return res.status(400).send({ status: 400, message: 'Invalid Deal Id' });
  }

  const enumValidationErr = validatorStatusCheckEnums(req.body);

  if (enumValidationErr) {
    return res.status(422).send(enumValidationErr);
  }

  const collection = await db.getCollection(dealsCollection);
  const existingApplication = await collection.findOne({ _id: { $eq: ObjectId(dealId) } });
  if (!existingApplication) {
    return res.status(404).send();
  }

  const { status } = req.body;

  let applicationUpdate = { status, ...{ updatedAt: Date.now() } };

  // TODO: DTFS2-4705 - protect so that only a user with checker role and associated bank can submit to UKEF.
  if (status === DEAL_STATUS.SUBMITTED_TO_UKEF) {
    const submissionData = await addSubmissionData(dealId, existingApplication);

    applicationUpdate = {
      ...applicationUpdate,
      ...submissionData,
    };
  }

  const updatedDocument = await collection.findOneAndUpdate(
    { _id: { $eq: ObjectId(dealId) } },
    { $set: applicationUpdate },
    { returnNewDocument: true, returnDocument: 'after' },
  );

  let response;

  if (updatedDocument.value) {
    response = updatedDocument.value;

    // TODO: DTFS2-4705 - protect so that only a user with checker role and associated bank can submit to UKEF.
    if (status === DEAL_STATUS.SUBMITTED_TO_UKEF) {
      await api.tfmDealSubmit(dealId, existingApplication.dealType, req.user);
    }
  }

  // If status of correct type, send update email
  if ([DEAL_STATUS.READY_FOR_APPROVAL, DEAL_STATUS.CHANGES_REQUIRED, DEAL_STATUS.SUBMITTED_TO_UKEF].includes(status)) {
    const { user } = req;
    await sendStatusUpdateEmail(user, existingApplication, status);
  }

  return res.status(utils.mongoStatus(updatedDocument)).send(response);
};

exports.delete = async (req, res) => {
  const { id: dealId } = req.params;

  if (!ObjectId.isValid(dealId)) {
    return res.status(400).send({ status: 400, message: 'Invalid Deal Id' });
  }

  const applicationCollection = await db.getCollection(dealsCollection);
  const applicationResponse = await applicationCollection.findOneAndDelete({
    _id: { $eq: ObjectId(dealId) },
  });
  if (applicationResponse.value) {
    // remove facility information related to the application
    const query = await db.getCollection(facilitiesCollection);
    await query.deleteMany({ dealId: { $eq: ObjectId(dealId) } });
  }

  return res.status(utils.mongoStatus(applicationResponse)).send(applicationResponse.value ? applicationResponse.value : null);
};

const dealsFilters = (user, filters = []) => {
  const amendedFilters = [...filters];

  // add the bank clause if we're not a superuser
  if (!isSuperUser(user)) {
    amendedFilters.push({ 'bank.id': { $eq: user.bank.id } });
  }

  let result = {};
  if (amendedFilters.length === 1) {
    [result] = amendedFilters;
  } else if (amendedFilters.length > 1) {
    result = {
      $and: amendedFilters,
    };
  }

  return result;
};

exports.findDeals = async (requestingUser, filters, start = 0, pagesize = 0) => {
  const sanitisedFilters = dealsFilters(requestingUser, filters);

  const collection = await db.getCollection(dealsCollection);

  const doc = await collection
    .aggregate([
      { $match: { $eq: sanitisedFilters } },
      {
        $sort: {
          updatedAt: -1,
          createdAt: -1,
        },
      },
      {
        $facet: {
          count: [{ $count: 'total' }],
          deals: [{ $skip: start }, ...(pagesize ? [{ $limit: pagesize }] : [])],
        },
      },
      { $unwind: '$count' },
      {
        $project: {
          count: '$count.total',
          deals: true,
        },
      },
    ])
    .toArray();

  return doc;
};
