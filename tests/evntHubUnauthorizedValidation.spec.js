import { test, expect, request } from '@playwright/test'
import { ApiUtils } from './utils/ApiUtils'
let yahooEventID, createYahooBookingID, apiUtils, apiUtilsGoogle, yahooToken, googleToken, eventResponseYahoo;

let gmailUser = { email: "praveen@gmail.com", password: "secret123" };
let yahooUser = { email: "praveen@yahoo.com", password: "secret123" };

async function loginUser(page) {
    const userEmail = page.locator('#email');
    const userPassword = page.locator('#password');  
    const loginBtn = page.locator('#login-btn');
    const browseEventBtn = page.getByRole('link', { name: 'Browse Events →'});
    page.goto('/')
    await userEmail.fill(gmailUser.email);
    await userPassword.fill(gmailUser.password);
    await loginBtn.click();
    await browseEventBtn.waitFor();
    await expect(browseEventBtn).toBeVisible();
}

test.only('Test user login via API', async ({ page }) => {
    const apiContext = await request.newContext();
    apiUtils = new ApiUtils(apiContext, yahooUser);
    apiUtilsGoogle = new ApiUtils(apiContext,gmailUser);
    yahooToken = await apiUtils.getToken();
    googleToken = await apiUtils.getToken();
    //Get all events available
    eventResponseYahoo = await apiUtils.getEvents(yahooToken, page);
    yahooEventID = eventResponseYahoo.data[0].id;
    // Create a new Event
    const createBookingReponse = await apiUtils.createBooking(yahooEventID, yahooToken);
    createYahooBookingID = createBookingReponse.data.id;
    console.log(createYahooBookingID);
    await loginUser(page);
    await page.goto(`/bookings/${createYahooBookingID}`);
    await page. waitForLoadState('networkidle');
    const accessDeniedText = await page.locator('h3').first();
    await accessDeniedText.waitFor();
    expect(await accessDeniedText).toBeVisible();
    await page.locator('a:has-text("View My Bookings")').waitFor();
    const unauthorizedMessageText = await page.locator('h3+p').first();
    expect(await unauthorizedMessageText).toHaveText('You are not authorized to view this booking.');
});
