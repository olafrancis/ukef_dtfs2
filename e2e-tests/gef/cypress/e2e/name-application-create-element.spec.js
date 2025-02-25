import relative from './relativeURL';
import mandatoryCriteria from './pages/mandatory-criteria';
import nameApplication from './pages/name-application';
import CREDENTIALS from '../fixtures/credentials.json';

context('Name Application Page - Add element to page', () => {
  before(() => {
    cy.reinsertMocks();

    cy.login(CREDENTIALS.MAKER);
  });

  beforeEach(() => {
    cy.saveSession();
    cy.visit(relative('/gef/mandatory-criteria'));
    mandatoryCriteria.trueRadio().click();
    mandatoryCriteria.form().submit();
  });

  it("should not add added element's data to page", () => {
    nameApplication.internalRef().type('NEW-REF-NAME');

    // adds extra populated text input element to page
    cy.insertElement('name-application-form');

    nameApplication.form().submit();

    // gets url and gets dealId from url
    cy.url().then((url) => {
      const urlSplit = url.split('/');

      const dealId = urlSplit[5];

      // gets deal
      cy.getApplicationById(dealId).then((deal) => {
        // checks extra field has not been added to the deal object
        expect(deal.intruder).to.be.an('undefined');
      });
    });
  });
});
