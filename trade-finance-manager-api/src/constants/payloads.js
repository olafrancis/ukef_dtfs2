const BANK = {
  id: String,
  name: String,
  mga: Object,
  emails: Object,
  companiesHouseNo: String,
  partyUrn: String,
};

const PORTAL = {
  USER: {
    username: String,
    password: String,
    firstname: String,
    surname: String,
    email: String,
    timezone: String,
    roles: Object,
    bank: Object,
  },
};

const TFM = {
  USER: {
    username: String,
    email: String,
    salt: String,
    hash: String,
    teams: Object,
    timezone: String,
    firstName: String,
    lastName: String,
    status: String,
  },
  TEAM: {
    id: String,
    name: String,
    email: String,
  }
};

module.exports = {
  BANK,
  PORTAL,
  TFM,
};
