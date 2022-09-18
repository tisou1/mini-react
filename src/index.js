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


function createDom(fiber) {
  //把fiber上的属性移到真实dom上
  const dom =
    fiber.type === "TEXT_ELEMENT"
      ? document.createTextNode("")
      : document.createElement(fiber.type)


    updateDom(dom, {} , fiber.props)
  // Object.keys(fiber.props)
  //   .filter(isProperty)
  //   .forEach(name => {
  //     dom[name] = fiber.props[name]
  //   })
  return dom
}
const isEvent = key => key.startsWith('on')//以on开头
const isProperty = key => key !== "children" && !isEvent(key)
const isNew = (prev, next) => key => prev[key] !== next[key]
const isGone = (prev, next) => key => !(key in next)

function updateDom(dom, prevProps, nextProps) {
  //TODO
  //移除旧的事件监听
  Object.keys(prevProps)
    .filter(isEvent)
    .filter(
      key => !(key in nextProps) || isNew(prevProps, nextProps)(key)
    )
    .forEach(name => {
      const eventType = name
        .toLowerCase()
        .substring(2)

        //从真实dom中移除事件监听
        dom.removeEventListener(eventType, prevProps[name])
    })

  //删除旧的属性
  Object.keys(prevProps)
    .filter(isProperty)
    .filter(isGone(prevProps, nextProps)) //新fiber中的属性不包含的旧属性(属性在旧的fiber不在新的fiber)
    .forEach( name => {
      dom[name] = ''
    })


  //设置改变后的属性
  Object.keys(nextProps)
    .filter(isProperty)
    .filter(isNew(prevProps, nextProps))
    .forEach(name => {
      dom[name] = nextProps[name]
    })


  //添加新的事件监听
  Object.keys(nextProps)
    .filter(isEvent)
    .filter(isNew(prevProps, nextProps))
    .forEach(name => {
      const eventType = name
        .toLowerCase()
        .substring(2)
      
      dom.addEventListener(eventType, nextProps[name])
    })
}


function commitRoot() {
  //提交到dom时,使用
  deletions.forEach(commitWork)
  //调用commitWork递归的将所有节点附加到dom上
  commitWork(wipRoot.child)
  //在将fiber都提交之后,要保存对最后一个fiber树的引用
  currentRoot = wipRoot
  wipRoot = null
}


function commitWork(fiber) {
  if(!fiber){
    return 
  }
  // const domParent = fiber.parent.dom

  //找到dom节点的父节点,沿着fiber树向上查找,直到找到具有dom节点的fiber
  let domParentFiber = fiber.parent
  while(!domParentFiber.dom) {
    domParentFiber = domParentFiber.parent
  }
  const domParent = domParentFiber.dom
  console.log(domParent);
  //处理更新的的effectTag
  if(
    fiber.effectTag === 'PLACEMENT' &&
    fiber.dom != null
  ) {
    //添加新的节点
    domParent.appendChild(fiber.dom)
  } else if(
    fiber.effectTag === 'UPDATE' &&
    fiber.dom != null
  ) {
    //更新dom  TODO
    updateDom(fiber.dom, fiber.alternate.props, fiber.props)

  } else if(fiber.effectTag === 'DELETION') {
    //从dom中删除节点
    // domParent.removeChild(fiber.dom)
    //删除的时候需要向下找到一个带有dom的子节点
    commitDeletion(fiber, domParent)
  } 

  commitWork(fiber.child)
  commitWork(fiber.sibling)
}


function commitDeletion(fiber, domParent) {
  if(fiber.dom) {
    domParent.removeChild(fiber.dom)
  } else {
    commitDeletion(fiber.child, domParent)
  }
}




function render(element, container) {

  wipRoot = {
    dom: container,
    props: {
      children: [element]
    },
    alternate: currentRoot,
  }
  //准总要删除的节点
  deletions = []
  /**
   * 在React中最多会同时存在两棵Fiber树。
   * 当前屏幕上显示内容对应的Fiber树称为current Fiber树，
   * 正在内存中构建的Fiber树称为workInProgress Fiber树。
   */
  //内存中可同时可同时存在两颗fiber树
  //每次渲染初期,都要是使用alternate来获取当前在内存中的fiber树
  //然后更新alternate(旧的fiber树),只后和currrentRoot进行比较

  nextUnitOfWork = wipRoot

}



let nextUnitOfWork = null
let wipRoot = null
//保存当前的fiber树
let currentRoot = null
//准总要删除的节点
let deletions = null

/**workLoop */
function workLoop(deadline) {
  let shouldYield = false
  //调用render之后就会进行nextUnitOfWork的赋值,
  while(nextUnitOfWork && !shouldYield) {
    nextUnitOfWork = performUnitOfWork(nextUnitOfWork)
    shouldYield = deadline.timeRemaining() < 1
  }

  //当没有下一个工作单元的时候,就会将整个fiber树提交给dom
  if(!nextUnitOfWork && wipRoot){
    commitRoot()
  }
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



  const isFunctionComponent = fiber.type instanceof Function
  if(isFunctionComponent) {
    updateFunctionComponent(fiber)
  } else {
    updateHostComponent(fiber)
  }
 


  //3.找到下一个工作单元
  if(fiber.child) {
    //首先找childr fiber
    return fiber.child
  }
  let nextFiber = fiber
  while(nextFiber) {
    //再找sibling fiber
    if(nextFiber.sibling) {
      return nextFiber.sibling
    }
   // 最后再找parent fiber
    nextFiber = nextFiber.parent
  }



}


let wipFiber = null
let hookIndex = null

function updateFunctionComponent(fiber) {
  wipFiber = fiber
  hookIndex = 0
  wipFiber.hooks = []
  //TODO
  //这里的fiber.type就是 App函数<App/>组件,返回h1元素
  const children = [fiber.type(fiber.props)]
  reconcileChildren(fiber, children)
}
function useState(initial) {
  
  const oldHook = 
    wipFiber.alternate &&
    wipFiber.alternate.hooks &&
    wipFiber.alternate.hooks[hookIndex]
  
    const hook = {
      state: oldHook ? oldHook.state : initial,
      queue: [],
    }
    //在下一次渲染组件之前执行actions
    const actions = oldHook ? oldHook.queue : []
    actions.forEach(action => {
      hook.state = action(hook.state)
    })

    const setState = action => {
      hook.queue.push(action)
      wipRoot = {
        dom: currentRoot.dom,
        props: currentRoot.props,
        alternate: currentRoot
      }
      nextUnitOfWork = wipRoot
      deletions = []
    }

    wipFiber.hooks.push(hook)
    hookIndex++
    return [hook.state, setState]
}

function updateHostComponent(fiber) {
    //1.
  if(!fiber.dom) {
    fiber.dom = createDom(fiber)
  }
  //使用fiber.dom跟踪DOM节点
  // if(fiber.parent) {
  //   fiber.parent.dom.appendChild(fiber.dom)
  // }
  const elements = fiber.props.children
  reconcileChildren(fiber, elements)

}


/**调和旧的fiber和新的元素 */
function reconcileChildren(wipFiber, elements) {
  let index = 0
  let oldFiber = wipFiber.alternate && wipFiber.alternate.child

  //elements 使我们要渲染到Domd的东西.oldFiber是上次渲染的东西

  let prevSibling = null

  while(index < elements.length || oldFiber != null) {
    const element = elements[index]


    let newFiber = null

    //比较新旧的区别
    //真实的react也是用了key进行优化
    const sameType = oldFiber && element && element.type === oldFiber.type
    
    if(sameType) {
      //TODO 更新这个node
      //保留旧的fiber的dom节点和元素props

      newFiber = {
        type: oldFiber.type,
        props: element.props,
        dom: oldFiber.dom,
        parent: wipFiber,
        alternate: oldFiber,
        effectTag: "UPDATE"
      }
    }

    if(element && !sameType){
      //添加这个node
      newFiber = {
        type: element.type,
        props: element.props,
        dom: null,
        parent: wipFiber,
        alternate: null,
        effectTag: "PLACEMENT"
      }
    }

    if(oldFiber && !sameType) {
      // TODO 删除oldFiber's node
      oldFiber.effectTag = 'DELETION'
      deletions.push(oldFiber)
    }

    if(oldFiber) {
      oldFiber = oldFiber.sibling
    }

   //添加到fiber树中
    if(index === 0) {
      wipFiber.child = newFiber
    } else if(element){
      prevSibling.sibling = newFiber
    }

    prevSibling = newFiber
    index++

  }
}




/** 自定义库的名字 */
const Didact = {
  createElement,
  render,
  useState
}

// 有下面的comment babel就会使用我们自己的createElement方法
/** @jsx Didact.createElement */
function Counter() {
  const [state, setState] = Didact.useState(1);
  return (
    <h1 onClick={() => setState(c => c + 1)} style="user-select: none">
      Count: {state}
    </h1>
  );
}
const element = <Counter />;
// const element = <div>2222</div>

const container = document.getElementById('root')

Didact.render(element, container)
