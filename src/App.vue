/* eslint-disable no-console */
<template>
  <div class="app">
    hehehhe
    <Calendar
      v-model="selectedDate"
      :select-date-change="onSelectDateChange"
      :config-day-data="calendarConfigDayData"
      type="month"
    />
  </div>
</template>

<script>
// import Calendar from "../dist/calendar"; 
import Calendar from "./components/calendar"
export default {
  name: "App",
  components: {
    Calendar,
  },
  data() {
    return {
      selectedDate: new Date(),
      calendarConfigDayData: [
        { date: 1586706786234, numberCount: 3 },
        { date: 1585842786000, numberCount: 1 },
        { date: 1586361186000, numberCount: 2 },
        { date: 1586351186000, numberCount: 21640 }
      ],
    };
  },
  methods: {
    onSelectDateChange(date) {
      this.selectedDate = date.date.timeString;
      console.log(date);
      console.log(this.selectedDate);
    },
    onCalendarChangeDatePage(startDate, endDate) {
      console.log(startDate, endDate);
    }
  }
};
</script>

<style>
* {
  touch-action: none;
}
.app {
  margin: 0;
  padding: 0;
}
</style>
