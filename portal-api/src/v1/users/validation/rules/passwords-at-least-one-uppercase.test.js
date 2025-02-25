const passwordAtLeastOneUppercase = require('./passwordAtLeastOneUppercase');

const user = {
  hash: 'mock_hash',
  salt: 'mock_salt',
};

describe('at least 1 uppercase', () => {
  it('should return error for passwords without uppercase', () => {
    const change = {
      password: 'aaaaa',
    };

    const expectedResult = [{
      password: {
        order: '5',
        text: 'Your password must contain at least one upper-case character.',
      },
    }];

    const matchTest = passwordAtLeastOneUppercase(user, change);
    expect(matchTest).toEqual(expectedResult);
  });

  it('should not return error for passwords with uppercase', () => {
    const change = {
      password: 'Aaaa',
    };

    const matchTest = passwordAtLeastOneUppercase(user, change);
    expect(matchTest).toEqual([]);
  });

  it('should not return error if no change', () => {
    const matchTest = passwordAtLeastOneUppercase(user, '');
    expect(matchTest).toEqual([]);
  });
});
