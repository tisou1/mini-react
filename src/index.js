// import React  from 'react'
// import ReactDOM from 'react-dom'
// import APP from './App'

// ReactDOM.render(
//     <APP />,
//     document.querySelector('#root')
// )


import React from 'react'
/** createElement */
function createElement(type, props, ...children) {
  return {
    type,
    props: {
      ...props,
      children: children.map(child =>
        typeof child === 'object'
          ? child
          : createTextElement(child),
      ),
    },
  }
}

/** createtextElement */
function createTextElement(text) {
  // react中不会有空数组的children,这里只是为了简便
  return {
    type: 'TEXT_ELEMENT',
    props: {
      nodeValue: text,
      children: [],
    },
  }
}

/** render方法 */
function render(element, container) {
  // TODO
  // 根据穿入的react element穿件真实的dom
  // 特殊处理文本节点
  const dom = element.type === 'TEXT_ELEMENT'
    ? document.createTextNode('')
    : document.createElement(element.type)

  /** 从props中过滤掉children属性 */
  const isProperty = key => key !== 'children'
  // 将element的属性赋值到node节点中
  Object.keys(element.props)
    .filter(isProperty)
    .forEach((name) => {
      dom[name] = element.props[name]
    })

  // 递归的将子元素也添加倒容器中
  element.props.children.forEach(child => render(child, dom))

  // 添加到这个容器中
  container.appendChild(dom)
}

let nextUnitOfWork = null

/**workLoop */
function workLoop(deadline) {
    
  requestIdleCallback(workLoop)
}

requestIdleCallback(workLoop)


/** 自定义库的名字 */
const Didact = {
  createElement,
  render,
}

// 有下面的comment babel就会使用我们自己的createElement方法
/** @jsx Didact.createElement */
const element = (
  <div id="foo" className='ccc'>
    <a>bar</a>
    <b></b>
  </div>
)
const container = document.getElementById('root')

Didact.render(element, container)
