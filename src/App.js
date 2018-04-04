import React from "react";
import FileList from "./components/FileList";
import TopMenu from "./components/TopMenu";
import MyAwesomeMenu from "./components/FileOptionsMenu";
import {Alert,AlertInput} from './components/AlretManager/AlertManager';
import { getEmitter } from  './processors/EventEmitterManager';
import LoginPage,{ResetPass} from './components/LoginPage/LoginPage';

const emitter = getEmitter();


class App extends React.Component 
{
  constructor(props) {
    super(props);
    this.state = {
      LogedIn:false,
    }
}

  componentDidMount()
  {
    window.addEventListener('mouseup', (e) => {
      emitter.emit("UnSelect");
    }, false);
  }

  LogedIn()
  {
    this.setState({LogedIn:true});
  }

  LogOut()
  {
    if(this.state.LogedIn)
    {
      ResetPass();
      this.setState({LogedIn:false});
    }
  }
  

  render() {
    if(!this.state.LogedIn)
    {
      return(<LoginPage LoadPage={()=>this.LogedIn()} />)
    }
    return (
      <div>
        <MyAwesomeMenu />
        <TopMenu LogOut={()=>this.LogOut()} />
        <FileList />
        <Alert />
        <AlertInput />
      </div>
    );
  }
}

export default App;