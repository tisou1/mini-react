import * as React from 'react'
import {useInterval} from './customHooks/useInterval'

function App() {
  const [count,setCount] = React.useState(0)
  useInterval(()=>{
    setCount(count=>count+1)
  },1000)
  return (
    <div className="App">
      cc
    </div>
  );
}

export default App;
