const { submitDeal, submitDealAfterUkefIds, login } = require('./api');

module.exports = (deals, opts) => {
  console.info('submitManyDeals::');
  const persistedDeals = [];
  const { username, password } = opts;

  deals.forEach((dealToInsert) => {
    login(username, password).then((token) =>
      submitDeal(dealToInsert._id, dealToInsert.dealType, token).then(() => {
      // eslint-disable-next-line consistent-return
        submitDealAfterUkefIds(dealToInsert._id, dealToInsert.dealType, null, token).then((deal) => {
          persistedDeals.push(deal);
          if (persistedDeals.length === deals.length) {
            return persistedDeals;
          }
        });
      }));
  });
};
