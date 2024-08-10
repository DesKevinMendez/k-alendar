import type { DayCalendar, MonthDays } from '@/types/Calendar';
import type { KEvent } from '@/types/Events';
import { DateTime, Interval, Settings } from 'luxon';
import { computed, onMounted, ref } from "vue";
import useDate from './useDate';
const monthDays = ref<MonthDays[]>([])
const currentDate = ref(DateTime.utc())

Settings.defaultLocale = 'es';

export default function useRenderCalendar(events: KEvent[]) {
  const { todayUTC } = useDate()
  const getWeekDays = () => {
    const start = DateTime.utc().startOf('week');
    const end = DateTime.utc().endOf('week');

    const days = [];
    let currentDay = start;

    while (currentDay <= end) {
      days.push(currentDay.setLocale('es').toFormat('ccc'));
      currentDay = currentDay.plus({ days: 1 });
    }

    return days;
  };

  const generateDayOfTheMonth = (date: string) => {
    const [year, month, day] = date.split('-').map(Number);
    const generateCalendarFromDate = DateTime.utc().set({ year, month, day });
    const startOfMonth = generateCalendarFromDate.startOf('month');
    const endOfMonth = generateCalendarFromDate.endOf('month');
    const startOfWeek = startOfMonth.startOf('week');
    const endOfWeek = endOfMonth.endOf('week');

    const days = [];
    let currentDay = startOfWeek;

    while (currentDay <= endOfWeek) {
      days.push(currentDay.toISODate());
      currentDay = currentDay.plus({ days: 1 });
    }

    return days;
  }

  const isWithinInterval = (date: string, {
    startDate,
    endDate
  }: { startDate: string, endDate: string }): boolean => {

    const dateToCheck = DateTime.fromISO(date);
    const start = DateTime.fromISO(startDate, { zone: 'utc' });
    const end = DateTime.fromISO(endDate, { zone: 'utc' });

    const interval = Interval.fromDateTimes(start, end);
    return interval.contains(dateToCheck);
  };

  const generateCalendar = (date: string): DayCalendar[] => {
    return generateDayOfTheMonth(date).map((day) => {
      const classToButton = []

      const fillEvents: KEvent[] = [];

      const currentDay = DateTime.fromISO(day);
      const targetDate = DateTime.fromISO(date);

      events.forEach(event => {
        if (event.end_date &&
          isWithinInterval(day, {
            startDate: event.start_date,
            endDate: event.end_date
          })) {

          fillEvents.push({ ...event, start_date: day });
        } else {
          fillEvents.push(event);
        }
      });

      const eventsToRender = fillEvents.filter((event) => {
        return currentDay.hasSame(DateTime.fromISO(event.start_date), 'day')
      })

      if (!currentDay.hasSame(targetDate, 'month')) {
        classToButton.push('other-month-date');
      }

      if (currentDay.hasSame(DateTime.fromISO(todayUTC.value), 'day')) {
        classToButton.push('selected')
      }

      return {
        day: day,
        class: classToButton.join(' '),
        events: eventsToRender || [],
        text: DateTime.fromISO(day).day.toString()
      }
    });

  }

  onMounted(() => {
    monthDays.value = generateCalendar(todayUTC.value)
  })

  const title = computed(() => {
    return DateTime.fromJSDate(currentDate.value.toJSDate()).toFormat('MMMM yyyy');
  })

  const nextMonth = () => {
    currentDate.value = currentDate.value.plus({ months: 1 })

    const next = DateTime.fromJSDate(currentDate.value.toJSDate()).toFormat('yyyy-MM-dd');
    monthDays.value = generateCalendar(next)
  }

  const prevMonth = () => {
    currentDate.value = currentDate.value.minus({ months: 1 })
    const prev = DateTime.fromJSDate(currentDate.value.toJSDate()).toFormat('yyyy-MM-dd');

    monthDays.value = generateCalendar(prev)
  }

  const toToday = () => {
    currentDate.value = DateTime.utc()

    monthDays.value = generateCalendar(todayUTC.value)
  }

  return { nextMonth, prevMonth, toToday, title, monthDays, getWeekDays }
}