class BookingOrchestrator {
    constructor() {
        this.calendarLogic = new CalendarLogic();
        this.googleCalendar = new GoogleCalendarIntegration();
        this.initializeEventListeners();
    }

    initializeEventListeners() {
        // Calendar navigation
        document.querySelector('.calendar-container').addEventListener('click', (e) => {
            if (e.target.classList.contains('calendar-day')) {
                this.handleDateSelection(e.target.dataset.date);
            }
        });

        // Time slot selection
        document.querySelector('.time-slots-container').addEventListener('click', (e) => {
            if (e.target.classList.contains('time-slot')) {
                this.handleTimeSlotSelection(e.target.dataset.time);
            }
        });

        // Form submission
        document.querySelector('.booking-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleBookingSubmission(e.target);
        });
    }

    async handleDateSelection(date) {
        const slots = await this.googleCalendar.getAvailableSlots(date);
        this.calendarLogic.renderTimeSlots(slots);
    }

    handleTimeSlotSelection(time) {
        this.calendarLogic.selectTimeSlot(time);
        this.showBookingForm();
    }

    async handleBookingSubmission(form) {
        const bookingData = new FormData(form);
        try {
            await this.googleCalendar.createEvent(bookingData);
            this.showConfirmation();
        } catch (error) {
            this.showError(error.message);
        }
    }

    showBookingForm() {
        // Show booking form with selected time
    }

    showConfirmation() {
        // Show booking confirmation
    }

    showError(message) {
        // Show error message
    }
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    new BookingOrchestrator();
}); 