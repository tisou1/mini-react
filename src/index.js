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
function createDom(fiber) {
  //把fiber上的属性移到真是dom上
  const dom =
    fiber.type == "TEXT_ELEMENT"
      ? document.createTextNode("")
      : document.createElement(fiber.type)

  const isProperty = key => key !== "children"

  Object.keys(fiber.props)
    .filter(isProperty)
    .forEach(name => {
      dom[name] = fiber.props[name]
    })

  return dom
}


function render(element, container) {
  //将nextUnitOfworl设置为root fiber
  nextUnitOfWork = {
    dom: container,
    props: {
      children: [element]
    }
  }

}



let nextUnitOfWork = null

/**workLoop */
function workLoop(deadline) {
  let shouldYield = false
  while(!shouldYield && nextUnitOfWork) {
    nextUnitOfWork = performUnitOfWork(nextUnitOfWork)
  }
  shouldYield = deadline.timeRemaining() < 1
  requestIdleCallback(workLoop)
}

//当浏览器准备好的时候,就会调用wordLoop
requestIdleCallback(workLoop)



/**
 * 不仅执行函数,而且返回一个工作单元
 */
function performUnitOfWork(fiber) {
  /**
   * 1. 添加dom节点
   * 2. 创建新的fiber
   * 3. 返回下一个工作单元
   */
  /**
   * fiber结构有三个指向,分别是parent child(第一个孩子) 下一个sibling(兄弟)
   * 1.当前fiber完成后,它的child是下一个工作单元
   * 2.如果没有孩子,就去找他的sibling(兄弟节点)作为下一个工作单元
   * 3.如果既没有child和sibling的话就去找"uncle"(叔叔)即sibling的parent
   * 4.如果该fiber的parent没有sibling,就会通过parent直到找到一个有sibling的或者到root了也就意味着渲染工作完成了.
   */
  //1.
  if(!fiber.dom) {
    fiber.dom = createDom(fiber)
  }
  //使用fiber.dom跟踪DOM节点
  if(fiber.parent) {
    fiber.parent.dom.appendChild(fiber.dom)
  }


  //2.
  const elements = fiber.props.children
  let index = 0
  let prevSibling = null

  while(index < element.length) {
    const element = elements[index]

    const newFiber = {
      type: element.type,
      props: element.props,
      parent: fiber,
      dom: null
    }

   //添加到fiber树种
    if(index === 0) {
      fiber.child = newFiber
    } else {
      prevSibling.sibling = newFiber
    }

    prevSibling = newFiber
    index++

  }


  //3.找到下一个工作单元
  if(fiber.child) {
    //首先找childr fiber
    return fiber.child
  }
  let nextFiber = fiber
  while(nextFiber) {
    //再找csibling fiber
    if(nextFiber.sibling) {
      return nextFiber.sibling
    }
   // 最后再找parent fiber
    nextFiber = nextFiber.parent
  }



}




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
