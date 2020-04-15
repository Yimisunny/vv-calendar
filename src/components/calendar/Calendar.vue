<template>
  <div ref="calendarPage" class="calendar-page" @touchmove.prevent>
    <div class="title">
      {{ title }}
    </div>
    <div class="week">
      <div v-for="(item, index) in week" :key="index" class="week-item">
        {{ item }}
      </div>
    </div>
    <transition name="fadeHeight" model="out-in">
      <!-- 显示星期 -->
      <Swiper
        v-if="isShowAllMonth === false"
        ref="customSwiper"
        key="one"
        :init-page="2"
        class="custom-swiper"
        direction="horizontal"
        @slideChangeEnd="slideChangeEnd"
      >
        <div
          v-for="item in c_S_W_List"
          :key="
            item[Math.ceil(Math.random() * 6)].date.timeValue +
              'week' +
              Math.random() * 10
          "
          class="swiper-slide line-week"
          @touchstart="onTouchstart"
          @touchmove="onTouchmove"
          @touchend="onTouchend"
        >
          <div
            v-for="i in item"
            :key="i.date.timeValue"
            class="line-week-item"
            @click="handlerWeekDayClick(i)"
          >
            <div
              v-show="renderBadge(i.date.timeString)"
              :class="
                renderBadge(i.date.timeString) > 99
                  ? 'badge-lager-super'
                  : renderBadge(i.date.timeString) > 10
                  ? 'badge-lager'
                  : 'badge-default'
              "
              class="badge"
            >
              {{
                renderBadge(i.date.timeString) > 99
                  ? "99+"
                  : renderBadge(i.date.timeString)
              }}
            </div>
            <div
              :class="{ active: isSameDate(value, i.date.timeString) }"
              class="content"
            >
              {{ isSameToday(i.date.timeString) ? "今" : i.dayName }}
            </div>
          </div>
        </div>
      </Swiper>
      <!-- 显示月份 -->
      <Swiper
        v-else
        ref="customSwiper"
        key="two"
        :init-page="2"
        class="custom-swiper"
        direction="horizontal"
        @slideChangeEnd="slideChangeEnd"
      >
        <div
          v-for="item in c_S_M_List"
          :key="
            item[Math.ceil(Math.random() * 10)].date.timeValue +
              'month' +
              Math.random() * 10
          "
          class="swiper-slide line-month"
          @touchstart="onTouchstart"
          @touchmove="onTouchmove"
          @touchend="onTouchend"
        >
          <div
            v-for="i in item"
            :key="i.date.timeValue"
            :style="{ width: calendarWidth / 7 + 'px' }"
            class="line-week-item line-month-item"
            @click="i.select != null ? handlerMonthDayClick(i) : null"
          >
            <div
              v-show="renderBadge(i.date.timeString)"
              :class="
                renderBadge(i.date.timeString) > 99
                  ? 'badge-lager-super'
                  : renderBadge(i.date.timeString) > 10
                  ? 'badge-lager'
                  : 'badge-default'
              "
              class="badge"
            >
              {{
                renderBadge(i.date.timeString) > 99
                  ? "99+"
                  : renderBadge(i.date.timeString)
              }}
            </div>
            <div
              :class="{
                disable: i.select == null,
                active: isSameDate(value, i.date.timeString)
              }"
              class="content "
            >
              {{ isSameToday(i.date.timeString) ? "今" : i.dayName }}
            </div>
          </div>
        </div>
      </Swiper>
    </transition>
  </div>
</template>

<script>
import Swiper from "../swiper/Swiper"
import moment from "moment";
export default {
  name: "Calendar",
  components:{
    Swiper
  },
  props: {
    value: {
      type: Object | String,
      default: new Date()
    },
    type: {
      type: String,
      default: "month"
    },
    selectDateChange: {
      type: Function,
      default: () => {}
    },
    configDayData: {
      type: Array,
      default: new Array()
    }
  },
  data() {
    return {
      title: "",
      isShowAllMonth: false,
      week: ["一", "二", "三", "四", "五", "六", "日"],
      c_S_W_List: [],
      c_S_M_List: [],
      currentMoment: null,
      startY: 0,
      startX: 0,
      top: 0,
      leftDiff: 0,
      touching: false,
      calendarWidth: 0
    };
  },
  computed: {},
  watch: {},
  created() {
    this.currentMoment = moment().format("YYYY-MM-DD");
    this.initWeekList(
      moment(this.currentMoment)
        .subtract(7, "days")
        .format("YYYY-MM-DD"),
      this.currentMoment,
      moment(this.currentMoment)
        .add(7, "days")
        .format("YYYY-MM-DD")
    );
  },
  mounted() {
    this.$nextTick(() => {
      const resizeObserver = new ResizeObserver(() => {
        this.calendarWidth = this.$refs.calendarPage.clientWidth;
        this.$refs.customSwiper.updateEvent();
      });
      resizeObserver.observe(this.$refs.calendarPage);
      this.$once("hook:beforeDestroy", () => {
        resizeObserver.disconnect();
      });
    });
  },
  methods: {
    initWeekList(lastWeek, centerWeek, nextWeek) {
      let c_S_W_List = []; // currentSwiperWeekList
      c_S_W_List[0] = this.getCurrentWeek(lastWeek);
      c_S_W_List[1] = this.getCurrentWeek(centerWeek);
      c_S_W_List[2] = this.getCurrentWeek(nextWeek);
      this.title = moment(this.currentMoment).format("YYYY年MM月");
      this.c_S_W_List = c_S_W_List;
    },
    initMonthList(lastMonth, centerMonth, nextMonth) {
      let c_S_M_List = []; // currentSwiperMonthList
      c_S_M_List[0] = this.getCurrentMonth(lastMonth);
      c_S_M_List[1] = this.getCurrentMonth(centerMonth);
      c_S_M_List[2] = this.getCurrentMonth(nextMonth);
      this.title = moment(this.currentMoment).format("YYYY年MM月");
      this.c_S_M_List = c_S_M_List;
    },
    getCurrentMonth(date) {
      moment.locales("zh-cn");
      const currentMonthFirstDayOfWeekday = moment(date)
        .date(1)
        .format("E"); // 获取当月1日为一周中的第几天
      const currentMonthDays = moment(date).daysInMonth();
      const currentMonthLastDayOfWeekday = moment(date)
        .date(currentMonthDays)
        .format("E");
      let dateArray = [];
      let currentMonthArray = [];
      let lastMonthArray = [];
      let nextMonthArray = [];
      let lastMonthRenderCount = currentMonthFirstDayOfWeekday - 1;
      let nextMonthRenderCount = 7 - currentMonthLastDayOfWeekday;
      for (let i = 0; i < lastMonthRenderCount; i++) {
        let day = moment(date)
          .date(1)
          .subtract(lastMonthRenderCount - i, "days")
          .format("YYYY-MM-DD");
        let dayName = moment(day).format("D");
        let map = {
          dayName: dayName,
          date: {
            timeString: moment(day).format("YYYY-MM-DD"),
            timeValue: moment(day).unix()
          },
          select: null
        };
        lastMonthArray.push(map);
      }
      for (let i = 0; i < currentMonthDays; i++) {
        let day = moment(date)
          .date(1)
          .add(i, "days")
          .format("YYYY-MM-DD");
        let dayName = moment(day).format("D");
        let map = {
          dayName: dayName,
          date: {
            timeString: moment(day).format("YYYY-MM-DD"),
            timeValue: moment(day).unix()
          },
          select: false
        };
        currentMonthArray.push(map);
      }
      for (let i = 1; i <= nextMonthRenderCount; i++) {
        let day = moment(date)
          .date(currentMonthDays)
          .add(i, "days")
          .format("YYYY-MM-DD");
        let dayName = moment(day).format("D");
        let map = {
          dayName: dayName,
          date: {
            timeString: moment(day).format("YYYY-MM-DD"),
            timeValue: moment(day).unix()
          },
          select: null
        };
        nextMonthArray.push(map);
      }
      dateArray = [...lastMonthArray, ...currentMonthArray, ...nextMonthArray];
      return dateArray;
    },

    getCurrentWeek(date) {
      moment.locales("zh-cn");
      const weekOfday = moment(date).format("E");
      let numberToMonday = weekOfday - 1; // 4
      let numberToSunday = 7 - weekOfday; // 2
      let weekArray = [];
      let firstArray = [];
      let lastArray = [];
      for (let i = 1; i <= numberToMonday; i++) {
        let day = moment(date)
          .subtract(weekOfday - i, "days")
          .format("YYYY-MM-DD");
        let dayName = moment(day).format("D");
        let map = {
          dayName: dayName,
          date: {
            timeString: moment(day).format("YYYY-MM-DD"),
            timeValue: moment(day).unix()
          },
          select: false
        };
        firstArray.push(map);
      }
      for (let i = 1; i <= numberToSunday; i++) {
        let day = moment(date)
          .add(i, "days")
          .format("YYYY-MM-DD");
        let dayName = moment(day).format("D");
        let map = {
          dayName: dayName,
          date: {
            timeString: moment(day).format("YYYY-MM-DD"),
            timeValue: moment(day).unix()
          },
          select: false
        };
        lastArray.push(map);
      }
      let dayName = moment(date).format("D");
      let dateMap = {
        dayName: dayName,
        date: {
          timeString: moment(date).format("YYYY-MM-DD"),
          timeValue: moment(date).unix()
        },
        select: false
      };
      weekArray = [...firstArray, dateMap, ...lastArray];
      return weekArray;
    },
    initMonthFun() {
      this.initMonthList(
        moment(this.currentMoment).subtract(1, "month"),
        moment(this.currentMoment),
        moment(this.currentMoment).add(1, "month")
      );
    },
    initWeekFun() {
      this.initWeekList(
        moment(this.currentMoment).subtract(7, "days"),
        this.currentMoment,
        moment(this.currentMoment).add(7, "days")
      );
    },
    slideChangeEnd(e) {
      if (e === 3) {
        if (!this.isShowAllMonth) {
          this.currentMoment = moment(this.currentMoment).add(7, "days");
          this.initWeekFun();
        } else {
          this.currentMoment = moment(this.currentMoment).add(1, "month");
          this.initMonthFun();
        }
      } else if (e === 1) {
        if (!this.isShowAllMonth) {
          this.currentMoment = moment(this.currentMoment).subtract(7, "days");
          this.initWeekFun();
        } else {
          this.currentMoment = moment(this.currentMoment).subtract(1, "month");
          this.initMonthFun();
        }
      }
      this.$refs.customSwiper.setPage(2);
    },
    onTouchstart(e) {
      if (this.type === "week") {
        return;
      }
      this.startY = e.touches[0].pageY;
      this.touching = true;
    },
    onTouchmove(e) {
      if (this.type === "week") {
        return;
      }
      //获取移动的距离
      let diff = e.touches[0].pageY - this.startY;
      if (diff > 20) {
        if (!this.isShowAllMonth && this.touching) {
          this.initMonthFun();
          this.isShowAllMonth = true;
        }
      } else if (diff < -50) {
        if (this.isShowAllMonth && this.touching) {
          this.initWeekFun();
          this.isShowAllMonth = false;
        }
      }
    },
    onTouchend() {
      if (this.type === "week") {
        return;
      }
      this.touching = false;
    },
    handlerWeekDayClick(date) {
      this.$emit("input", date.date.timeString);
      this.selectDateChange && this.selectDateChange(date);
      this.currentMoment = date.date.timeString;
    },
    handlerMonthDayClick(date) {
      this.$emit("input", date.date.timeString);
      this.selectDateChange && this.selectDateChange(date);
      this.currentMoment = date.date.timeString;
    },
    isSameDate(date1, date2) {
      let date1Format = moment(date1).format("YYYY-MM-DD");
      let date2Format = moment(date2).format("YYYY-MM-DD");
      return moment(date1Format).isSame(moment(date2Format));
    },
    isSameToday(date1) {
      let date1Format = moment(date1).format("YYYY-MM-DD");
      let date2Format = moment().format("YYYY-MM-DD");
      return moment(date1Format).isSame(moment(date2Format));
    },
    renderBadge(date) {
      let count = null;
      this.configDayData.forEach(item => {
        let m1 = moment(item.date).format("YYYY-MM-DD");
        let m2 = moment(date).format("YYYY-MM-DD");
        if (moment(m1).isSame(moment(m2))) {
          count = item.numberCount;
        }
      });
      return count;
    }
  }
};
</script>

<style lang="less" scoped>
* {
  touch-action: none;
}
@import "../../assets/index.css";
</style>
