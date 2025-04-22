class GoogleCalendarIntegration {
    constructor() {
        this.client = null;
        this.isAuthorized = false;
        this.initializeClient();
    }

    async initializeClient() {
        try {
            await gapi.load('client:auth2', () => {
                gapi.client.init({
                    apiKey: process.env.GOOGLE_API_KEY,
                    clientId: process.env.GOOGLE_CLIENT_ID,
                    discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest'],
                    scope: 'https://www.googleapis.com/auth/calendar.events'
                }).then(() => {
                    this.client = gapi.client;
                    this.updateSigninStatus();
                });
            });
        } catch (error) {
            console.error('Error initializing Google client:', error);
        }
    }

    updateSigninStatus() {
        const isSignedIn = gapi.auth2.getAuthInstance().isSignedIn.get();
        this.isAuthorized = isSignedIn;
        this.updateUI();
    }

    async signIn() {
        try {
            await gapi.auth2.getAuthInstance().signIn();
            this.updateSigninStatus();
        } catch (error) {
            console.error('Error signing in:', error);
            throw error;
        }
    }

    async signOut() {
        try {
            await gapi.auth2.getAuthInstance().signOut();
            this.updateSigninStatus();
        } catch (error) {
            console.error('Error signing out:', error);
            throw error;
        }
    }

    async getAvailableSlots(date) {
        if (!this.isAuthorized) {
            await this.signIn();
        }

        try {
            const response = await this.client.calendar.freebusy.query({
                resource: {
                    timeMin: new Date(date + 'T00:00:00Z').toISOString(),
                    timeMax: new Date(date + 'T23:59:59Z').toISOString(),
                    items: [{ id: 'primary' }]
                }
            });

            const busySlots = response.result.calendars.primary.busy;
            return this.generateAvailableSlots(date, busySlots);
        } catch (error) {
            console.error('Error fetching available slots:', error);
            throw error;
        }
    }

    async createEvent(bookingData) {
        if (!this.isAuthorized) {
            await this.signIn();
        }

        try {
            const event = {
                summary: `Appointment with ${bookingData.get('name')}`,
                description: `Contact: ${bookingData.get('email')}\nPhone: ${bookingData.get('phone')}\nNotes: ${bookingData.get('notes')}`,
                start: {
                    dateTime: `${bookingData.get('date')}T${bookingData.get('time')}:00`,
                    timeZone: process.env.TIMEZONE
                },
                end: {
                    dateTime: `${bookingData.get('date')}T${this.addMinutes(bookingData.get('time'), process.env.BOOKING_DURATION)}:00`,
                    timeZone: process.env.TIMEZONE
                }
            };

            await this.client.calendar.events.insert({
                calendarId: 'primary',
                resource: event
            });
        } catch (error) {
            console.error('Error creating event:', error);
            throw error;
        }
    }

    // Helper methods
    generateAvailableSlots(date, busySlots) {
        const slots = [];
        const startTime = new Date(date + 'T09:00:00');
        const endTime = new Date(date + 'T17:00:00');
        const interval = process.env.BOOKING_DURATION * 60 * 1000;

        for (let time = startTime; time < endTime; time = new Date(time.getTime() + interval)) {
            const isAvailable = !this.isTimeSlotBusy(time, busySlots);
            if (isAvailable) {
                slots.push(time.toTimeString().slice(0, 5));
            }
        }

        return slots;
    }

    isTimeSlotBusy(time, busySlots) {
        return busySlots.some(slot => {
            const start = new Date(slot.start);
            const end = new Date(slot.end);
            return time >= start && time < end;
        });
    }

    addMinutes(timeString, minutes) {
        const [hours, mins] = timeString.split(':').map(Number);
        const date = new Date();
        date.setHours(hours, mins + minutes);
        return date.toTimeString().slice(0, 5);
    }

    updateUI() {
        const authButton = document.querySelector('.auth-button');
        if (authButton) {
            authButton.textContent = this.isAuthorized ? 'Sign Out' : 'Sign In';
            authButton.onclick = this.isAuthorized ? () => this.signOut() : () => this.signIn();
        }
    }
} 