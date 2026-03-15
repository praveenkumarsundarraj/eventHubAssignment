import {test,expect,request} from '@playwright/test'
import {ApiUtils} from './utils/ApiUtils'
const loginPayload = {email: "praveenkum261@gmail.com", password: "secret123"};
const SIX_EVENTS_RESPONSE = {
  data: [
    { id: 1, title: 'Tech Summit 2025', category: 'Conference', eventDate: '2025-06-01T10:00:00.000Z', venue: 'HICC', city: 'Hyderabad', price: '999', totalSeats: 200, availableSeats: 150, imageUrl: null, isStatic: false },
    { id: 2, title: 'Rock Night Live',  category: 'Concert',    eventDate: '2025-06-05T18:00:00.000Z', venue: 'Palace Grounds', city: 'Bangalore', price: '1500', totalSeats: 500, availableSeats: 300, imageUrl: null, isStatic: false },
    { id: 3, title: 'IPL Finals',       category: 'Sports',     eventDate: '2025-06-10T19:30:00.000Z', venue: 'Chinnaswamy', city: 'Bangalore', price: '2000', totalSeats: 800, availableSeats: 50, imageUrl: null, isStatic: false },
    { id: 4, title: 'UX Design Workshop', category: 'Workshop', eventDate: '2025-06-15T09:00:00.000Z', venue: 'WeWork', city: 'Mumbai', price: '500', totalSeats: 50, availableSeats: 20, imageUrl: null, isStatic: false },
    { id: 5, title: 'Lollapalooza India', category: 'Festival', eventDate: '2025-06-20T12:00:00.000Z', venue: 'Mahalaxmi Racecourse', city: 'Mumbai', price: '3000', totalSeats: 5000, availableSeats: 2000, imageUrl: null, isStatic: false },
    { id: 6, title: 'AI & ML Expo',    category: 'Conference',  eventDate: '2025-06-25T10:00:00.000Z', venue: 'Bangalore International Exhibition Centre', city: 'Bangalore', price: '750', totalSeats: 300, availableSeats: 180, imageUrl: null, isStatic: false },
  ],
  pagination: { page: 1, totalPages: 1, total: 6, limit: 12 },
};

const FOUR_EVENTS_RESPONSE = {
  data: [
    { id: 1, title: 'Tech Summit 2025', category: 'Conference', eventDate: '2025-06-01T10:00:00.000Z', venue: 'HICC', city: 'Hyderabad', price: '999', totalSeats: 200, availableSeats: 150, imageUrl: null, isStatic: false },
    { id: 2, title: 'Rock Night Live',  category: 'Concert',    eventDate: '2025-06-05T18:00:00.000Z', venue: 'Palace Grounds', city: 'Bangalore', price: '1500', totalSeats: 500, availableSeats: 300, imageUrl: null, isStatic: false },
    { id: 3, title: 'IPL Finals',       category: 'Sports',     eventDate: '2025-06-10T19:30:00.000Z', venue: 'Chinnaswamy', city: 'Bangalore', price: '2000', totalSeats: 800, availableSeats: 50, imageUrl: null, isStatic: false },
    { id: 4, title: 'UX Design Workshop', category: 'Workshop', eventDate: '2025-06-15T09:00:00.000Z', venue: 'WeWork', city: 'Mumbai', price: '500', totalSeats: 50, availableSeats: 20, imageUrl: null, isStatic: false },
  ],
  pagination: { page: 1, totalPages: 1, total: 4, limit: 12 },
};


let token,apiUtils;

async function loginUser(page,event) {
    const apicontext =await request.newContext();
    apiUtils = new ApiUtils(apicontext,loginPayload);
    token =await apiUtils.getToken();
    await apiUtils.addLocalStorage(page,token);
    await page.goto('/');
    await page.route('**/api/events*',
      async routeIt => 
        {
          const response = await page.request.fetch(routeIt.request());
          let body = JSON.stringify(event);
          routeIt.fulfill(
            {
              response,
              body,
            }
          );
        }
    );    
    await page.waitForResponse('**/api/events*');
    await page.goto('/events');
}

test('Login via API call and show 6 events',async ({page})=>{
    await loginUser(page,SIX_EVENTS_RESPONSE);
    const eventCard = page.locator('#event-card');
    await eventCard.first().waitFor();
    expect(await eventCard.first()).toBeVisible();
    expect(await eventCard.count()).toEqual(6);
    const banner = page.locator('span:has-text(\'sandbox holds up to\')');
    expect(await banner).toBeVisible();
    expect(await banner).toContainText('9 bookings');
});

test('Login via API call and show 4 events',async ({page})=>{
    await loginUser(page,FOUR_EVENTS_RESPONSE);
    const eventCard = page.locator('#event-card');
    await eventCard.first().waitFor();
    expect(await eventCard.first()).toBeVisible();
    expect(await eventCard.count()).toEqual(4);
    const banner = page.locator('span:has-text(\'sandbox holds up to\')');
    expect(await banner.isVisible()).toBeFalsy();
});