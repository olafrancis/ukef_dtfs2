const { ObjectId } = require('mongodb');
const db = require('../../../drivers/db-client');
const utils = require('../utils.service');
const { facilitiesValidation, facilitiesStatus, facilitiesOverallStatus, facilitiesCheckEnums } = require('./validation/facilities');
const { Facility } = require('../models/facilities');
const { Application } = require('../models/application');
const { calculateUkefExposure, calculateGuaranteeFee } = require('../calculations/facility-calculations');
const { InvalidDatabaseQueryError } = require('../../errors/invalid-database-query.error');

const facilitiesCollectionName = 'facilities';
const dealsCollectionName = 'deals';

exports.create = async (req, res) => {
  const enumValidationErr = facilitiesCheckEnums(req.body);
  if (!req.body.type || !req.body.dealId) {
    return res.status(422).send([{ status: 422, errCode: 'MANDATORY_FIELD', errMsg: 'No Application ID and/or facility type sent with request' }]);
  }

  if (enumValidationErr) {
    return res.status(422).send(enumValidationErr);
  }

  const facilitiesQuery = await db.getCollection(facilitiesCollectionName);
  const createdFacility = await facilitiesQuery.insertOne(new Facility(req.body));

  const { insertedId } = createdFacility;

  if (!ObjectId.isValid(insertedId)) {
    return res.status(400).send({ status: 400, message: 'Invalid Inserted Id' });
  }

  const facility = await facilitiesQuery.findOne({
    _id: { $eq: ObjectId(insertedId) },
  });

  const response = {
    status: facilitiesStatus(facility),
    details: facility,
    validation: facilitiesValidation(facility),
  };
  return res.status(201).json(response);
};

const getAllFacilitiesByDealId = async (dealId) => {
  const collection = await db.getCollection(facilitiesCollectionName);
  if (!dealId) {
    // TODO SR-8: This is required to preserve existing behaviour and allow tests to pass, but seems like a bug.
    return collection.find().toArray();
  }

  if (!ObjectId.isValid(dealId)) {
    throw new InvalidDatabaseQueryError('Invalid deal id');
  }
  const doc = await collection.find({ dealId: { $eq: ObjectId(dealId) } }).toArray();

  return doc;
};
exports.getAllFacilitiesByDealId = getAllFacilitiesByDealId;

exports.getAllGET = async (req, res) => {
  let doc;

  if (req.query && req.query.dealId) {
    try {
      doc = await getAllFacilitiesByDealId(req.query.dealId);
    } catch (error) {
      if (error instanceof InvalidDatabaseQueryError) {
        console.error(error);
        return res.status(400).send({ status: 400, message: 'Invalid Deal Id' });
      }

      throw error;
    }
  }

  const facilities = [];

  if (doc && doc.length) {
    doc.forEach((item) => {
      facilities.push({
        status: facilitiesStatus(item),
        details: item,
        validation: facilitiesValidation(item),
      });
    });
  }

  return res.status(200).send({
    status: facilitiesOverallStatus(facilities),
    items: facilities,
  });
};

exports.getById = async (req, res) => {
  if (!ObjectId.isValid(String(req.params.id))) {
    return res.status(400).send({ status: 400, message: 'Invalid Facility Id' });
  }

  const collection = await db.getCollection(facilitiesCollectionName);
  const doc = await collection.findOne({ _id: { $eq: ObjectId(String(req.params.id)) } });
  if (doc) {
    return res.status(200).send({
      status: facilitiesStatus(doc),
      details: doc,
      validation: facilitiesValidation(doc),
    });
  }

  return res.status(204).send();
};

const update = async (id, updateBody) => {
  try {
    const collection = await db.getCollection(facilitiesCollectionName);
    const dbQuery = await db.getCollection(dealsCollectionName);

    const facilityId = ObjectId(String(id));

    if (!ObjectId.isValid(facilityId)) {
      throw new Error('Invalid Facility Id');
    }

    const existingFacility = await collection.findOne({ _id: { $eq: facilityId } });
    const facilityUpdate = new Facility({
      ...updateBody,
      ukefExposure: calculateUkefExposure(updateBody, existingFacility),
      guaranteeFee: calculateGuaranteeFee(updateBody, existingFacility),
    });

    const updatedFacility = await collection.findOneAndUpdate(
      { _id: { $eq: facilityId } },
      { $set: facilityUpdate },
      { returnNewDocument: true, returnDocument: 'after' },
    );

    if (existingFacility) {
      // update facilitiesUpdated timestamp in the deal
      const dealUpdateObj = {
        facilitiesUpdated: new Date().valueOf(),
      };
      const dealUpdate = new Application(dealUpdateObj);

      await dbQuery.findOneAndUpdate(
        { _id: { $eq: ObjectId(existingFacility.dealId) } },
        { $set: dealUpdate },
        { returnNewDocument: true, returnDocument: 'after' },
      );
    }
    return updatedFacility;
  } catch (error) {
    console.error('Unable to update the facility %s', error);
    return false;
  }
};
exports.update = update;

exports.updatePUT = async (req, res) => {
  const enumValidationErr = facilitiesCheckEnums(req.body);
  if (enumValidationErr) {
    return res.status(422).send(enumValidationErr);
  }

  let response;
  const updatedFacility = await update(req.params.id, req.body);

  if (updatedFacility.value) {
    response = {
      status: facilitiesStatus(updatedFacility.value),
      details: updatedFacility.value,
      validation: facilitiesValidation(updatedFacility.value),
    };
  }

  return res.status(utils.mongoStatus(updatedFacility)).send(response);
};

exports.delete = async (req, res) => {
  if (!ObjectId.isValid(req.params.id)) {
    return res.status(400).send({ status: 400, message: 'Invalid Facility Id' });
  }

  const collection = await db.getCollection(facilitiesCollectionName);
  const response = await collection.findOneAndDelete({ _id: { $eq: ObjectId(req.params.id) } });
  return res.status(utils.mongoStatus(response)).send(response.value ? response.value : null);
};

exports.deleteByDealId = async (req, res) => {
  const { dealId } = req.query;

  if (typeof dealId !== 'string') {
    return res.status(400).send({ status: 400, message: 'Invalid Deal Id' });
  }

  const collection = await db.getCollection(facilitiesCollectionName);
  const response = await collection.deleteMany({ dealId: { $eq: dealId } });
  return res.status(200).send(response);
};
