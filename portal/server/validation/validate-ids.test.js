const {
  isValidMongoId,
  isValidCompaniesHouseNumber,
  isValidResetPasswordToken,
  isValidDocumentType,
  isValidFileName,
} = require('./validate-ids');
const { COMPANIES_HOUSE_NUMBER } = require('../test-mocks/companies-house-number');

const { VALID, VALID_LAST_LETTER, VALID_LETTERS, VALID_LETTERS_NI, INVALID_SHORT, INVALID_SPECIAL_CHARACTER, INVALID_SPACE } = COMPANIES_HOUSE_NUMBER;

describe('validate-ids', () => {
  describe('isValidMongoId', () => {
    it('should return false if an id is not provided', () => {
      const result = isValidMongoId();

      expect(result).toEqual(false);
    });

    it('should return false if an id is not a valid mongo id', () => {
      const result = isValidMongoId('12345');

      expect(result).toEqual(false);
    });

    it('should return false if an id is not a valid mongo id', () => {
      const result = isValidMongoId('127.0.0.1');

      expect(result).toEqual(false);
    });

    it('should return false if an id is not a valid mongo id', () => {
      const result = isValidMongoId('../../etc');

      expect(result).toEqual(false);
    });

    it('should return false if an id is not a valid mongo id', () => {
      const result = isValidMongoId({});

      expect(result).toEqual(false);
    });

    it('should return false if an id is not a valid mongo id', () => {
      const result = isValidMongoId([]);

      expect(result).toEqual(false);
    });

    it('should return true if an id is a valid mongo id', () => {
      const result = isValidMongoId('620a1aa095a618b12da38c7b');

      expect(result).toEqual(true);
    });
  });

  describe('isValidCompaniesHouseNumber', () => {
    it('should return true for company number 8989898', () => {
      const result = isValidCompaniesHouseNumber(VALID);

      expect(result).toEqual(true);
    });

    it('should return true for company number SC907816', () => {
      const result = isValidCompaniesHouseNumber(VALID_LETTERS);

      expect(result).toEqual(true);
    });

    it('should return true for company number RS00592C', () => {
      const result = isValidCompaniesHouseNumber(VALID_LAST_LETTER);

      expect(result).toEqual(true);
    });

    it('should return true for company number NI614169', () => {
      const result = isValidCompaniesHouseNumber(VALID_LETTERS_NI);

      expect(result).toEqual(true);
    });

    it('should return false for company number which is too short', () => {
      const result = isValidCompaniesHouseNumber(INVALID_SHORT);

      expect(result).toEqual(false);
    });

    it('should return false for company number which has a special character', () => {
      const result = isValidCompaniesHouseNumber(INVALID_SPECIAL_CHARACTER);

      expect(result).toEqual(false);
    });

    it('should return false for company number which has a special character', () => {
      const result = isValidCompaniesHouseNumber(INVALID_SPACE);

      expect(result).toEqual(false);
    });
  });

  describe('isValidResetPasswordToken', () => {
    it('should return true for a hexadecimal string', () => {
      const result = isValidResetPasswordToken('ABCDEF0123456789');

      expect(result).toEqual(true);
    });

    it('should return false if string is not hexadecimal', () => {
      const result = isValidResetPasswordToken('G');

      expect(result).toEqual(false);
    });
  });

  describe('isValidDocumentType', () => {
    const validDocumentTypes = [
      'exporterQuestionnaire',
      'auditedFinancialStatements',
      'yearToDateManagement',
      'financialForecasts',
      'financialInformationCommentary',
      'corporateStructure',
    ];

    test.each(validDocumentTypes)('should return true for allowed document types', (documentType) => {
      const result = isValidDocumentType(documentType);

      expect(result).toEqual(true);
    });

    it('should return false for any other value', () => {
      const result = isValidDocumentType('otherDocument');

      expect(result).toEqual(false);
    });
  });

  describe('isValidFileName', () => {
    const validFileNames = [
      'document.bmp',
      'a-document.doc',
      'document-with-symbols(1).docx',
      'document with spaces.gif',
      'document.jpeg',
      'document.jpg',
      'document.pdf',
      'document.png',
      'document.ppt',
      'document.pptx',
      'document.tif',
      'document.txt',
      'document.xls',
      'document.xlsx',
    ];

    test.each(validFileNames)('should return true for valid file names', (fileName) => {
      const result = isValidFileName(fileName);

      expect(result).toEqual(true);
    });

    it('should return false for invalid file format', () => {
      const result = isValidFileName('document.exe');

      expect(result).toEqual(false);
    });

    it('should return false when there is extra text after the file format', () => {
      const result = isValidFileName('document.txtandmore');

      expect(result).toEqual(false);
    });
  });
});
