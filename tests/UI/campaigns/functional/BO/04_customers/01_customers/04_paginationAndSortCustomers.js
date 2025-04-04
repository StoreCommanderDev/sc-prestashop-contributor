// Import utils
import helper from '@utils/helpers';

// Import test context
import testContext from '@utils/testContext';

// Import common tests
import loginCommon from '@commonTests/BO/loginBO';

require('module-alias/register');

const {expect} = require('chai');

// Import utils
const basicHelper = require('@utils/basicHelper');
const files = require('@utils/files');
const {importFileTest} = require('@commonTests/BO/advancedParameters/importFile');
const {bulkDeleteCustomersTest} = require('@commonTests/BO/customers/createDeleteCustomer');

// Import pages
const dashboardPage = require('@pages/BO/dashboard');
const customersPage = require('@pages/BO/customers');

// Import data
const {Data} = require('@data/import/customers');

const baseContext = 'functional_BO_customers_customers_paginationAndSortCustomers';

let browserContext;
let page;
let numberOfCustomers = 0;

// Variable used to create customers csv file
const fileName = 'customers.csv';

/*
Pre-condition:
- Import list of customers
Scenario:
- Paginate between pages
- Sort customers table
Post-condition:
- Delete imported customers with bulk actions
 */
describe('BO - Customers - Customers : Pagination and sort customers table', async () => {
  // Pre-condition: Import list of categories
  importFileTest(fileName, Data.entity, `${baseContext}_preTest_1`);

  // before and after functions
  before(async function () {
    browserContext = await helper.createBrowserContext(this.browser);
    page = await helper.newTab(browserContext);
    // Create csv file with all customers data
    await files.createCSVFile('.', fileName, Data);
  });

  after(async () => {
    await helper.closeBrowserContext(browserContext);
    // Delete created csv file
    await files.deleteFile(fileName);
  });

  // 1 : Go to customers page
  describe('Go to \'Customers > Customers\' page', async () => {
    it('should login in BO', async function () {
      await loginCommon.loginBO(this, page);
    });

    it('should go to \'Customers > Customers\' page', async function () {
      await testContext.addContextItem(this, 'testIdentifier', 'goToCustomersPage', baseContext);

      await dashboardPage.goToSubMenu(
        page,
        dashboardPage.customersParentLink,
        dashboardPage.customersLink,
      );

      await dashboardPage.closeSfToolBar(page);

      const pageTitle = await customersPage.getPageTitle(page);
      await expect(pageTitle).to.contains(customersPage.pageTitle);
    });

    it('should reset all filters and get number of customers in BO', async function () {
      await testContext.addContextItem(this, 'testIdentifier', 'resetFirst', baseContext);

      numberOfCustomers = await customersPage.resetAndGetNumberOfLines(page);
      await expect(numberOfCustomers).to.be.above(0);
    });
  });

  // 2 : Pagination
  describe('Pagination next and previous', async () => {
    it('should change the items number to 10 per page', async function () {
      await testContext.addContextItem(this, 'testIdentifier', 'changeItemNumberTo10', baseContext);

      const paginationNumber = await customersPage.selectPaginationLimit(page, '10');
      expect(paginationNumber).to.contains('(page 1 / 2)');
    });

    it('should click on next', async function () {
      await testContext.addContextItem(this, 'testIdentifier', 'clickOnNext', baseContext);

      const paginationNumber = await customersPage.paginationNext(page);
      expect(paginationNumber).to.contains('(page 2 / 2)');
    });

    it('should click on previous', async function () {
      await testContext.addContextItem(this, 'testIdentifier', 'clickOnPrevious', baseContext);

      const paginationNumber = await customersPage.paginationPrevious(page);
      expect(paginationNumber).to.contains('(page 1 / 2)');
    });

    it('should change the items number to 50 per page', async function () {
      await testContext.addContextItem(this, 'testIdentifier', 'changeItemNumberTo50', baseContext);

      const paginationNumber = await customersPage.selectPaginationLimit(page, '50');
      expect(paginationNumber).to.contains('(page 1 / 1)');
    });
  });

  // 3 : Sort customers
  describe('Sort customers table', async () => {
    const sortTests = [
      {
        args: {
          testIdentifier: 'sortByIdDesc', sortBy: 'id_customer', sortDirection: 'desc', isNumber: true,
        },
      },
      {args: {testIdentifier: 'sortBySocialTitleAsc', sortBy: 'social_title', sortDirection: 'asc'}},
      {args: {testIdentifier: 'sortBySocialTitleDesc', sortBy: 'social_title', sortDirection: 'desc'}},
      {args: {testIdentifier: 'sortByFirstNameAsc', sortBy: 'firstname', sortDirection: 'asc'}},
      {args: {testIdentifier: 'sortByFirstNameDesc', sortBy: 'firstname', sortDirection: 'desc'}},
      {args: {testIdentifier: 'sortByLastNameCodeAsc', sortBy: 'lastname', sortDirection: 'asc'}},
      {args: {testIdentifier: 'sortLastNameDesc', sortBy: 'lastname', sortDirection: 'desc'}},
      {args: {testIdentifier: 'sortByEmailAsc', sortBy: 'email', sortDirection: 'asc'}},
      {args: {testIdentifier: 'sortByEmailDesc', sortBy: 'email', sortDirection: 'desc'}},
      {args: {testIdentifier: 'sortBySalesAsc', sortBy: 'total_spent', sortDirection: 'asc'}},
      {args: {testIdentifier: 'sortBySalesDesc', sortBy: 'total_spent', sortDirection: 'desc'}},
      {args: {testIdentifier: 'sortByEnabledAsc', sortBy: 'active', sortDirection: 'asc'}},
      {args: {testIdentifier: 'sortByEnabledDesc', sortBy: 'active', sortDirection: 'desc'}},
      {args: {testIdentifier: 'sortByNewslettersAsc', sortBy: 'newsletter', sortDirection: 'asc'}},
      {args: {testIdentifier: 'sortByNewslettersDesc', sortBy: 'newsletter', sortDirection: 'desc'}},
      {args: {testIdentifier: 'sortByPartnerOffersAsc', sortBy: 'optin', sortDirection: 'asc'}},
      {args: {testIdentifier: 'sortByPartnerOffersDesc', sortBy: 'optin', sortDirection: 'desc'}},
      {
        args: {
          testIdentifier: 'sortByRegistrationAsc', sortBy: 'date_add', sortDirection: 'asc', isDate: true,
        },
      },
      {
        args: {
          testIdentifier: 'sortByRegistrationDesc', sortBy: 'date_add', sortDirection: 'desc', isDate: true,
        },
      },
      {args: {testIdentifier: 'sortByLastVisitAsc', sortBy: 'connect', sortDirection: 'asc'}},
      {args: {testIdentifier: 'sortByLastVisitDesc', sortBy: 'connect', sortDirection: 'desc'}},
      {
        args: {
          testIdentifier: 'sortByIdAsc', sortBy: 'id_customer', sortDirection: 'asc', isNumber: true,
        },
      },
    ];

    sortTests.forEach((test) => {
      it(`should sort by '${test.args.sortBy}' '${test.args.sortDirection}' and check result`, async function () {
        await testContext.addContextItem(this, 'testIdentifier', test.args.testIdentifier, baseContext);

        let nonSortedTable = await customersPage.getAllRowsColumnContent(page, test.args.sortBy);

        await customersPage.sortTable(page, test.args.sortBy, test.args.sortDirection);

        let sortedTable = await customersPage.getAllRowsColumnContent(page, test.args.sortBy);

        if (test.args.isNumber) {
          nonSortedTable = await nonSortedTable.map((text) => parseInt(text, 10));
          sortedTable = await sortedTable.map((text) => parseInt(text, 10));
        }

        const expectedResult = await basicHelper.sortArray(nonSortedTable, test.args.isNumber, test.args.isDate);

        if (test.args.sortDirection === 'asc') {
          await expect(sortedTable).to.deep.equal(expectedResult);
        } else {
          await expect(sortedTable).to.deep.equal(expectedResult.reverse());
        }
      });
    });
  });

  // Post-condition: Delete imported customers by bulk actions
  bulkDeleteCustomersTest('email', 'test', `${baseContext}_postTest_1`);
});
