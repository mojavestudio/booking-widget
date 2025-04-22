class CalendarLogic {
    constructor() {
        this.currentDate = new Date();
        this.selectedDate = null;
        this.selectedTime = null;
        this.renderCalendar();
    }

    renderCalendar() {
        const container = document.querySelector('.calendar-container');
        const month = this.currentDate.getMonth();
        const year = this.currentDate.getFullYear();
        
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        
        let html = `
            <div class="calendar-header">
                <button class="prev-month">←</button>
                <h2>${this.getMonthName(month)} ${year}</h2>
                <button class="next-month">→</button>
            </div>
            <div class="calendar-grid">
                <div class="weekdays">
                    ${['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
                        .map(day => `<div class="weekday">${day}</div>`)
                        .join('')}
                </div>
                <div class="days">
        `;

        // Add empty cells for days before the first day of the month
        for (let i = 0; i < firstDay.getDay(); i++) {
            html += '<div class="calendar-day empty"></div>';
        }

        // Add days of the month
        for (let day = 1; day <= lastDay.getDate(); day++) {
            const date = new Date(year, month, day);
            const isToday = this.isToday(date);
            const isSelected = this.selectedDate && this.isSameDay(date, this.selectedDate);
            
            html += `
                <div class="calendar-day ${isToday ? 'today' : ''} ${isSelected ? 'selected' : ''}"
                     data-date="${date.toISOString().split('T')[0]}">
                    ${day}
                </div>
            `;
        }

        html += '</div></div>';
        container.innerHTML = html;

        // Add event listeners for month navigation
        container.querySelector('.prev-month').addEventListener('click', () => this.navigateMonth(-1));
        container.querySelector('.next-month').addEventListener('click', () => this.navigateMonth(1));
    }

    navigateMonth(direction) {
        this.currentDate.setMonth(this.currentDate.getMonth() + direction);
        this.renderCalendar();
    }

    /**
     * Render available time slots for a selected date.
     * @param {string} dateISO — e.g. "2025-04-23"
     * @param {string[]} slots — array of "HH:MM" strings
     */
    renderTimeSlots(dateISO, slots) {
        const container = document.querySelector('.time-slots-container');
        const d = new Date(dateISO);
        const opts = { weekday: 'long', month: 'long', day: 'numeric' };

        container.innerHTML = `
            <h3>${d.toLocaleDateString('en-US', opts)}</h3>
            <div class="time-slots">
                ${slots.map(t => `
                    <button class="time-slot" data-time="${t}">
                        ${this.formatTime(t)}
                    </button>`).join('')}
            </div>
        `;
    }

    selectTimeSlot(time) {
        this.selectedTime = time;
        document.querySelectorAll('.time-slot').forEach(slot => {
            slot.classList.toggle('selected', slot.dataset.time === time);
        });
    }

    // Helper methods
    getMonthName(month) {
        return ['January', 'February', 'March', 'April', 'May', 'June',
                'July', 'August', 'September', 'October', 'November', 'December'][month];
    }

    isToday(date) {
        const today = new Date();
        return this.isSameDay(date, today);
    }

    isSameDay(date1, date2) {
        return date1.getFullYear() === date2.getFullYear() &&
               date1.getMonth() === date2.getMonth() &&
               date1.getDate() === date2.getDate();
    }

    formatTime(timeString) {
        const [hours, minutes] = timeString.split(':');
        const date = new Date();
        date.setHours(parseInt(hours, 10), parseInt(minutes, 10));
        return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
    }
}