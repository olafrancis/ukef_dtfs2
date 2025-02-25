const relative = require('../../../relativeURL');
const {
  ADMIN,
  BANK1_MAKER1,
  BANK1_CHECKER1,
  BANK1_READ_ONLY1,
} = require('../../../../fixtures/users');

context('Only allow authorised users to access admin pages', () => {
  it('should allow admins access to restricted pages', () => {
    cy.login(ADMIN);
    cy.visit('/admin/users/');
    cy.url().should('eq', relative('/admin/users/'));
  });

  const unauthorisedRoles = [{
    roleName: 'Makers',
    userWithRole: BANK1_MAKER1,
    expectedRedirectLocation: '/dashboard/deals/0',
  }, {
    roleName: 'Checkers',
    userWithRole: BANK1_CHECKER1,
    expectedRedirectLocation: '/dashboard/deals/0',
  }, {
    roleName: 'Read Only users',
    userWithRole: BANK1_READ_ONLY1,
    expectedRedirectLocation: '/dashboard/deals/0',
  }];

  unauthorisedRoles.forEach(({ roleName, userWithRole, expectedRedirectLocation }) => {
    it(`should NOT allow ${roleName} access to restricted pages`, () => {
      cy.login(userWithRole);
      cy.visit('/admin/users/');
      cy.url().should('eq', relative(expectedRedirectLocation));
    });
  });
});
