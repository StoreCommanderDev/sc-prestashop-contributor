// Import utils
import helper from '@utils/helpers';

// Import test context
import testContext from '@utils/testContext';

// Import login steps
import loginCommon from '@commonTests/BO/loginBO';

require('module-alias/register');

const {expect} = require('chai');

// Import pages
const dashboardPage = require('@pages/BO/dashboard');
const customersPage = require('@pages/BO/customers');

const baseContext = 'functional_BO_customers_customers_helpCard';

let browserContext;
let page;

// Check that help card is in english in customers page
describe('BO - Customers - Customers : Help card on customers page', async () => {
  // before and after functions
  before(async function () {
    browserContext = await helper.createBrowserContext(this.browser);
    page = await helper.newTab(browserContext);
  });

  after(async () => {
    await helper.closeBrowserContext(browserContext);
  });

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

    await customersPage.closeSfToolBar(page);

    const pageTitle = await customersPage.getPageTitle(page);
    await expect(pageTitle).to.contains(customersPage.pageTitle);
  });

  it('should open the help side bar and check the document language', async function () {
    await testContext.addContextItem(this, 'testIdentifier', 'openHelpSidebar', baseContext);

    const isHelpSidebarVisible = await customersPage.openHelpSideBar(page);
    await expect(isHelpSidebarVisible).to.be.true;

    const documentURL = await customersPage.getHelpDocumentURL(page);
    await expect(documentURL).to.contains('country=en');
  });

  it('should close the help side bar', async function () {
    await testContext.addContextItem(this, 'testIdentifier', 'closeHelpSidebar', baseContext);

    const isHelpSidebarNotVisible = await customersPage.closeHelpSideBar(page);
    await expect(isHelpSidebarNotVisible).to.be.true;
  });
});
