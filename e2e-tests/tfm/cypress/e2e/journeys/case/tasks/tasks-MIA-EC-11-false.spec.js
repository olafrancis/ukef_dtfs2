import relative from '../../../relativeURL';
import partials from '../../../partials';
import pages from '../../../pages';
import MOCK_DEAL_MIA_EC_11_FALSE from '../../../../fixtures/deal-MIA-EC-11-false';
import { BUSINESS_SUPPORT_USER_1 } from '../../../../../../e2e-fixtures';
import { MOCK_MAKER_TFM, ADMIN_LOGIN } from '../../../../fixtures/users-portal';

context('Case tasks - MIA deal - EC 11 false', () => {
  let dealId;
  const dealFacilities = [];

  beforeEach(() => {
    cy.insertOneDeal(MOCK_DEAL_MIA_EC_11_FALSE, MOCK_MAKER_TFM).then((insertedDeal) => {
      dealId = insertedDeal._id;

      const { dealType, mockFacilities } = MOCK_DEAL_MIA_EC_11_FALSE;

      cy.createFacilities(dealId, mockFacilities, MOCK_MAKER_TFM).then((createdFacilities) => {
        dealFacilities.push(...createdFacilities);
      });

      cy.submitDeal(dealId, dealType, BUSINESS_SUPPORT_USER_1);

      cy.login(BUSINESS_SUPPORT_USER_1);
      cy.visit(relative(`/case/${dealId}/deal`));
    });
  });

  after(() => {
    cy.deleteDeals(dealId, ADMIN_LOGIN);
    dealFacilities.forEach((facility) => {
      cy.deleteFacility(facility._id, MOCK_MAKER_TFM);
    });
  });

  it('should render all MIA task groups and tasks - with additional `Complete an agent check` task', () => {
    partials.caseSubNavigation.tasksLink().click();
    cy.url().should('eq', relative(`/case/${dealId}/tasks`));

    pages.tasksPage.filterRadioAllTasks().click();

    const TOTAL_MIA_TASK_GROUPS = 4;
    pages.tasksPage.taskGroupTable().should('have.length', TOTAL_MIA_TASK_GROUPS);

    const TOTAL_MIA_TASKS = 14;
    pages.tasksPage.tasksTableRows().should('have.length', TOTAL_MIA_TASKS);

    const fourthTask = pages.tasksPage.tasks.row(1, 4);

    fourthTask.title().invoke('text').then((text) => {
      expect(text.trim()).to.equal('Complete an agent check');
    });
  });
});
