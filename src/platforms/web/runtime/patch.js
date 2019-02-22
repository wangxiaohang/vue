/* @flow */

import * as nodeOps from 'web/runtime/node-ops'
import { createPatchFunction } from 'core/vdom/patch'
import baseModules from 'core/vdom/modules/index'
import platformModules from 'web/runtime/modules/index'

// the directive module should be applied last, after all
// built-in modules have been applied.
const modules = platformModules.concat(baseModules)

/* 
  高阶函数，函数柯里化思想，
  将不同性质的参数通过闭包的形式传进去，避免了一个函数中多次使用 if...else

  1. 高阶函数：函数作为参数传递，或函数做会返回值返回
     比如ajax回调，柯里化都用到
  2. 函数柯里化：把同时接收多个参数的函数，转变成每次只接收一个函数的新函数
     
*/
export const patch: Function = createPatchFunction({ nodeOps, modules })
