import ButtonDelete from '@/components/Buttons/ButtonDelete.vue';
import { mount, VueWrapper } from '@vue/test-utils';
import { beforeEach, describe, expect, it, vi } from 'vitest';

let wrapper: VueWrapper<InstanceType<typeof ButtonDelete>>

describe('ButtonDelete', () => {

  beforeEach(() => {
    wrapper = mount(ButtonDelete);
  })

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render the component', () => {
    expect(wrapper.html()).toMatchSnapshot();
  });
});