import {test,expect} from '@playwright/test'
import { ref } from 'node:process';


async function loginUser(page) {
    const userEmail = page.locator('#email');
    const userPassword = page.locator('#password');  
    const loginBtn = page.locator('#login-btn');
    const browseEventBtn = page.getByRole('link', { name: 'Browse Events →'});
    await userEmail.fill('praveenkum261@gmail.com');
    await userPassword.fill('secret123');
    await loginBtn.click();
    await browseEventBtn.waitFor();
    await expect(browseEventBtn).toBeVisible();
}

async function createEventFlow(page,eventTitleInput){
    const adminBtn = page.getByRole('button', { name: 'Admin' });
    const manageEventBtn = page.getByRole('link', { name: 'Manage Events' }).first();
    const newEventText = page.getByRole('heading', { name: '+ New Event' });
    const eventTtile = page.locator('#event-title-input');
    const eventDescription = page.locator('#admin-event-form textarea');
    const city = page.getByLabel('City');
    const venue = page.getByLabel('Venue');
    const date_Time = page.getByLabel('Event Date & Time');
    const price = page.getByLabel('Price ($)');
    const totalSeats = page.getByLabel('Total Seats');
    const submitBtn = page.locator('#add-event-btn');
    const alertMessageSuccess = page.locator('.flex-1' ).filter({ hasText: 'Event created!' });

    await adminBtn.click();
    await manageEventBtn.click();
    newEventText.waitFor();
    await expect(newEventText).toBeVisible();
    await eventTtile.fill(eventTitleInput);
    await eventDescription.fill('This is a test event created by Playwright automation script');
    await city.fill('Test City');
    await venue.fill('Test Venue');
    await date_Time.fill('2026-12-31T20:00');
    await price.fill('50');
    await totalSeats.fill('100');
    await submitBtn.click();
    await alertMessageSuccess.waitFor();
    await expect(alertMessageSuccess).toContainText('Event created!');
}

async function bookEvent(page, ticketQuantity, eventTitleInput){
    const eventCard = page.locator('#event-card');
    const eventcardName = eventCard.locator('div a h3');
    const bookingName = page.getByLabel('Full Name');
    const bookingEmail = page.locator('#customer-email');
    const bookingPneNumber =page.getByPlaceholder('+91 98765 43210');
    const bookingBtn = page.locator('.confirm-booking-btn');
    const addQuantityBtn = page.getByRole('button',{name: '+'});

    //book Event Flow
    await page.goto('/events');
    if(eventTitleInput === 'FirstEvent'){
        await eventCard.first().locator('#book-now-btn').click();
    }else{
        const eventCount = await eventCard.count();
        console.log('Title: ' + eventTitleInput);
        console.log('Total Events: ' + eventCount);
        for(let i=0;i<eventCount;i++){
            if(await eventcardName.nth(i).textContent() === eventTitleInput){
                await bookNowBtn.nth(i).click();
                break;
                }
        }
    }
    for(let i=1;i<ticketQuantity;i++){
        await addQuantityBtn.click();
    }
    await bookingName.fill('Test User');
    await bookingEmail.fill('praveenkum261@gmail.com');
    await bookingPneNumber.fill('+91 98765 43210');
    await bookingBtn.click();
}

test.only('Event Booking Validation', async({page})=>{
    await page.goto('/');
    const eventTitleInput = 'Test Event' + Date.now();
    const eventCard = page.locator('#event-card');
    const eventcardName = eventCard.locator('div a h3');
    const seatCount = eventCard.locator('div p+span');
    let seatBeforeBooking = 0;
    const bookNowBtn = page.locator('#book-now-btn');
    const ticketCount = page.locator('#ticket-count');
    const bookingName = page.getByLabel('Full Name');
    const bookingEmail = page.locator('#customer-email');
    const bookingPneNumber =page.getByPlaceholder('+91 98765 43210');
    const bookingBtn = page.locator('.confirm-booking-btn');
    const bookingReference = page.getByText('Booking Ref').locator('+span>span');
    const viewMyBookingBtn = page.getByRole('Button', {name:'View My Bookings'});
    const bookingCard = page.locator('#booking-card');
    const bookingReferenceNumber = page.locator('.booking-ref');

    //login Flow
    await loginUser(page);

    //Event Creation Flow
    await createEventFlow(page,eventTitleInput);

    //valdate the created event in browse event page
    await page.goto('/events');
    await eventCard.first().waitFor();
    expect(await eventCard.first()).toBeVisible();
    const eventCount = await eventCard.count();
    console.log('Title: ' + eventTitleInput);
    console.log('Total Events: ' + eventCount);
    for(let i=0;i<eventCount;i++){
        console.log('Event Name: ' + await eventcardName.nth(i).textContent());
        if(await eventcardName.nth(i).textContent() === eventTitleInput){
            expect(await eventcardName.filter({ hasText: eventTitleInput })).toBeVisible();
            expect(await eventcardName.filter({ hasText: eventTitleInput })).toHaveText(eventTitleInput);
            seatBeforeBooking = await seatCount.nth(i).textContent();
            await bookNowBtn.nth(i).click();
            break;
            }
    }
    seatBeforeBooking = parseInt(seatBeforeBooking.split(' ')[0]);
    console.log('Seats before booking: ' + seatBeforeBooking);

    //Book the event and validate the seat count
    await ticketCount.waitFor();
    expect(await ticketCount).toHaveText('1');
    await bookingName.fill('Test User');
    await bookingEmail.fill('praveenkum261@gmail.com');
    await bookingPneNumber.fill('+91 98765 43210');
    await bookingBtn.click();
    await bookingReference.first().waitFor();
    let bookingRefText = await bookingReference.first().textContent();
    expect(bookingReference).toBeVisible();
    await viewMyBookingBtn.click();
    expect(await page).toHaveURL('/bookings');
    await bookingCard.first().waitFor();
    expect(await bookingCard.first()).toBeVisible();
    await bookingCard.first().waitFor();
    let bookingCount = await bookingCard.count();
    console.log('Total Bookings: ' + bookingCount);
    for(let i=0;i<bookingCount;i++){
        if(await bookingReferenceNumber.nth(i).textContent() === bookingRefText){
                expect(await bookingCard.nth(i)).toBeVisible();
                expect(await bookingReferenceNumber.nth(i)).toHaveText(bookingRefText);
                expect(await bookingCard.nth(i).locator('h3')).toHaveText(eventTitleInput);
                break;
        }
    }

    //verify the seat count after booking
    await page.goto('/events');
    await eventCard.first().waitFor();
    for(let i=0;i<eventCount;i++){
        if(await eventcardName.nth(i).textContent() === eventTitleInput){
            const seatAfterBooking = (await seatCount.nth(i).textContent()).trim().split(' ')[0];
            console.log('Seats after booking: ' + seatAfterBooking);
            expect(parseInt(seatAfterBooking)).toBe(seatBeforeBooking - 1);
            break;
        }
    }
});

test('Refund Eligibilty Check for Single Ticket Bookings',async({page})=>{
    const bookingReference = page.getByText('Booking Ref').locator('+span>span');
    const viewBookingDetails = page.getByRole('Button', {name:'View Details'});
    const bookingInformationText = page.getByText('Booking Information');
    const refundEligibilityBtn = page.locator('#check-refund-btn');
    const refundResult = page.locator('#refund-result');

    //Book single ticket for an event
    awaitloginUser(page);
    await bookEvent(page,1,'FirstEvent');
    await bookingReference.first().waitFor();
    let bookingRefNumber = await bookingReference.first().textContent();
    await page.goto('/bookings');
    expect(await page).toHaveURL('/bookings');
    await viewBookingDetails.first().click();
    await bookingInformationText.waitFor();
    expect(await bookingInformationText).toBeVisible();
    expect(await page.locator('span').filter({hasText: bookingRefNumber}).first()).toBeVisible();
    const eventName = await page.locator('span').filter({hasText:'Event'}).locator('+span').textContent();
    expect(bookingRefNumber.split('')[0]).toEqual(eventName.trim().split('')[0]);
    await refundEligibilityBtn.click();
    expect(await page.locator('#refund-spinner')).toBeVisible();
    await page.waitForTimeout(6000);
    expect(await page.locator('#refund-spinner').isVisible()).toBeFalsy();
    expect(await refundResult).toBeVisible();
    expect(await refundResult).toContainText('Eligible for refund');
    expect(await refundResult).toContainText('Single-ticket bookings qualify for a full refund');

});

test('Refund Eligibilty Check for Group Ticket Bookings',async({page})=>{
    const bookingReference = page.getByText('Booking Ref').locator('+span>span');
    const viewBookingDetails = page.getByRole('Button', {name:'View Details'});
    const bookingInformationText = page.getByText('Booking Information');
    const refundEligibilityBtn = page.locator('#check-refund-btn');
    const refundResult = page.locator('#refund-result');

    //step to book multiple tickets for an event
    await loginUser(page);
    await bookEvent(page,2,'FirstEvent');
    await bookingReference.first().waitFor();
    let bookingRefNumber = await bookingReference.first().textContent();
    await page.goto('/bookings');
    expect(await page).toHaveURL('/bookings');
    await viewBookingDetails.first().click();
    await bookingInformationText.waitFor();
    expect(await bookingInformationText).toBeVisible();
    expect(await page.locator('span').filter({hasText: bookingRefNumber}).first()).toBeVisible();
    const eventName = await page.locator('span').filter({hasText:'Event'}).locator('+span').textContent();
    expect(bookingRefNumber.split('')[0]).toEqual(eventName.trim().split('')[0]);
    await refundEligibilityBtn.click();
    expect(await page.locator('#refund-spinner')).toBeVisible();
    await page.waitForTimeout(6000);
    expect(await page.locator('#refund-spinner').isVisible()).toBeFalsy();
    expect(await refundResult).toBeVisible();
    expect(await refundResult).toContainText('Not eligible for refund.');
    expect(await refundResult).toContainText(' Group bookings (2 tickets) are non-refundable.');

});