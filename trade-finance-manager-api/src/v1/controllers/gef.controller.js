const { ObjectId } = require('bson');
const db = require('../../drivers/db-client');

const updateGefApplication = async (dealId, applicationUpdate) => {
  const collection = await db.getCollection('deals');

  if (!ObjectId.isValid(dealId)) {
    throw new Error('Invalid Deal Id');
  }

  const updatedApplication = await collection.findOneAndUpdate(
    { _id: { $eq: ObjectId(String(dealId)) } },
    {
      $set: applicationUpdate,
    },
    { returnNewDocument: true, returnDocument: 'after' },
  );

  return updatedApplication;
};

const updateGefFacility = async (facilityId, facilityUpdate) => {
  const collection = await db.getCollection('facilities');

  if (!ObjectId.isValid(facilityId)) {
    throw new Error('Invalid Facility Id');
  }

  const updatedFacility = await collection.findOneAndUpdate(
    { _id: { $eq: ObjectId(facilityId) } },
    {
      $set: facilityUpdate,
    },
    { returnNewDocument: true, returnDocument: 'after' },
  );

  return updatedFacility;
};

module.exports = {
  updateGefApplication,
  updateGefFacility,
};
