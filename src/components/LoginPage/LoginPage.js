import React from "react";
import {Login} from "../../processors/WebDavManager";
import {Encrypt,Decrypt} from "../../processors/Encryptor";
import { Container,Form,Button,Header,Input,Checkbox,Message,Loader,Dimmer,Dropdown,Image } from 'semantic-ui-react';
import '../../css/general.css';

const electronremote = window.require("electron").remote;
const {app} = electronremote;
const fs = electronremote.require('fs');

var timeOut = null;

var path = app.getPath("userData")+"/userdetails.json";


export function ResetPass() {
    if (fs.existsSync(path)) {
        fs.unlinkSync(path);
    }
}

const protocolOptions = [
    { key: 'http://', text: 'http://', value: 'http://' },
    { key: 'https://', text: 'https://', value: 'https://' }
  ]
  

class LoginPage extends React.Component 
{   
    constructor(props) {
        super(props);
        this.state = {
            LoadPage:this.props.LoadPage,
            protocol:"http://",
            endpoint:"",
            username:"",
            password:"",
            autologin:false,
            
            errorMessageHidden:true,
            errorMessage:"",
            Loading:false,
        }
    }

    componentDidMount()
    {
        this.CheckSave();
    }

    CheckSave()
    {
        if(fs.existsSync(path))
        {
            this.setState({Loading:true});
            fs.readFile(path,'utf8',async (err, data) => {
                if (err) throw err;
                var jData = null;
                try {
                    jData = JSON.parse(Decrypt(data));
                } catch (error) {
                    jData = null
                }

                if(jData!=null)
                {
                    await this.setState({endpoint:jData.endpoint,username:jData.username,password:jData.password});
                    this.LoginCheck();
                }
                else
                {
                    ResetPass();
                }
            });
        }
    }

    CloseErrorMessageBox(Ts)
    {
        timeOut = setTimeout(()=>{
            this.setState({errorMessageHidden:true});
        },1000*Ts);
    }

    ShowErrorMessageBox(Message,ClearOutTime=null)
    {
        if(timeOut!==null) clearTimeout(timeOut);
        this.setState({errorMessage:Message,errorMessageHidden:false});
        if(ClearOutTime!==null) this.CloseErrorMessageBox(ClearOutTime);
    }

    async LoginCheck()
    {
        var EP = this.state.endpoint;
        var UN = this.state.username;
        var PW = this.state.password;
        if(!/\S/.test(EP))
        {
            this.ShowErrorMessageBox("Remote Address field has to be filled.",10);
            return;
        }

        if(!EP.includes("http"))
        {
            EP = this.state.protocol + EP;
        }

        if(!/\S/.test(UN)||!/\S/.test(PW))
        {
            UN = "";
            PW = "";
        }

        if(timeOut!==null) clearTimeout(timeOut);
        this.setState({errorMessageHidden:true,Loading:true});
        var result = await Login(EP,UN,PW);
        if(result)
        {
            if(this.state.autologin)
            {
                let userlogindetails = {
                    endpoint:EP,
                    username:UN,
                    password:PW
                }

                fs.writeFileSync(path,Encrypt(JSON.stringify(userlogindetails)));
            }
            this.state.LoadPage();
        }
        else
        {
            this.ShowErrorMessageBox("The login failed. Check your info.",20);
            this.setState({Loading:false});
            ResetPass();
        }
    }

    ValueChange(name,value)
    {
        this.setState({[name]:value});
    }

    render() {

        if(this.state.Loading)
        {
          return(
              <Dimmer active>
                  <Loader size='big'>Loading</Loader>
              </Dimmer>
          );
        }
  
        return (
            <Container text className={"loginpagestyle"}>
                <Image draggable="false" centered src={"./logo.png"} />
                <Header textAlign={"center"} as={"h1"} >Login</Header>
                <Message hidden={this.state.errorMessageHidden} negative>
                    <Message.Header>{this.state.errorMessage}</Message.Header>
                </Message>
                <Form onSubmit={()=>this.LoginCheck()} >
                    <Form.Field>
                        <label>Remote address</label>
                        <Input
                            value={this.state.endpoint}
                            onChange={(event,data)=>this.ValueChange("endpoint",data.value)}  
                            placeholder='mywebdavserver.remote.php/webdav/'
                            label={<Dropdown defaultValue='http://' 
                                    options={protocolOptions} 
                                    onChange={(event,data)=>this.ValueChange("protocol",data.value)}
                                    />}
                         />
                    </Form.Field>
                    <p>(Leave fields below blank if no authentication needed)</p>
                    <Form.Field>
                        <label>Username</label>
                        <Input value={this.state.username} onChange={(event,data)=>this.ValueChange("username",data.value)}  placeholder='e.g. tom' />
                    </Form.Field>
                    <Form.Field>
                        <label>Password</label>
                        <Input value={this.state.password} type="password" onChange={(event,data)=>this.ValueChange("password",data.value)}  placeholder='' />
                    </Form.Field>
                    <Form.Field>
                        <Checkbox checked={this.state.autologin} onChange={(event,data)=>this.ValueChange("autologin",data.checked)} label='Auto Login' />
                    </Form.Field> 
                    <Button type='submit'>Login</Button>
                </Form>
            </Container>
        );
    }
}

export default LoginPage;