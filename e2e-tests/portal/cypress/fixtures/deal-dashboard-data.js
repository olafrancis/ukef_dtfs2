const now = new Date().valueOf().toString();

module.exports = [
  {
    submissionType: 'Automatic Inclusion Notice',
    bankInternalRefName: 'abc-1-def',
    additionalRefName: 'Additional reference name example',
    status: 'Draft',
    bank: {
      id: '9',
      name: 'UKEF test bank (Delegated)',
      emails: [
        'maker@ukexportfinance.gov.uk',
        'checker@ukexportfinance.gov.uk',
      ],
    },
    submissionDetails: {
      status: 'Incomplete',
    },
    eligibility: {
      status: 'Incomplete',
      version: 5,
    },
  }, {
    submissionType: 'Automatic Inclusion Notice',
    bankInternalRefName: 'abc-2-def',
    additionalRefName: 'Additional reference name example',
    status: 'Draft',
    bank: {
      id: '9',
      name: 'UKEF test bank (Delegated)',
      emails: [
        'maker@ukexportfinance.gov.uk',
        'checker@ukexportfinance.gov.uk',
      ],
    },
    submissionDetails: {
      status: 'Not started',
    },
  }, {
    submissionType: 'Automatic Inclusion Notice',
    bankInternalRefName: 'abc-3-def',
    additionalRefName: 'Additional reference name example',
    status: 'Draft',
    bank: {
      id: '9',
      name: 'UKEF test bank (Delegated)',
      emails: [
        'maker@ukexportfinance.gov.uk',
        'checker@ukexportfinance.gov.uk',
      ],
    },
    details: {
      submissionDate: now,
    },
    submissionDetails: {
      'supplier-name': 'Supplier name 2',
    },
  }, {
    submissionType: 'Manual Inclusion Notice',
    bankInternalRefName: 'abc-4-def',
    additionalRefName: 'Additional reference name example',
    status: "Ready for Checker's approval",
    previousStatus: 'Draft',
    bank: {
      id: '9',
      name: 'UKEF test bank (Delegated)',
      emails: [
        'maker@ukexportfinance.gov.uk',
        'checker@ukexportfinance.gov.uk',
      ],
    },
    details: {
      submissionDate: now,
    },
    submissionDetails: {
      'supplier-name': 'Supplier name 2',
    },
    comments: [{
      user: {
        firstname: 'bob',
        surname: 'builder',
      },
      timestamp: '2020 07 01 11:12:08:194 +0100',
      text: 'to me',
    }],
  }, {
    submissionType: 'Manual Inclusion Application',
    bankInternalRefName: 'abc-5-def',
    additionalRefName: 'Additional reference name example',
    status: "Further Maker's input required",
    previousStatus: "Ready for Checker's approval",
    bank: {
      id: '9',
      name: 'UKEF test bank (Delegated)',
      emails: [
        'maker@ukexportfinance.gov.uk',
        'checker@ukexportfinance.gov.uk',
      ],
    },
    details: {
      submissionDate: now,
    },
    submissionDetails: {
      'supplier-name': 'Supplier name 2',
    },
    comments: [{
      user: {
        firstname: 'bob',
        surname: 'builder',
      },
      timestamp: '2020 07 01 11:12:08:194 +0100',
      text: 'to me',
    }],
  }, {
    bankInternalRefName: 'abc-6-def',
    additionalRefName: 'Additional reference name example',
    status: 'Abandoned',
    previousStatus: 'Draft',
    bank: {
      id: '9',
      name: 'UKEF test bank (Delegated)',
      emails: [
        'maker@ukexportfinance.gov.uk',
        'checker@ukexportfinance.gov.uk',
      ],
    },
    details: {
      submissionDate: now,
    },
    submissionDetails: {
      'supplier-name': 'Supplier name 2',
    },
  }, {
    bankInternalRefName: 'abc-7-def',
    additionalRefName: 'Additional reference name example',
    status: 'Submitted',
    previousStatus: "Ready for Checker's approval",
    bank: {
      id: '9',
      name: 'UKEF test bank (Delegated)',
      emails: [
        'maker@ukexportfinance.gov.uk',
        'checker@ukexportfinance.gov.uk',
      ],
    },
    submissionDetails: {
      'supplier-name': 'Supplier name 2',
    },
    comments: [{
      user: {
        firstname: 'bob',
        surname: 'builder',
      },
      timestamp: '2020 07 01 11:12:08:194 +0100',
      text: 'to me',
    }],
  }, {
    bankInternalRefName: 'abc-8-def',
    additionalRefName: 'Additional reference name example',
    status: 'Submitted',
    previousStatus: "Ready for Checker's approval",
    bank: {
      id: '9',
      name: 'UKEF test bank (Delegated)',
      emails: [
        'maker@ukexportfinance.gov.uk',
        'checker@ukexportfinance.gov.uk',
      ],
    },
    submissionDetails: {
      'supplier-name': 'Supplier name 2',
    },
    comments: [{
      user: {
        firstname: 'bob',
        surname: 'builder',
      },
      timestamp: '2020 07 01 11:12:08:194 +0100',
      text: 'to me',
    }],
  }, {
    bankInternalRefName: 'abc-9-def',
    additionalRefName: 'Additional reference name example',
    status: "Ready for Checker's approval",
    previousStatus: 'Draft',
    bank: {
      id: '9',
      name: 'UKEF test bank (Delegated)',
      emails: [
        'maker@ukexportfinance.gov.uk',
        'checker@ukexportfinance.gov.uk',
      ],
    },
    submissionDetails: {
      'supplier-name': 'Supplier name 2',
    },
    comments: [{
      user: {
        firstname: 'bob',
        surname: 'builder',
      },
      timestamp: '2020 07 01 11:12:08:194 +0100',
      text: 'to me',
    }],
  }, {
    bankInternalRefName: 'abc-1-def',
    additionalRefName: 'Additional reference name example',
    status: 'Acknowledged',
    previousStatus: 'Submitted',
    bank: {
      id: '9',
      name: 'UKEF test bank (Delegated)',
      emails: [
        'maker@ukexportfinance.gov.uk',
        'checker@ukexportfinance.gov.uk',
      ],
    },
    submissionDetails: {
      'supplier-name': 'Supplier name 2',
    },
  }, {
    bankInternalRefName: 'abc-1-def',
    additionalRefName: 'Additional reference name example',
    status: 'Draft',
    bank: {
      id: '9',
      name: 'UKEF test bank (Delegated)',
      emails: [
        'maker@ukexportfinance.gov.uk',
        'checker@ukexportfinance.gov.uk',
      ],
    },
    submissionDetails: {
      'supplier-name': 'Supplier name 2',
    },
  }, {
    bankInternalRefName: 'abc-1-def',
    additionalRefName: 'Additional reference name example',
    status: 'Draft',
    bank: {
      id: '9',
      name: 'UKEF test bank (Delegated)',
      emails: [
        'maker@ukexportfinance.gov.uk',
        'checker@ukexportfinance.gov.uk',
      ],
    },
    submissionDetails: {
      'supplier-name': 'Supplier name 2',
    },
  }, {
    bankInternalRefName: 'abc-1-def',
    additionalRefName: 'Additional reference name example',
    status: 'Draft',
    bank: {
      id: '9',
      name: 'UKEF test bank (Delegated)',
      emails: [
        'maker@ukexportfinance.gov.uk',
        'checker@ukexportfinance.gov.uk',
      ],
    },
    submissionDetails: {
      'supplier-name': 'Supplier name 2',
    },
  }, {
    bankInternalRefName: 'abc-1-def',
    additionalRefName: 'Additional reference name example',
    status: 'Acknowledged',
    previousStatus: 'Submitted',
    bank: {
      id: '9',
      name: 'UKEF test bank (Delegated)',
      emails: [
        'maker@ukexportfinance.gov.uk',
        'checker@ukexportfinance.gov.uk',
      ],
    },
    submissionDetails: {
      'supplier-name': 'Supplier name 2',
    },
  }, {
    bankInternalRefName: 'abc-1-def',
    additionalRefName: 'Additional reference name example',
    status: 'Accepted by UKEF (without conditions)',
    previousStatus: 'Submitted',
    bank: {
      id: '9',
      name: 'UKEF test bank (Delegated)',
      emails: [
        'maker@ukexportfinance.gov.uk',
        'checker@ukexportfinance.gov.uk',
      ],
    },
    submissionDetails: {
      'supplier-name': 'Supplier name 2',
    },
  }, {
    bankInternalRefName: 'abc-1-def',
    additionalRefName: 'Additional reference name example',
    status: 'Rejected by UKEF',
    previousStatus: 'Submitted',
    bank: {
      id: '9',
      name: 'UKEF test bank (Delegated)',
      emails: [
        'maker@ukexportfinance.gov.uk',
        'checker@ukexportfinance.gov.uk',
      ],
    },
    submissionDetails: {
      'supplier-name': 'Supplier name 2',
    },
  }, {
    bankInternalRefName: 'abc-1-def',
    additionalRefName: 'Additional reference name example',
    status: 'Rejected by UKEF',
    previousStatus: 'Submitted',
    bank: {
      id: '9',
      name: 'UKEF test bank (Delegated)',
      emails: [
        'maker@ukexportfinance.gov.uk',
        'checker@ukexportfinance.gov.uk',
      ],
    },
    submissionDetails: {
      'supplier-name': 'Supplier name 2',
    },
  }, {
    bankInternalRefName: 'abc-1-def',
    additionalRefName: 'Additional reference name example',
    status: "Further Maker's input required",
    previousStatus: "Ready for Checker's approval",
    bank: {
      id: '9',
      name: 'UKEF test bank (Delegated)',
      emails: [
        'maker@ukexportfinance.gov.uk',
        'checker@ukexportfinance.gov.uk',
      ],
    },
    submissionDetails: {
      'supplier-name': 'Supplier name 2',
    },
  }, {
    bankInternalRefName: 'abc-1-def',
    additionalRefName: 'Additional reference name example',
    status: 'Accepted by UKEF (without conditions)',
    previousStatus: 'Submitted',
    bank: {
      id: '9',
      name: 'UKEF test bank (Delegated)',
      emails: [
        'maker@ukexportfinance.gov.uk',
        'checker@ukexportfinance.gov.uk',
      ],
    },
    submissionDetails: {
      'supplier-name': 'Supplier name 2',
    },
  }, {
    bankInternalRefName: 'abc 2 def',
    additionalRefName: 'Additional reference name example',
    status: 'Accepted by UKEF (with conditions)',
    previousStatus: 'Submitted',
    bank: {
      id: '9',
      name: 'UKEF test bank (Delegated)',
      emails: [
        'maker@ukexportfinance.gov.uk',
        'checker@ukexportfinance.gov.uk',
      ],
    },
    submissionDetails: {
      'supplier-name': 'Supplier name 2',
    },
  }, {
    bankInternalRefName: 'abc 2 def',
    additionalRefName: 'Additional reference name example',
    status: 'Abandoned',
    previousStatus: 'Draft',
    bank: {
      id: '9',
      name: 'UKEF test bank (Delegated)',
      emails: [
        'maker@ukexportfinance.gov.uk',
        'checker@ukexportfinance.gov.uk',
      ],
    },
    submissionDetails: {
      'supplier-name': 'Supplier name 2',
    },
  },
];
