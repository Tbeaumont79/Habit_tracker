import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import BentoCard from '@/components/dashboard/BentoCard.vue'

describe('BentoCard', () => {
  it('renders with size class "small" by default', () => {
    const wrapper = mount(BentoCard)
    expect(wrapper.classes()).toContain('bento-card--small')
  })

  it('renders with size class "medium" when size prop is medium', () => {
    const wrapper = mount(BentoCard, {
      props: { size: 'medium' },
    })
    expect(wrapper.classes()).toContain('bento-card--medium')
  })

  it('renders with size class "large" when size prop is large', () => {
    const wrapper = mount(BentoCard, {
      props: { size: 'large' },
    })
    expect(wrapper.classes()).toContain('bento-card--large')
  })

  it('renders title when provided', () => {
    const wrapper = mount(BentoCard, {
      props: { title: 'Test Title' },
    })
    expect(wrapper.text()).toContain('Test Title')
  })

  it('renders icon when provided', () => {
    const wrapper = mount(BentoCard, {
      props: { icon: '🔥' },
    })
    expect(wrapper.text()).toContain('🔥')
  })

  it('does not render header when neither title nor icon provided', () => {
    const wrapper = mount(BentoCard)
    expect(wrapper.find('.bento-card__header').exists()).toBe(false)
  })

  it('renders default slot content', () => {
    const wrapper = mount(BentoCard, {
      slots: {
        default: '<span class="slot-content">Hello</span>',
      },
    })
    expect(wrapper.find('.slot-content').exists()).toBe(true)
    expect(wrapper.find('.slot-content').text()).toBe('Hello')
  })

  it('always has bento-card base class', () => {
    const sizes = ['small', 'medium', 'large'] as const
    for (const size of sizes) {
      const wrapper = mount(BentoCard, { props: { size } })
      expect(wrapper.classes()).toContain('bento-card')
    }
  })
})
