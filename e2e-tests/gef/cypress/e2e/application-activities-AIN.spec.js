import relative from './relativeURL';
import applicationActivities from './pages/application-activities';
import CREDENTIALS from '../fixtures/credentials.json';
import applicationDetails from './pages/application-details';
import automaticCover from './pages/automatic-cover';
import statusBanner from './pages/application-status-banner';
import applicationSubmission from './pages/application-submission';
import applicationPreview from './pages/application-preview';
import submitToUkef from './pages/submit-to-ukef';

import CONSTANTS from '../fixtures/constants';
import { toTitleCase } from '../fixtures/helpers';
import { todayFormatted, todayFormattedShort } from '../../../e2e-fixtures/dateConstants';

let deal;
let dealId;

context('Submit AIN deal and check portalActivities', () => {
  before(() => {
    cy.reinsertMocks();
    cy.apiLogin(CREDENTIALS.CHECKER)
      .then((token) => token)
      .then((token) => {
        cy.apiFetchAllApplications(token);
      })
      .then(({ body }) => {
        const { 2: ain } = body.items;
        deal = ain;
        dealId = ain._id;

        cy.login(CREDENTIALS.MAKER);
      });
  });

  describe('creates and submits AIN', () => {
    beforeEach(() => {
      cy.saveSession();
      cy.login(CREDENTIALS.MAKER);
      cy.visit(relative(`/gef/application-details/${dealId}`));
    });

    it('submits to checked as AIN', () => {
      cy.visit(relative(`/gef/application-details/${dealId}`));

      // Make the deal an Automatic Inclusion Notice
      applicationDetails.automaticCoverDetailsLink().click();
      automaticCover.automaticCoverTerm().each(($el) => {
        $el.find('[data-cy="automatic-cover-true"]').trigger('click');
      });
      automaticCover.saveAndReturnButton().click();

      applicationDetails.submitButton().click();

      applicationSubmission.submitButton().click();
    });
  });

  describe('submits to UKEF', () => {
    beforeEach(() => {
      cy.saveSession();
      cy.login(CREDENTIALS.CHECKER);
      cy.visit(relative(`/gef/application-details/${dealId}`));
    });

    it('submits detail to UKEF', () => {
      applicationPreview.submitButton().click();
      submitToUkef.confirmSubmissionCheckbox().click();
      submitToUkef.submitButton().click();
    });
  });

  describe('check portalActivity Page', () => {
    beforeEach(() => {
      cy.saveSession();
      cy.login(CREDENTIALS.MAKER);
      cy.visit(relative(`/gef/application-details/${dealId}`));
    });

    // ensures that can click between both tabs and correct info is shown
    it('check that subnavigation banner exists and that links work', () => {
      applicationActivities.subNavigationBar().should('exist');
      applicationActivities.subNavigationBarApplication().click();
      applicationPreview.mainHeading().should('exist');
      applicationActivities.activityTimeline().should('not.exist');
      applicationActivities.subNavigationBarActivities().click();
      applicationPreview.mainHeading().should('not.exist');
      applicationActivities.activityTimeline().should('exist');
    });

    // ensures that timeline has relevant information
    it('should display the activity timeline with submission information', () => {
      applicationActivities.subNavigationBarActivities().click();
      applicationActivities.activityTimeline().should('exist');
      applicationActivities.activityTimeline().contains(`${toTitleCase(CONSTANTS.DEAL_SUBMISSION_TYPE.AIN)}`);
      applicationActivities.activityTimeline().contains(`${toTitleCase(CONSTANTS.DEAL_SUBMISSION_TYPE.MIA)}`).should('not.exist');
      applicationActivities.activityTimeline().contains(todayFormatted);
      applicationActivities.activityTimeline().contains(CREDENTIALS.CHECKER.firstname);
    });

    // ensures that banner is populated correctly
    it('should display the blue status banner', () => {
      applicationActivities.subNavigationBarActivities().click();
      statusBanner.applicationBanner().should('exist');
      statusBanner.bannerDateCreated().contains(todayFormattedShort);
      statusBanner.bannerDateSubmitted().contains(todayFormattedShort);
      statusBanner.bannerCreatedBy().contains(deal.maker.firstname);
      statusBanner.bannerCheckedBy().contains(CREDENTIALS.CHECKER.firstname);
      statusBanner.bannerSubmissionType().contains(CONSTANTS.DEAL_SUBMISSION_TYPE.AIN);
    });
  });
});
