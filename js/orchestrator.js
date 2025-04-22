import CalendarLogic from './calendarLogic.js';
import GoogleCalendarIntegration from './googleCalendarIntegration.js';

class BookingOrchestrator {
  constructor() {
    this.calendarLogic = new CalendarLogic();
    this.googleCal   = new GoogleCalendarIntegration();
    this.selectedDate = null;
    this.selectedTime = null;
    this.initListeners();
  }

  initListeners() {
    document.querySelector('.calendar-container')
      .addEventListener('click', e => {
        if (e.target.classList.contains('calendar-day')) {
          this.handleDateSelection(e.target.dataset.date);
        }
      });

    document.querySelector('.time-slots-container')
      .addEventListener('click', e => {
        if (e.target.classList.contains('time-slot')) {
          this.handleTimeSelection(e.target.dataset.time);
        }
      });

    document.querySelector('.booking-form')
      .addEventListener('submit', e => {
        e.preventDefault();
        this.handleBookingSubmission(new FormData(e.target));
      });
  }

  async handleDateSelection(dateISO) {
    this.selectedDate = dateISO;
    const slots = await this.googleCal.getAvailableSlots(dateISO);
    this.calendarLogic.renderTimeSlots(dateISO, slots);
    // clear previous form
    document.querySelector('.booking-form').classList.remove('active');
  }

  handleTimeSelection(time) {
    this.selectedTime = time;
    // highlight in UI
    document.querySelectorAll('.time-slot').forEach(b => 
      b.classList.toggle('selected', b.dataset.time === time)
    );
    this.showBookingForm();
  }

  showBookingForm() {
    const formCtn = document.querySelector('.booking-form');
    formCtn.innerHTML = `
      <form id="bookingForm">
        <input type="hidden" name="date" value="${this.selectedDate}">
        <input type="hidden" name="time" value="${this.selectedTime}">
        <div class="form-group">
          <label for="name">Name</label>
          <input name="name" id="name" required />
        </div>
        <div class="form-group">
          <label for="email">Email</label>
          <input type="email" name="email" id="email" required />
        </div>
        <div class="form-group">
          <label for="phone">Phone</label>
          <input name="phone" id="phone" />
        </div>
        <button type="submit">Confirm Booking</button>
      </form>
    `;
    formCtn.classList.add('active');
  }

  async handleBookingSubmission(formData) {
    try {
      await this.googleCal.createEvent(formData);
      this.showConfirmation();
    } catch (err) {
      this.showError(err.message);
    }
  }

  showConfirmation() {
    const ctn = document.querySelector('.booking-container');
    ctn.innerHTML = `
      <div style="padding:2rem; text-align:center;">
        <h2>🎉 All set!</h2>
        <p>Your meeting is booked for
           <strong>${this.selectedDate} @ ${this.selectedTime}</strong>.
        </p>
      </div>`;
  }

  showError(msg) {
    const errBox = document.createElement('div');
    errBox.style = 'color: var(--error-color); margin:1rem; text-align:center;';
    errBox.textContent = `❌ Oops: ${msg}`;
    document.querySelector('.booking-container').prepend(errBox);
  }
}

document.addEventListener('DOMContentLoaded', () => new BookingOrchestrator());