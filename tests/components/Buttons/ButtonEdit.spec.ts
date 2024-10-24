import ButtonEdit from '@/components/Buttons/ButtonEdit.vue';
import { mount, VueWrapper } from '@vue/test-utils';
import { beforeEach, describe, expect, it, vi } from 'vitest';

let wrapper: VueWrapper<InstanceType<typeof ButtonEdit>>

describe('ButtonEdit', () => {

  beforeEach(() => {
    wrapper = mount(ButtonEdit);
  })

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render the component', () => {
    expect(wrapper.html()).toMatchSnapshot();
  });
});