import kAlendar from '@/components/KAlendar.vue';
import { mount, VueWrapper } from '@vue/test-utils';
import MockDate from 'mockdate';
import { beforeEach, describe, expect, it } from 'vitest';
const fakeDate = '2024-08-22T03:59:10.000000Z';

const props = {
  events: [
    {
      id: '9cc69d03-7215-41e2-966a-9c787b690223',
      title: 'Dto',
      description: 'Das',
      color: '#a02222',
      start_date: '2024-08-16T00:35:00.000000Z',
      end_date: '2024-08-17T00:35:00.000000Z'
    },
  ]
}
let wrapper: VueWrapper<InstanceType<typeof kAlendar>>

describe('kAlendar', () => {

  beforeEach(() => {
    MockDate.set(fakeDate)
    wrapper = mount(kAlendar, {
      props,
    });
  })

  beforeEach(() => {
    MockDate.reset();
  });

  it('should render the component', () => {
    expect(wrapper.html()).toMatchSnapshot();
  });
});
