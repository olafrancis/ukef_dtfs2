const db = require('../../../../drivers/db-client');

const createDeal = async (deal) => {
  const collection = await db.getCollection('deals');

  const response = await collection.insertOne(deal);

  const { insertedId } = response;

  return {
    _id: insertedId,
  };
};

exports.createDealPost = async (req, res) => {
  const deal = req?.body;

  if (typeof deal?.dealType !== 'string') {
    return res.status(400).send({ status: 400, message: 'Invalid deal type' });
  }

  const createdDeal = await createDeal(deal);

  return res.status(200).send(createdDeal);
};
