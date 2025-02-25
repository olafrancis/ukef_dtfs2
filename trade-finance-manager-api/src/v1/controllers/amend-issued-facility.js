const api = require('../api');
const CONSTANTS = require('../../constants');
const getGuaranteeDates = require('../helpers/get-guarantee-dates');
const { mapCashContingentFacility } = require('../mappings/map-submitted-deal/map-cash-contingent-facility');
const { mapBssEwcsFacility } = require('../mappings/map-submitted-deal/map-bss-ewcs-facility');
const { formatDate } = require('../../utils/date');

/**
 * Amend TFM properties of issued facility.
 * 1. Guarantee dates (tfm.facilityGuaranteeDates)
 * 2. Premium Schedule (BSS/EWCS) / Fixed Fee (GEF) (tfm.premiumSchedule / tfm.feeRecord)
 * 3. Exposure period (tfm.exposurePeriodInMonths)
 * 4. UKEF Exposure (tfm.ukefExposure / tfm.ukefExposureCalculationTimestamp)
 * @param {Object} amendment Amendment object
 * @param {Object} facility Facility object
 * @param {Object} deal TFM deal object
 * @returns {Boolean} Boolean upon execution
 */
const amendIssuedFacility = async (amendment, facility, deal) => {
  try {
    if (amendment && facility && deal) {
      const {
        changeCoverEndDate,
        changeFacilityValue,
        coverEndDate,
        value,
        tfm: amendmentTfm,
      } = amendment;
      const { dealType } = deal.dealSnapshot;
      let submissionDate;
      const { facilitySnapshot, tfm } = facility;
      let history = [];
      let facilityTfmUpdate;
      let { facilityGuaranteeDates } = tfm;
      let amendedFacility = {
        ...facility,
        ...facilitySnapshot,
      };

      // Delete frivolous properties
      delete amendedFacility.facilitySnapshot;
      delete amendedFacility.amendments;

      // Set submission date
      if (dealType === CONSTANTS.DEALS.DEAL_TYPE.BSS_EWCS) {
        const { details } = deal.dealSnapshot;
        submissionDate = details.submissionDate;
      } else if (dealType === CONSTANTS.DEALS.DEAL_TYPE.GEF) {
        submissionDate = deal.dealSnapshot.submissionDate;
      }

      // Amend `facility` and `facility.tfm`
      if (amendmentTfm) {
        // Set pre-calculated amendment TFM properties (facility.tfm)
        const { amendmentExposurePeriodInMonths, exposure } = amendmentTfm;

        // Extrapolate and delete history object (tfm.history)
        if (tfm.history) {
          history = Object.values(tfm.history);
          delete tfm.history;
        }

        facilityTfmUpdate = {
          ...tfm,
          exposurePeriodInMonths: amendmentExposurePeriodInMonths,
          ukefExposure: exposure.ukefExposureValue,
          ukefExposureCalculationTimestamp: String(exposure.timestamp),
        };

        /**
         * Amend facility object (stored in a temporary variable)
         * `facility` (amendedFacility) parent object is not updated in the DB,
         * however `facility.tfm` (facilityTfmUpdate) child object is updated in the DB.
         */

        // Facility value
        if (changeFacilityValue) {
          amendedFacility = {
            ...amendedFacility,
            ukefExposure: exposure.ukefExposureValue,
            value,
          };
        }

        // Facility cover end date
        if (changeCoverEndDate) {
          // Convert non ms-EPOCH to ms-EPOCH
          const coverEndDateMs = coverEndDate * 1000;

          if (dealType === CONSTANTS.DEALS.DEAL_TYPE.BSS_EWCS) {
            const expiryDate = formatDate(coverEndDateMs).split('-');

            amendedFacility = {
              ...amendedFacility,
              'coverEndDate-day': expiryDate[2],
              'coverEndDate-month': expiryDate[1],
              'coverEndDate-year': expiryDate[0],
            };
          } else {
            amendedFacility = {
              ...amendedFacility,
              coverEndDate: new Date(coverEndDateMs),
            };
          }
        }

        // Map facility
        if (dealType === CONSTANTS.DEALS.DEAL_TYPE.BSS_EWCS) {
          amendedFacility = mapBssEwcsFacility(amendedFacility);
        } else if (dealType === CONSTANTS.DEALS.DEAL_TYPE.GEF) {
          amendedFacility = mapCashContingentFacility(amendedFacility);
        }

        if (changeCoverEndDate) {
        // facility.tfm.facilityGuaranteeDates
          facilityGuaranteeDates = getGuaranteeDates(amendedFacility, submissionDate);
          facilityTfmUpdate = {
            ...facilityTfmUpdate,
            facilityGuaranteeDates,
          };
        }

        // facility.tfm.feeRecord or facility.tfm.premiumSchedule
        // TO-DO DTFS2-4614 & DTFS2-5201: De-comment below upon PS/FF BR completion.

        // Save TFM in `tfm.history`
        history.push(tfm);
        facilityTfmUpdate = {
          ...facilityTfmUpdate,
          history,
        };

        // Updated `facility.tfm` property
        await api.updateFacility(facility._id, facilityTfmUpdate);
      }

      return true;
    }

    throw new Error('Amend issued facility - Void argument sets provided');
  } catch (error) {
    console.error('Error amending issued facility TFM properties: %s', error);
    return false;
  }
};

module.exports = {
  amendIssuedFacility,
};
