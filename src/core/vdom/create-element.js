/* @flow */

import config from '../config'
import VNode, { createEmptyVNode } from './vnode'
import { createComponent } from './create-component'

import {
  warn,
  isDef,
  isUndef,
  isTrue,
  isPrimitive,
  resolveAsset
} from '../util/index'

import {
  normalizeChildren,
  simpleNormalizeChildren
} from './helpers/index'

const SIMPLE_NORMALIZE = 1
const ALWAYS_NORMALIZE = 2

// wrapper function for providing a more flexible interface
// without getting yelled at by flow
// createElement封装_createElement,可以传入参数更灵活
export function createElement ( // 创建VNode
  context: Component, // vm
  tag: any,
  data: any,
  children: any,
  normalizationType: any,
  alwaysNormalize: boolean // 用户手写render时为true；编译生成时为false
): VNode {
  // 处理参数
  if (Array.isArray(data) || isPrimitive(data)) { // 数组 || 基本数据类型（string/boolean/number）
    // 不是对象类型，说明省略了data，这里是children，之后的都要往上移
    normalizationType = children
    children = data
    data = undefined
  }
  if (isTrue(alwaysNormalize)) {
    normalizationType = ALWAYS_NORMALIZE
  }
  // _createElement 真正创建VNode的函数
  return _createElement(context, tag, data, children, normalizationType)
}

export function _createElement (
  context: Component, // VNode的上下文环境
  tag?: string | Class<Component> | Function | Object, // 标签
  data?: VNodeData,
  children?: any,
  normalizationType?: number // 子节点规范的类型
): VNode {
  // isDef: !null && !undefined
  // 一旦有__ob__说明是响应式属性，报警告
  // 不允许VNodeData是响应式的
  if (isDef(data) && isDef((data: any).__ob__)) {
    // 语法高亮出问题，先注释了
    // process.env.NODE_ENV !== 'production' && warn(
    //   `Avoid using observed data object as vnode data: ${JSON.stringify(data)}\n` +
    //   'Always create fresh vnode data objects in each render!',
    //   context
    // )
    // vnode.js 注释节点
    return createEmptyVNode()
  }
  // object syntax in v-bind
  if (isDef(data) && isDef(data.is)) {
    tag = data.is
  }
  if (!tag) {
    // in case of component :is set to falsy value
    return createEmptyVNode()
  }
  // warn against non-primitive key
  // 数据类型基础校验
  if (process.env.NODE_ENV !== 'production' &&
    isDef(data) && isDef(data.key) && !isPrimitive(data.key)
  ) {
    warn(
      'Avoid using non-primitive value as key, ' +
      'use string/number value instead.',
      context
    )
  }
  // support single function children as default scoped slot
  if (Array.isArray(children) &&
    typeof children[0] === 'function'
  ) {
    data = data || {}
    data.scopedSlots = { default: children[0] }
    children.length = 0
  }

  // ! 把children处理成一维数组
  if (normalizationType === ALWAYS_NORMALIZE) { // 用户手写render
    /*
      render: function(createElement) {
        return createElement(
          "h1", // 标签
          this.message // 子节点
        )
      }
      // 子节点应该是Array<VNode>类型，所以需要normalizeChildren
    */
    // vdom/helpers/normalize-children.js
    children = normalizeChildren(children)
  } else if (normalizationType === SIMPLE_NORMALIZE) { // 编译生成render
    children = simpleNormalizeChildren(children)
  }
  // 创建vnode
  let vnode, ns
  if (typeof tag === 'string') { // tag是string，"p"、"div"等
    let Ctor
    ns = (context.$vnode && context.$vnode.ns) || config.getTagNamespace(tag)
    if (config.isReservedTag(tag)) { // 是否html原生保留标签
      // platform built-in elements
      vnode = new VNode(
        config.parsePlatformTagName(tag), data, children,
        undefined, undefined, context
      )
    } else if (isDef(Ctor = resolveAsset(context.$options, 'components', tag))) { // 组件
      // component
      vnode = createComponent(Ctor, data, context, children, tag)
    } else { // 不认识
      // unknown or unlisted namespaced elements
      // check at runtime because it may get assigned a namespace when its
      // parent normalizes children
      vnode = new VNode(
        tag, data, children,
        undefined, undefined, context
      )
    }
  } else { // tag是一个组件
    // direct component options / constructor
    vnode = createComponent(tag, data, context, children)
  }
  if (isDef(vnode)) {
    if (ns) applyNS(vnode, ns)
    return vnode
  } else {
    return createEmptyVNode()
  }
}

function applyNS (vnode, ns, force) {
  vnode.ns = ns
  if (vnode.tag === 'foreignObject') {
    // use default namespace inside foreignObject
    ns = undefined
    force = true
  }
  if (isDef(vnode.children)) {
    for (let i = 0, l = vnode.children.length; i < l; i++) {
      const child = vnode.children[i]
      if (isDef(child.tag) && (isUndef(child.ns) || isTrue(force))) {
        applyNS(child, ns, force)
      }
    }
  }
}
