<template>
  <section class="k-alendar-wrapper-container">
    <header class="k-alendar-header-container">
      <div class="left-buttons">
        <div class="navegation-buttons">
          <button type="button" class="k-alendar-navegation-prev" @click="prevMonth">&larr;</button>
          <button type="button" class="k-alendar-navegation-left" @click="nextMonth">&rarr;</button>
        </div>
        <button type="button" class="k-alendar-today-button" @click="toToday">
          {{ buttonsTranslations.buttons.today }}
        </button>
      </div>
      <div class="center-title">
        <h2>{{ title }}</h2>
      </div>
      <div class="left-buttons">
        <button type="button" class="k-alendar-today-button">
          {{ buttonsTranslations.dayView }}
        </button>
        <button type="button" class="k-alendar-today-button">
          {{ buttonsTranslations.monthView }}
        </button>
      </div>
    </header>
    <div class="k-alendar-days-container">
      <div v-for="day in getWeekDays()" :key="day">{{ day }}</div>
    </div>
    <div class="k-alendar-container">
      <div
        v-for="calendar in monthDays"
        :key="calendar.day.toString()"
        @click="selectThisDate(calendar)"
        :class="calendar.class"
        class="date"
        :ref="(el) => (dateRefs[calendar.day] = el)"
      >
        <div class="k-alendar-span-container">
          <span class="k-alendar-text">{{ calendar.text }}</span>
          <span class="point" v-if="calendar.events.length > 0" />
        </div>
        <div class="events" v-if="calendar.events.length > 0">
          <ul>
            <KEventItem
              v-for="event in howEventsShouldRender(calendar.day, calendar.events)"
              :key="event.id"
              :event="event"
              :calendar
              @eventClicked="eventClicked"
            />
          </ul>
        </div>
      </div>
    </div>
    <KAlendarEventDetailDialog
      v-model="openEventsDetailDialog"
      :event="eventSelected"
      :calendar="calendarDaySelect"
      :canDelete="canDelete"
      :canEdit="canEdit"
      @eventClicked="eventClickedFromDialog"
      @edit="edit"
      @delete="deleteEvent"
      :style="{
        top: `${dialogPositionToRender.y}px`,
        left: `${dialogPositionToRender.x}px`
      }"
    />
  </section>
</template>

<script setup lang="ts">
import useRenderCalendar from '@/composables/useRenderCalendar'
import type { DayCalendar, MonthDays } from '@/types/Calendar'
import type { KEvent, KEventDialogEmit } from '@/types/Events'
import { computed, ref, watch } from 'vue'
import KAlendarEventDetailDialog from './KAlendarEventDetailDialog.vue'
import KEventItem from '@/components/KEventItem.vue'
import useConfig from '@/composables/useConfig'
import { useDialog } from '@/composables/useDialog'
import { translations } from '@/langs/traductions'

const emit = defineEmits([
  'nextMonth',
  'prevMonth',
  'toToday',
  'edit',
  'delete',
  'eventClicked',
  'eventDialogClicked'
])

const props = defineProps<{
  events: KEvent[]
  lang?: string
  canEdit?: boolean
  canDelete?: boolean
}>()

const { setLang } = useConfig()
const { collision } = useDialog()

const {
  nextMonth,
  prevMonth,
  eventsToShowInCalendar,
  toToday,
  title,
  generateCalendar,
  monthDays,
  getWeekDays,
  currentDate
} = useRenderCalendar(emit)

const eventSelected = ref<KEvent>({
  id: '',
  title: '',
  start_date: '',
  description: ''
})
const calendarDaySelect = ref<MonthDays | null>(null)
const dateRefs = ref<Record<string, any>>({})
const openEventsDetailDialog = ref(false)
const dialogPositionToRender = ref({ x: 0, y: 0 })

const regenerateCalendar = () => {
  eventsToShowInCalendar.value = props.events
  let currentDt = ''

  currentDt = currentDate.value.toFormat('yyyy-MM-dd')
  monthDays.value = generateCalendar(currentDt)
}

const buttonsTranslations = computed(() => {
  return translations[props.lang || 'es']
})

watch(
  () => props.lang,
  (lang) => {
    if (lang) {
      setLang(lang)
    }
  },
  { immediate: true }
)

watch(
  props,
  ({ events }) => {
    if (events) {
      regenerateCalendar()
    }
  },
  { immediate: true, deep: true }
)

const eventClickedFromDialog = ({ event, closeDialog }: KEventDialogEmit) => {
  emit('eventDialogClicked', { event: props.events.find((e) => (e.id = event.id)), closeDialog })
}

const eventClicked = ({
  mauseEvent,
  event,
  calendar
}: {
  mauseEvent: MouseEvent
  event: KEvent
  day: string
  calendar: DayCalendar
}) => {
  eventSelected.value = event
  calendarDaySelect.value = calendar

  if (calendar.events.length > 0) {
    let target = mauseEvent.target as HTMLElement

    if (target.tagName === 'H3') {
      target = target.parentElement as HTMLElement
    }

    dialogPositionToRender.value = collision(target)

    openEventsDetailDialog.value = true
  }

  emit('eventClicked', {
    event: props.events.find((e) => (e.id = event.id)),
    calendar,
    mauseEvent
  })
}

const edit = ({ closeDialog, event }: KEventDialogEmit) => {
  emit('edit', { closeDialog, event })
}

const deleteEvent = ({ closeDialog, event }: KEventDialogEmit) => {
  emit('delete', { closeDialog, event })
}

const calculateEventsThatCanBeRender = (day: string) => {
  const dateDiv: HTMLDivElement | null = dateRefs.value[day]
  let heightOfEventParent = 0
  const heightOfLiElement = 32
  const paddingTopOfLiElement = 8
  const paddingOfDateDiv = 8

  let totalOfEventsThatCanRender = 0

  if (dateDiv) {
    heightOfEventParent = dateDiv.clientHeight - paddingOfDateDiv * 2

    const sizeOfSpan = (dateDiv.querySelector('span.k-alendar-text') as HTMLSpanElement)
      ?.offsetHeight
    heightOfEventParent -= sizeOfSpan || 0
    totalOfEventsThatCanRender = Math.floor(
      heightOfEventParent / (heightOfLiElement + paddingTopOfLiElement)
    )
  }

  return totalOfEventsThatCanRender
}

const howEventsShouldRender = (day: string, events: KEvent[]) => {
  const totalOfEventsThatCanRender = calculateEventsThatCanBeRender(day)

  const eventsToRender = events.slice(0, totalOfEventsThatCanRender)

  if (events.length - totalOfEventsThatCanRender > 0) {
    eventsToRender.splice(eventsToRender.length - 1, 1, {
      id: 'more',
      title: `+${events.length + 1 - totalOfEventsThatCanRender}`,
      start_date: '',
      description: ''
    })
  }

  return eventsToRender
}

const selectThisDate = (calendar: MonthDays) => {
  /**
   * cuando es mobile < 768px
   */
  if (window.innerWidth < 768) {
    const sizeOfDialog = 400
    const x = Math.floor((window.innerWidth - sizeOfDialog) / 2)
    dialogPositionToRender.value = { x, y: 16 }

    if (calendar.events.length > 0) {
      if (calendar.events.length === 1) {
        eventSelected.value = calendar.events[0]
      } else {
        eventSelected.value = {
          id: 'more',
          title: `+${calendar.events.length} eventos`,
          start_date: '',
          description: ''
        }
      }
      calendarDaySelect.value = calendar
      openEventsDetailDialog.value = true
    }
  }
}
</script>

<style scoped lang="postcss">
.k-alendar-wrapper-container {
  @apply space-y-4 dark:text-slate-100;
}

button {
  @apply hover:bg-[#ebeef5] transition-colors dark:hover:bg-slate-600;
}

.k-alendar-days-container {
  @apply grid gap-1 auto-rows-auto border border-gray-200 rounded-sm text-center capitalize
  dark:border-gray-600;
  grid-template-columns: repeat(7, minmax(0, 1fr));
}

.k-alendar-container {
  @apply grid gap-1 auto-rows-auto;
  grid-template-columns: repeat(7, minmax(0, 1fr));
}

.k-alendar-header-container {
  @apply flex justify-between space-y-2 items-center sm:space-y-0;
  .center-title > h2 {
    @apply capitalize;
  }
  .left-buttons {
    @apply flex items-center space-x-2;
  }

  .k-alendar-navegation-prev {
    @apply px-2 py-1 border border-gray-200 rounded-l-md rounded-r-none w-16
    lg:p-2
    dark:border-slate-600;
  }
  .k-alendar-navegation-left {
    @apply px-2 py-1 border border-gray-200 rounded-r-md w-16 transition-colors duration-200
    lg:p-2
    dark:border-slate-500;
  }
}

.k-alendar-container > * {
  aspect-ratio: 1 / 1;
}

.k-alendar-span-container {
  @apply flex justify-between items-center w-full;
  .k-alendar-text {
    @apply font-bold;
  }
}

.date {
  @apply flex items-start justify-start p-2 cursor-pointer flex-col relative rounded-sm
  hover:bg-[#ebeef5] dark:hover:bg-slate-600;
  @apply border border-gray-200 dark:border-slate-600;
}

.other-month-date {
  @apply text-gray-400;
}

.events {
  @apply w-full hidden md:block;
  ul {
    @apply list-none space-y-2;
  }
}

.point {
  @apply w-2 h-2 bg-blue-500 rounded-full md:hidden;
}

.selected {
  @apply bg-[#ebeef5] text-inherit p-2
  dark:bg-slate-700;
}
.k-alendar-today-button {
  @apply px-2 py-1 border border-gray-200 rounded-md
  lg:p-2
  dark:border-slate-600;
}
</style>
