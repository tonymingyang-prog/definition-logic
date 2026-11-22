// 定义逻辑 · 浏览器半边：侧栏入口 + 定义逻辑面板
window.__ModuleLoader__.load({
  id: 'dsh-guizang-elements',
  factory: (require) => {
    // CommonJS 兼容层：DSH 客户端 loader 不会注入 module/exports，
    // 这里自己声明，避免 "exports is not defined"。
    const module = { exports: {} }
    const exports = module.exports
    const React = require('react')
    const h = React.createElement
    const PANEL = 'guizang-elements'
    const SRC = '/guizang-elements/'

    // 图标：三个基本形的组合
    function ElementsIcon(props) {
      const s = (props && props.size) || 18
      return h('svg', {
        width: s, height: s, viewBox: '0 0 24 24', fill: 'none',
        stroke: 'currentColor', strokeWidth: 1.5, strokeLinejoin: 'round', strokeLinecap: 'round',
      },
        h('rect', { x: 3.5, y: 3.5, width: 7, height: 7, rx: 1.5 }),
        h('circle', { cx: 17, cy: 7, r: 3.5 }),
        h('path', { d: 'M7 13.5 10.5 20h-7z' }),
        h('rect', { x: 13.5, y: 13.5, width: 7, height: 7, rx: 1.5 }))
    }

    function apply(ctx) {
      function ElementsPanel() {
        return h('iframe', {
          src: SRC,
          title: '定义逻辑',
          allow: 'fullscreen',
          style: { width: '100%', height: '100%', border: 0, display: 'block' },
        })
      }
      ctx.slots.inject('sidebar.panellist', () =>
        ctx.slots.register({ name: 'sidebar.panellist', id: PANEL, order: 7, label: () => '定义逻辑' }, ElementsIcon))
      ctx.slots.inject('main', () => ctx.slots.register({ name: 'main', key: PANEL }, ElementsPanel))
    }

    exports.isPlugin = true
    exports.inject = ['slots']
    exports.apply = apply
    return module.exports
  },
})
