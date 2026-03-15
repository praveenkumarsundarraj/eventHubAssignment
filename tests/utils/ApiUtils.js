import { request, expect } from '@playwright/test'
const BASE_URL = 'https://eventhub.rahulshettyacademy.com';
const API_URL = 'https://api.eventhub.rahulshettyacademy.com/api';
class ApiUtils {

    constructor(apicontext, loginPayload) {
        this.apicontext = apicontext;
        this.loginPayload = loginPayload;
    }

    async getToken() {
        const loginResponse = await this.apicontext.post(`${API_URL}/auth/login`,
            {
                data: this.loginPayload,
            }
        );
        expect(loginResponse.ok()).toBeTruthy();
        const loginResponseData = await loginResponse.json();
        return await loginResponseData.token;
    }

    async addLocalStorage(page, token) {

        await page.addInitScript(eventToken => {
            window.localStorage.setItem('eventhub_token', eventToken)
        }, token
        );
    }

    async getEvents(token, page) {
        const eventResponse = await this.apicontext.get(`${API_URL}/events`,
            {
                headers:
                {
                    Authorization: `Bearer ${token}`
                }
            }
        );
        await page.goto('/events');
        expect(await eventResponse.status()).toBeTruthy();
        return await eventResponse.json();
    }

    async createBooking(eventID, token) {
        console.log(eventID);
        const createBookingReponse = await this.apicontext.post(`${API_URL}/bookings`,
            {
                data: {
                    customerName: "Yahoo User",
                    customerEmail: "praveen@yahoo.com",
                    customerPhone: "9003124767",
                    quantity: 1,
                    eventId: `${eventID}`,
                },
                headers:
                {
                    Authorization: `Bearer ${token}`,
                }
            }
        );
        console.log(await createBookingReponse.status());
        expect(await createBookingReponse.ok()).toBeTruthy();
        return await createBookingReponse.json();
    }
}

module.exports = { ApiUtils };