<template>
  <button type="button" class="k-alendar-navegation-left" @click="handleClick">&rarr;</button>
</template>

<script setup lang="ts">
import useRenderCalendar from '@/composables/useRenderCalendar';
import { DateTime } from 'luxon';
const { currentDate, monthDays, generateCalendar } = useRenderCalendar()
const emit = defineEmits(['handle'])

const handleClick = () => {
  currentDate.value = currentDate.value.plus({ months: 1 })

  const next = DateTime.fromJSDate(currentDate.value.toJSDate()).toFormat('yyyy-MM-dd')
  monthDays.value = generateCalendar(next)

  emit('handle', next)
}
</script>

<style scoped lang="postcss">
.k-alendar-navegation-left {
  @apply px-2 py-1 border border-gray-200 rounded-r-md w-16 transition-colors duration-200
    lg:p-2
    dark:border-slate-500;
}
</style>
