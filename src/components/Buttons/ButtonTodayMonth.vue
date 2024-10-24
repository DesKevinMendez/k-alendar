<template>
  <button type="button" class="k-alendar-today-button" @click="handleClick">{{ text }}</button>
</template>

<script setup lang="ts">
import useConfig from '@/composables/useConfig'
import useDate from '@/composables/useDate'
import useRenderCalendar from '@/composables/useRenderCalendar'
import { translations } from '@/locales/traductions';
import { DateTime } from 'luxon'
import { computed } from 'vue';
const emit = defineEmits(['handle'])
const { currentDate, monthDays, generateCalendar } = useRenderCalendar()
const { today } = useDate()
const { lang } = useConfig()

const handleClick = () => {
  currentDate.value = DateTime.now()

  monthDays.value = generateCalendar(today.value)

  emit('handle', today.value)
}

const text = computed(() => {
  return translations[lang.value]?.buttons.today || 'Today'
})
</script>

<style scoped lang="postcss">
.k-alendar-today-button {
  @apply px-2 py-1 border border-gray-200 rounded-md
  lg:p-2
  dark:border-slate-600;
}
</style>
