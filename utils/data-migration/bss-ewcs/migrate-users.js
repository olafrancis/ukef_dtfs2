const fs = require('fs');
const moment = require('moment');
const args = require('minimist')(process.argv.slice(2));
const generator = require('generate-password');
const api = require('../api');
const { getToken, removeMigrationUser } = require('../temporary-token-handler');
const consoleLogColor = require('./helpers/console-log-colour');
const { ROLES: { MAKER, CHECKER } } = require('../constant');

const { file, bankId } = args;

console.info(`Importing bankId ${bankId} from ${file}`);

const loadUsersFromFile = () => {
  const jsonBuffer = fs.readFileSync(file);
  return JSON.parse(jsonBuffer);
};

const generateRoles = (v1Role) => {
  if (v1Role === 'Maker/Checker') {
    return [MAKER, CHECKER];
  }

  return [v1Role.toLowerCase()];
};

const apiSummary = (createdUsers) => ({
  successUsers: createdUsers.filter((createdUser) => createdUser.success).map(({ user }) => user.username),
  apiUserErrors: createdUsers.filter((createdUser) => !createdUser.success).map(({ username }) => username),
});

const teardown = async (logData, token) => {
  // remove migration user
  await removeMigrationUser(token);

  // log file
  const logFolder = './logs';
  const logFilename = `${logFolder}/user-migrate-log_${moment().unix()}.json`;

  if (!fs.existsSync(logFolder)) {
    fs.mkdirSync(logFolder);
  }

  fs.writeFileSync(logFilename, logData);
  console.info(`Log file written to ${logFilename}`);
};

const migrateUsers = async () => {
  const token = await getToken();
  const existingUsers = await api.listUsers(token);
  const banks = await api.listBanks(token);

  const existingUsersList = existingUsers.map(({ username }) => username);
  const userNoBanksError = [];

  const usersV1 = loadUsersFromFile();
  const usersV1Bank = bankId ? usersV1.filter(({ bankID }) => bankID === bankId.toString()) : usersV1;
  const importBank = bankId ? banks.find((b) => b.id === bankId.toString()) : { name: 'All banks' };

  const usersV2 = usersV1Bank.map((userV1) => {
    const bank = banks.find((b) => b.id === userV1.Bank_id);
    const password = generator.generate({
      length: 20,
      numbers: true,
      symbols: false,
      lowercase: true,
      uppercase: true,
    });
    if (!bank) {
      console.info({ banks, bankId: userV1.Bank_id });
      userNoBanksError.push(userV1.Mail);
      consoleLogColor(`unknown bank: ${userV1.Mail}`);
      return {};
    }

    const userV2 = {
      dataMigrationInfo: {
        v1_ID: userV1.User_id,
      },
      'user-status': 'active',
      timezone: 'Europe/London',
      username: userV1.Mail,
      firstname: userV1.First_name,
      surname: userV1.Last_name,
      email: userV1.Mail,
      roles: generateRoles(userV1.Roles),
      bank: {
        id: userV1.Bank_id,
        name: bank.name,
        emails: bank.emails,
      },
      disabled: userV1.Disabled === 'Disabled',
      password: `AbC!2345_${password}`,
    };

    const lastLogin = moment(userV1.Last_login, 'DD/MM/YYYY - hh:mm').utc().valueOf().toString();

    if (userV1.Last_login !== '01/01/1970 - 01:00') {
      userV2.lastLogin = lastLogin;
    }

    return userV2;
  });

  console.info('creating users');
  const existingUserErrors = [];
  const createUserPromises = [];

  usersV2.filter(({ username }) => username).forEach(async (user) => {
    if (existingUsersList.includes(user.username)) {
      consoleLogColor(`duplicate user: ${user.username}`);
      existingUserErrors.push(user.username);
      return;
    }
    const userCreate = api.createUser(user, token).then((createResult) => {
      if (createResult.success) {
        consoleLogColor(`created user: ${createResult.user.username}`, 'green');
      } else {
        consoleLogColor(`error creating user: ${createResult.username}`);
      }
      return createResult;
    });
    createUserPromises.push(userCreate);
  });

  const userCreate = await Promise.all(createUserPromises);

  const { successUsers, apiUserErrors } = apiSummary(userCreate);

  console.info('\n--------------');
  console.info('USER MIGRATION SUMMARY\n');

  consoleLogColor(`Created ${successUsers.length}/${usersV1Bank.length} '${importBank.name}' users from a total list of ${usersV1.length}`, successUsers.length === usersV1Bank.length ? 'green' : 'red');

  if (existingUserErrors.length || apiUserErrors.length || userNoBanksError.length) {
    consoleLogColor(`error migrating ${existingUserErrors.length + apiUserErrors.length + userNoBanksError.length} users`);

    if (existingUserErrors.length) {
      consoleLogColor('\nexisting users');
      consoleLogColor(existingUserErrors.join('\n '));
    }

    if (apiUserErrors.length) {
      consoleLogColor('\napi errors');
      consoleLogColor(apiUserErrors.join('\n'));
    }

    if (userNoBanksError.length) {
      consoleLogColor('\nunknown bank2');
      consoleLogColor(userNoBanksError.join('\n'));
    }
  }

  const logData = JSON.stringify({
    time: moment().toString(),
    successUsers,
    existingUserErrors,
    apiUserErrors,
    userNoBanksError,
  });

  teardown(logData, token);
};

migrateUsers();
