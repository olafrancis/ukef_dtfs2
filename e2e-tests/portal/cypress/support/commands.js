import 'cypress-file-upload';

// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add("login", (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add("drag", { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add("dismiss", { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite("visit", (originalFn, url, options) => { ... })

const { downloadFile } = require('./portal-api/fileshare');

// Preserve session cookie
Cypress.Commands.add('saveSession', require('./utils/saveSession'));
// create an element in a div
Cypress.Commands.add('insertElement', require('./utils/insertElement'));

// commands used to interact directly with portal-api
Cypress.Commands.add('insertOneDeal', require('./portal-api/insertOneDeal'));
Cypress.Commands.add('getDeal', require('./portal-api/getDeal'));
Cypress.Commands.add('getFacility', require('./portal-api/getBSSFacility'));
Cypress.Commands.add('updateDeal', require('./portal-api/updateDeal'));
Cypress.Commands.add('insertManyDeals', require('./portal-api/insertManyDeals'));
Cypress.Commands.add('deleteDeals', require('./portal-api/deleteDeals'));

Cypress.Commands.add('getAllFeedback', require('./portal-api/getAllFeedback'));

// commands used to interact with GEF (via portal-api)
Cypress.Commands.add('deleteGefApplications', require('./portal-api/deleteGefApplications'));
Cypress.Commands.add('insertOneGefApplication', require('./portal-api/insertOneGefApplication'));
Cypress.Commands.add('insertManyGefApplications', require('./portal-api/insertManyGefApplications'));
Cypress.Commands.add('updateGefApplication', require('./portal-api/updateGefApplication'));
Cypress.Commands.add('setGefApplicationStatus', require('./portal-api/setGefApplicationStatus'));
Cypress.Commands.add('deleteGefFacilities', require('./portal-api/deleteGefFacilities'));
Cypress.Commands.add('insertOneGefFacility', require('./portal-api/insertOneGefFacility'));
Cypress.Commands.add('insertManyGefFacilities', require('./portal-api/insertManyGefFacilities'));
Cypress.Commands.add('updateGefFacility', require('./portal-api/updateGefFacility'));

Cypress.Commands.add('downloadFile', downloadFile);
Cypress.Commands.add('removeUserIfPresent', require('./portal-api/removeUserIfPresent'));
Cypress.Commands.add('listAllUsers', require('./portal-api/listAllUsers'));

Cypress.Commands.add('updateBond', require('./portal-api/updateBond'));
Cypress.Commands.add('updateLoan', require('./portal-api/updateLoan'));
Cypress.Commands.add('createFacilities', require('./portal-api/createFacilities'));

// commands that abstract common tasks you might perform while clicking round the portal..
Cypress.Commands.add('addBondToDeal', require('./portal/addBondToDeal'));
Cypress.Commands.add('addLoanToDeal', require('./portal/addLoanToDeal'));
Cypress.Commands.add('createADeal', require('./portal/createADeal'));
Cypress.Commands.add('createBSSSubmission', require('./portal/createBSSSubmission'));
Cypress.Commands.add('enterUsernameAndPassword', require('./portal/enterUsernameAndPassword'));
Cypress.Commands.add('login', require('./portal/login'));
Cypress.Commands.add('loginGoToDealPage', require('./portal/loginGoToDealPage'));
Cypress.Commands.add('overrideUserSignInTokenByUsername', require('./portal/overrideUserSignInTokenByUsername'));
Cypress.Commands.add('passRedLine', require('./portal/passRedLine'));
Cypress.Commands.add('renameDeal', require('./portal/renameDeal'));
Cypress.Commands.add('userSetPassword', require('./portal/userSetPassword'));

// commands that add/edit facilities directly in central API
Cypress.Commands.add('deleteFacility', require('./central-api/deleteFacility'));

Cypress.Commands.add('submitDeal', require('./trade-finance-manager-api/submitDeal'));
