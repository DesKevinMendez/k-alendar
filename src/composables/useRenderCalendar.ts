import type { DayCalendar, MonthDays } from '@/types/Calendar';
import type { KEvent, KEventCalendarRender } from '@/types/Events';
import { DateTime, Interval } from 'luxon';
import { computed, ref } from "vue";
import useConfig from './useConfig';
import useDate from './useDate';

const monthDays = ref<MonthDays[]>([])
const eventsToShowInCalendar = ref<KEvent[]>([])
const calendarDaySelect = ref<MonthDays | null>(null)
const currentDate = ref(DateTime.now())

export default function useRenderCalendar() {

  const { today } = useDate()
  const { lang } = useConfig();

  const eventsToShowInCalendarMutated = computed(() => {
    return eventsToShowInCalendar.value.map((event) => {
      return {
        ...event,
        date_calendar_to_render: event.start_date
      }
    })
  })

  const generateDayOfTheMonth = (date: string) => {
    const [year, month, day] = date.split('-').map(Number);
    const generateCalendarFromDate = DateTime.now().set({ year, month, day });
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

    const dateToCheck = DateTime.fromISO(date,);
    const start = DateTime.fromISO(startDate,);
    const end = DateTime.fromISO(endDate,);

    const interval = Interval.fromDateTimes(start, end);
    return interval.contains(dateToCheck);
  };

  const generateCalendar = (date: string): DayCalendar[] => {
    return generateDayOfTheMonth(date).map((day) => {
      const classToButton = []

      const fillEvents: KEventCalendarRender[] = [];

      const currentDay = DateTime.fromISO(day,);
      const targetDate = DateTime.fromISO(date,);

      eventsToShowInCalendarMutated.value.forEach(event => {
        if (event.end_date &&
          isWithinInterval(day, {
            startDate: event.start_date,
            endDate: event.end_date
          })) {

          fillEvents.push({ ...event, date_calendar_to_render: day });
        } else {
          fillEvents.push(event);
        }
      });

      const eventsToRender = fillEvents.filter((event) => {
        return currentDay.hasSame(DateTime.fromISO(event.date_calendar_to_render), 'day')
      })

      if (!currentDay.hasSame(targetDate, 'month')) {
        classToButton.push('other-month-date');
      }

      if (currentDay.hasSame(DateTime.fromISO(today.value), 'day')) {
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

  const title = computed(() => {
    return DateTime.fromJSDate(currentDate.value.toJSDate())
      .setLocale(lang.value)
      .toFormat('MMMM yyyy');
  })

  return {
    eventsToShowInCalendar,
    calendarDaySelect,
    title, monthDays,
    generateCalendar,
    currentDate
  }
}