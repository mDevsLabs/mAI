import { When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';

import { CustomWorld } from '../../support/world';

Then('the extensions sidebar panel should be open', async function (this: CustomWorld) {
  const panel = this.page.locator('[data-testid="extensions-sidebar-panel"]');
  await expect(panel).toBeVisible();
});

When('I click the hide sidebar panel button', async function (this: CustomWorld) {
  const button = this.page.locator('[data-testid="hide-extensions-panel"]');
  await button.click();
});

Then('the extensions sidebar panel should be closed', async function (this: CustomWorld) {
  const panel = this.page.locator('[data-testid="extensions-sidebar-panel"]');
  await expect(panel).toBeHidden();
});

When('I click the open sidebar panel button', async function (this: CustomWorld) {
  const button = this.page.locator('[data-testid="open-extensions-panel"]');
  await button.click();
});
