// Import utils
import helper from '@utils/helpers';
import testContext from '@utils/testContext';

// Import commonTests
import loginCommon from '@commonTests/BO/loginBO';

// Import FO pages
import foHomePage from '@pages/FO/home';

require('module-alias/register');

const {expect} = require('chai');

// Import BO pages
const dashboardPage = require('@pages/BO/dashboard');
const localizationPage = require('@pages/BO/international/localization');
const currenciesPage = require('@pages/BO/international/currencies');
const addCurrencyPage = require('@pages/BO/international/currencies/add');

// Import Data
const {Currencies} = require('@data/demo/currencies');

const baseContext = 'functional_BO_international_localization_currencies_createUnofficialCurrency';

let browserContext;
let page;
let numberOfCurrencies = 0;

/*
Create unofficial currency
Check data created in table
Check Creation of currency in FO
Delete currency
 */
describe('BO - International - Currencies : Create unofficial currency and check it in FO', async () => {
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

  it('should go to \'International > Localization\' page', async function () {
    await testContext.addContextItem(this, 'testIdentifier', 'goToLocalizationPage', baseContext);

    await dashboardPage.goToSubMenu(
      page,
      dashboardPage.internationalParentLink,
      dashboardPage.localizationLink,
    );

    await localizationPage.closeSfToolBar(page);

    const pageTitle = await localizationPage.getPageTitle(page);
    await expect(pageTitle).to.contains(localizationPage.pageTitle);
  });

  it('should go to \'Currencies\' page', async function () {
    await testContext.addContextItem(this, 'testIdentifier', 'goToCurrenciesPage', baseContext);

    await localizationPage.goToSubTabCurrencies(page);
    const pageTitle = await currenciesPage.getPageTitle(page);
    await expect(pageTitle).to.contains(currenciesPage.pageTitle);
  });

  it('should reset all filters', async function () {
    await testContext.addContextItem(this, 'testIdentifier', 'resetFilterFirst', baseContext);

    numberOfCurrencies = await currenciesPage.resetAndGetNumberOfLines(page);
    await expect(numberOfCurrencies).to.be.above(0);
  });

  describe('Create unofficial currency', async () => {
    it('should go to create new currency page', async function () {
      await testContext.addContextItem(this, 'testIdentifier', 'goToAddNewCurrencyPage', baseContext);

      await currenciesPage.goToAddNewCurrencyPage(page);
      const pageTitle = await addCurrencyPage.getPageTitle(page);
      await expect(pageTitle).to.contains(addCurrencyPage.pageTitle);
    });

    it('should create unofficial currency', async function () {
      await testContext.addContextItem(this, 'testIdentifier', 'createUnofficialCurrency', baseContext);

      // Check successful message after creation
      const textResult = await addCurrencyPage.createUnOfficialCurrency(page, Currencies.toman);
      await expect(textResult).to.contains(currenciesPage.successfulCreationMessage);

      // Check number of currencies after creation
      const numberOfCurrenciesAfterCreation = await currenciesPage.getNumberOfElementInGrid(page);
      await expect(numberOfCurrenciesAfterCreation).to.be.equal(numberOfCurrencies + 1);
    });

    it(
      `should filter by iso code of currency '${Currencies.toman.isoCode}' and check values created in table`,
      async function () {
        await testContext.addContextItem(this, 'testIdentifier', 'checkCurrencyValues', baseContext);

        // Filter
        await currenciesPage.filterTable(page, 'input', 'iso_code', Currencies.toman.isoCode);

        // Check number of element
        const numberOfCurrenciesAfterFilter = await currenciesPage.getNumberOfElementInGrid(page);
        await expect(numberOfCurrenciesAfterFilter).to.be.equal(numberOfCurrencies);

        const createdCurrency = await currenciesPage.getCurrencyFromTable(page, 1);
        await Promise.all([
          expect(createdCurrency.name).to.contains(Currencies.toman.name),
          expect(createdCurrency.symbol).to.contains(Currencies.toman.symbol),
          expect(createdCurrency.isoCode).to.contains(Currencies.toman.isoCode),
          expect(createdCurrency.exchangeRate).to.be.above(0),
          expect(createdCurrency.enabled).to.be.equal(Currencies.toman.enabled),
        ]);
      },
    );

    it('should go to FO', async function () {
      await testContext.addContextItem(this, 'testIdentifier', 'goToFo1', baseContext);

      // View my shop and init pages
      page = await currenciesPage.viewMyShop(page);

      const isHomePage = await foHomePage.isHomePage(page);
      await expect(isHomePage).to.be.true;
    });

    it('should change FO currency', async function () {
      await testContext.addContextItem(this, 'testIdentifier', 'changeFoCurrency1', baseContext);

      // Check currency
      await foHomePage.changeCurrency(page, Currencies.toman.isoCode, Currencies.toman.symbol);
      const shopCurrency = await foHomePage.getDefaultCurrency(page);
      await expect(shopCurrency).to.contain(Currencies.toman.isoCode);
    });

    it('should go back to BO', async function () {
      await testContext.addContextItem(this, 'testIdentifier', 'goBackToBo1', baseContext);

      page = await foHomePage.closePage(browserContext, page, 0);
      const pageTitle = await currenciesPage.getPageTitle(page);
      await expect(pageTitle).to.contains(currenciesPage.pageTitle);
    });

    it('should reset filters', async function () {
      await testContext.addContextItem(this, 'testIdentifier', 'resetFilterAfterCreation', baseContext);

      const numberOfCurrenciesAfterReset = await currenciesPage.resetAndGetNumberOfLines(page);
      await expect(numberOfCurrenciesAfterReset).to.be.equal(numberOfCurrencies + 1);
    });
  });

  describe('Disable and check currency in FO', async () => {
    it(`should filter by iso code of currency '${Currencies.toman.isoCode}'`, async function () {
      await testContext.addContextItem(this, 'testIdentifier', 'filterToDisableCurrency', baseContext);

      // Filter
      await currenciesPage.filterTable(page, 'input', 'iso_code', Currencies.toman.isoCode);

      // Check number of currencies
      const numberOfCurrenciesAfterFilter = await currenciesPage.getNumberOfElementInGrid(page);
      await expect(numberOfCurrenciesAfterFilter).to.be.equal(numberOfCurrencies);

      // Check currency created
      const textColumn = await currenciesPage.getTextColumnFromTableCurrency(page, 1, 'iso_code');
      await expect(textColumn).to.contains(Currencies.toman.isoCode);
    });

    it('should disable currency', async function () {
      await testContext.addContextItem(this, 'testIdentifier', 'disableCurrency', baseContext);

      const isActionPerformed = await currenciesPage.setStatus(page, 1, false);

      if (isActionPerformed) {
        const resultMessage = await currenciesPage.getAlertSuccessBlockParagraphContent(page);
        await expect(resultMessage).to.contains(currenciesPage.successfulUpdateStatusMessage);
      }

      // Check currency disabled
      const currencyStatus = await currenciesPage.getStatus(page, 1);
      await expect(currencyStatus).to.be.equal(false);
    });

    it('should go to FO', async function () {
      await testContext.addContextItem(this, 'testIdentifier', 'goToFo2', baseContext);

      // View my shop and init pages
      page = await currenciesPage.viewMyShop(page);

      const isHomePage = await foHomePage.isHomePage(page);
      await expect(isHomePage).to.be.true;
    });

    it('should check that the currencies list is not visible', async function () {
      await testContext.addContextItem(this, 'testIdentifier', 'checkCurrency2', baseContext);

      const found = await foHomePage.isCurrencyDropdownExist(page);
      await expect(found, 'Currencies list is visible').to.be.false;
    });

    it('should go back to BO', async function () {
      await testContext.addContextItem(this, 'testIdentifier', 'goBackToBo2', baseContext);

      page = await foHomePage.closePage(browserContext, page, 0);
      const pageTitle = await currenciesPage.getPageTitle(page);
      await expect(pageTitle).to.contains(currenciesPage.pageTitle);
    });

    it('should reset filters', async function () {
      await testContext.addContextItem(this, 'testIdentifier', 'resetFilterAfterDisable', baseContext);

      const numberOfCurrenciesAfterReset = await currenciesPage.resetAndGetNumberOfLines(page);
      await expect(numberOfCurrenciesAfterReset).to.be.equal(numberOfCurrencies + 1);
    });
  });

  describe('Delete currency created ', async () => {
    it(`should filter by iso code of currency '${Currencies.toman.isoCode}'`, async function () {
      await testContext.addContextItem(this, 'testIdentifier', 'filterToDelete', baseContext);

      // Filter
      await currenciesPage.filterTable(page, 'input', 'iso_code', Currencies.toman.isoCode);

      // Check number of currencies
      const numberOfCurrenciesAfterFilter = await currenciesPage.getNumberOfElementInGrid(page);
      await expect(numberOfCurrenciesAfterFilter).to.be.equal(numberOfCurrencies);

      const textColumn = await currenciesPage.getTextColumnFromTableCurrency(page, 1, 'iso_code');
      await expect(textColumn).to.contains(Currencies.toman.isoCode);
    });

    it('should delete currency', async function () {
      await testContext.addContextItem(this, 'testIdentifier', 'deleteCurrency', baseContext);

      const result = await currenciesPage.deleteCurrency(page, 1);
      await expect(result).to.be.equal(currenciesPage.successfulDeleteMessage);
    });

    it('should reset filters', async function () {
      await testContext.addContextItem(this, 'testIdentifier', 'resetFilterAfterDelete', baseContext);

      const numberOfCurrenciesAfterReset = await currenciesPage.resetAndGetNumberOfLines(page);
      await expect(numberOfCurrenciesAfterReset).to.be.equal(numberOfCurrencies);
    });
  });
});
