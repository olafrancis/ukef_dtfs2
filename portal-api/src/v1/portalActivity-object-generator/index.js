const { getUnixTime } = require('date-fns');

const portalActivityGenerator = (activityParams) => {
  const {
    type,
    user,
    activityType,
    activityText,
    activityHTML,
    facility,
    maker,
    checker,
  } = activityParams;

  const userToAdd = {
    firstName: user.firstname,
    lastName: user.surname,
    _id: user._id,
  };

  const portalActivityObj = {
    type: activityType,
    timestamp: getUnixTime(new Date()),
    author: userToAdd,
    text: activityText,
    label: type,
    html: activityHTML,
    facilityType: facility ? `${facility.type} facility` : '',
    ukefFacilityId: facility ? facility.ukefFacilityId : '',
    facilityId: facility ? facility._id : '',
    maker,
    checker,
  };

  return portalActivityObj;
};

module.exports = portalActivityGenerator;
