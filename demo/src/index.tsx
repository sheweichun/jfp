import { j, render, useState, useEffect } from 'jfp';


// const { j } = jfp
// console.log('j :', jfp, j);

function Card(props){

  useEffect(()=>{
    console.log('Card mount')
    return ()=>{
      console.log('Card Unmout!', props.value)
    }
  }, [])

  return <div style={{width:'200px', height:'200px', marginRight:'12px', border:'1px solid #ccc', fontSize:'16px'}}>
    {props.value}
  </div>
}


function Random(){
  // const [count ,setCount ] = useState(()=>{
  //   return Math.floor(Math.random() * 10 + 1)
  // })
  useEffect(()=>{
    console.log('Random mount')
    return ()=>{
      console.log('Random Unmout!')
    }
  }, [])

  function renderList(n:number){
    let arr = [];
    for(let i = 0; i < n; i++){
      arr.push(<Card key={i} id="abc" value={i}>
      </Card>)
    }
    // return null
    return arr
  }
  const num = Math.floor(Math.random() * 10 + 1)
  return <div>
    <div>{num}个</div>
    <div style={{display: 'flex'}}>
      {
        renderList(num)
      }
    </div>
    
  </div>
}


function App() {
    const [count ,setCount ] = useState(()=>{
      return Math.floor(Math.random() * 100 + 10)
    })
    useEffect(()=>{
      console.log('mount')
      return ()=>{
        console.log('Unmout!')
      }
    }, [])

    return (
      <div>
        <div style={{width:'200px', height:'300px', backgroundColor: 'red'}}/>
        {/* <svg onClick={()=>{
          console.log('click svg')
        }} width="19" height="19" viewBox="0 0 19 19" xmlns="http://www.w3.org/2000/svg">
          <g fill="#666" fillRule="nonzero">
            <path d="M7.337 10.893a.695.695 0 1 0 .034 1.388.695.695 0 0 0-.034-1.388zM7.337 3.948a2.777 2.777 0 0 0-2.667 2l-.034.13a.528.528 0 0 0 .512.649h.235a.695.695 0 0 0 .663-.488.955.955 0 0 1 .063-.156 1.388 1.388 0 0 1 2.618.643c-.016.443-.25.85-.625 1.087l-.402.312a2.483 2.483 0 0 0-.944 1.25l-.045.17a.534.534 0 0 0 .522.653h.22c.311 0 .584-.207.668-.506a.982.982 0 0 1 .055-.152c.144-.277.34-.524.577-.727l.518-.462c.514-.384.825-.983.843-1.625a2.777 2.777 0 0 0-2.777-2.778z" />
            <path d="M1.446 15.74a.61.61 0 0 0 .75.434l3.41-.908.025.006c.456.111.922.179 1.392.202h.03l.026.019a7.042 7.042 0 0 0 4.218 1.414h.018a7 7 0 0 0 2.083-.317l.034-.01 2.648 1a.61.61 0 0 0 .827-.571v-2.885l.02-.027A7.03 7.03 0 0 0 12.754 3l-.03-.006-.022-.022A7.398 7.398 0 0 0 7.394.713h-.01A7.393 7.393 0 0 0 0 8.099a7.305 7.305 0 0 0 1.406 4.336l.02.027v3.125c0 .052.007.104.02.155zM14.23 4.867a5.807 5.807 0 0 1 1.591 8.667l-.136.166v2.429l-2.234-.845-.21.075a5.858 5.858 0 0 1-3.792.026l-.307-.104.311-.09a7.42 7.42 0 0 0 5.315-7.092 7.312 7.312 0 0 0-.682-3.103l-.136-.294.28.165zM1.222 8.098a6.16 6.16 0 1 1 4.542 5.946l-.159-.042-2.956.787v-2.743l-.128-.167a6.16 6.16 0 0 1-1.299-3.781z" />
          </g>
        </svg> */}
        <button onClick={()=>{
          console.log('clicked me!!');
          setCount(count + 1)
        }}>+</button>
        <div>
          数字: {count}
        </div>
        <Random></Random>
      </div> 
    )
}
const a = <App onClick={()=>{
  console.log('clicke app');
}}></App>

// console.log('a :', a);
// const a = App()
render(a, document.getElementById('app'))
// console.log('hello', a)