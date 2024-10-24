
import ButtonTodayMonth from '@/components/Buttons/ButtonTodayMonth.vue';
import useConfig from '@/composables/useConfig';
import { mount, VueWrapper } from '@vue/test-utils';
import { DateTime, Settings } from 'luxon';
import { Date2024Oct23 } from '../../fakes/monthDays';
const { setLang } = useConfig()

const dateToTest = '2024-09-10';
const mockGenerateCalendar = vi.fn().mockReturnValue(Date2024Oct23);
const currentDate = { value: DateTime.fromISO(dateToTest) };
const monthDays = { value: [] };

vi.mock('@/composables/useRenderCalendar', () => ({
  default: vi.fn(() => ({
    currentDate,
    monthDays,
    generateCalendar: mockGenerateCalendar,
  })),
}));

let wrapper: VueWrapper<InstanceType<typeof ButtonTodayMonth>>

describe('ButtonTodayMonth', () => {

  beforeEach(() => {
    wrapper = mount(ButtonTodayMonth);
  });

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('should render the component', () => {
    expect(wrapper.html()).toMatchSnapshot();
  });

  it('init values for composable useRenderCalendar', () => {
    expect(monthDays.value).toStrictEqual([]);
    expect(currentDate.value).toStrictEqual(DateTime.fromISO(dateToTest));
  })

  it('do click on the button', async () => {
    const today = '2024-09-23'

    // mock DateTime.now()
    const t = DateTime.fromISO(today);
    Settings.now = () => t.toMillis();

    const button = wrapper.find('button');
    await button.trigger('click');

    expect(monthDays.value).toStrictEqual(Date2024Oct23);
    expect(currentDate.value).toStrictEqual(DateTime.fromISO(today));
    expect(mockGenerateCalendar).toHaveBeenCalledWith(today);
    expect(wrapper.emitted('handle')).toStrictEqual([[today]]);

    await wrapper.find('button').trigger('click');
    expect(wrapper.emitted('handle')).toStrictEqual([[today], ['2024-09-23']]);
    expect(currentDate.value).toStrictEqual(DateTime.fromISO('2024-09-23'));
  })

  describe('computed text', () => {
    it('by default', async () => {
      const button = wrapper.find('button');

      expect(button.text()).toBe('Today');
    })

    it('is es', async () => {
      setLang('es');
      await wrapper.vm.$nextTick();

      const button = wrapper.find('button');

      expect(button.text()).toBe('Hoy');
    })

    it('is it', async () => {
      setLang('it');
      await wrapper.vm.$nextTick();

      const button = wrapper.find('button');

      expect(button.text()).toBe('Oggi');
    })

    it('lang is invalid, it should be english', async () => {
      setLang('invalid');
      await wrapper.vm.$nextTick();

      const button = wrapper.find('button');

      expect(button.text()).toBe('Today');
    })
  })
});