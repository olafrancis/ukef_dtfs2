const changePassword = {
  currentPassword: () => cy.get('[data-cy="current-password"]'),
  currentPasswordError: () => cy.get('#currentPassword-error'),
  password: () => cy.get('[data-cy="password"]'),
  passwordError: () => cy.get('#password-error'),
  confirmPassword: () => cy.get('[data-cy="confirmPassword"]'),
  passwordConfirmError: () => cy.get('#passwordConfirm-error'),
  submit: () => cy.get('[data-cy="profile-change-password-submit"]'),
  cancel: () => cy.get('[data-cy="profile-change-password-cancel"]'),
};

module.exports = changePassword;
