import ButtonNextMonth from '@/components/Buttons/ButtonNextMonth.vue';
import { mount, VueWrapper } from '@vue/test-utils';
import { DateTime } from 'luxon';
import { Date2024Oct23 } from '../../fakes/monthDays';

const dateToTest = '2024-02-10';
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

let wrapper: VueWrapper<InstanceType<typeof ButtonNextMonth>>

describe('ButtonNextMonth', () => {

  beforeEach(() => {
    wrapper = mount(ButtonNextMonth);
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
    const expected = '2024-03-10'

    await wrapper.find('button').trigger('click');

    expect(monthDays.value).toStrictEqual(Date2024Oct23);
    expect(currentDate.value).toStrictEqual(DateTime.fromISO(expected));
    expect(mockGenerateCalendar).toHaveBeenCalledWith(expected);
    expect(wrapper.emitted('handle')).toStrictEqual([[expected]]);

    await wrapper.find('button').trigger('click');
    expect(wrapper.emitted('handle')).toStrictEqual([[expected], ['2024-04-10']]);
    expect(currentDate.value).toStrictEqual(DateTime.fromISO('2024-04-10'));
  })
});