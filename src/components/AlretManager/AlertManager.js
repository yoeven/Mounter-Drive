import React from 'react';
import { Button, Header, Modal,Input,TextArea,Form } from 'semantic-ui-react';
import {EventEmitter} from 'fbemitter';
var emitter = new EventEmitter();


export function ChoiceAlert(RenderDetails,OnChoiceFirstSelectCallback,OnChoiceSecondSelectCallback=null,CancleCallback=()=>{})
{
    emitter.emit("ChoiceAlert",RenderDetails,OnChoiceFirstSelectCallback,OnChoiceSecondSelectCallback,CancleCallback)
}


export function InputAlert(RenderDetails,OnChoiceFirstSelectCallback,CancleCallback=()=>{})
{
    emitter.emit("InputAlert",RenderDetails,OnChoiceFirstSelectCallback,CancleCallback)
}

export class Alert extends React.Component 
{
    constructor(props) {
        super(props);
        this.state = {
            Open:false,
            Title:"",
            Message:"",
            Icon:"",
            Button1Text:"",
            Button2Text:"",
            Choice1CallBack:()=>{},
            Choice2CallBack:null,
            CancleCallBack:()=>{},
        }
    }

    componentDidMount()
    {
        this.ChoiceAlertListener = emitter.addListener("ChoiceAlert",(RD,OCOS,OCSS,CC)=>{
            this.ChoiceAlert(RD,OCOS,OCSS,CC);
        })
    }

    ChoiceAlert(RenderDetails,OnChoiceOneSelectCallback,OnChoiceSecondSelectCallback,CancleCallback)
    {
        this.setState({
            Title:RenderDetails.Title,
            Message:RenderDetails.Message,
            Icon:RenderDetails.Icon,
            Button1Text:RenderDetails.Button1Text,
            Button2Text:OnChoiceSecondSelectCallback!=null?RenderDetails.Button2Text:"",
            Choice1CallBack:OnChoiceOneSelectCallback,
            Choice2CallBack:OnChoiceSecondSelectCallback,
            CancleCallback:CancleCallback,
            Open:true,
        })
    }

    render() {
        return (
            <Modal open={this.state.Open} basic size='small'>
                <Header icon={this.state.Icon} content={this.state.Title} />
                <Modal.Content>
                    <p>{this.state.Message}</p>
                </Modal.Content>
                <Modal.Actions>
                    <Button onClick={()=>{this.state.CancleCallBack();this.setState({Open:false})}} floated={"left"}>
                        Cancel
                    </Button>
                    {this.state.Choice2CallBack != null &&
                        <Button onClick={()=>{this.state.Choice2CallBack();this.setState({Open:false})}} inverted>
                            {this.state.Button2Text}
                        </Button>
                    }
                    <Button onClick={()=>{this.state.Choice1CallBack();this.setState({Open:false})}} inverted>
                        {this.state.Button1Text}
                    </Button>
                </Modal.Actions>
            </Modal>
        );
    }
}

export class AlertInput extends React.Component 
{
    constructor(props) {
        super(props);
        this.state = {
            Open:false,
            TextBox:false,
            Title:"",
            MainPlaceHolder:"",
            TextBoxPlaceHolder:"",
            Icon:"",
            Button1Text:"",
            Choice1CallBack:()=>{},
            CancleCallBack:()=>{},
            titleTextTyped:"",
            contentTextTyped:"",
        }
    }

    componentDidMount()
    {
        this.InputAlertListener = emitter.addListener("InputAlert",(RD,OCOS,CC)=>{
            this.InputAlert(RD,OCOS,CC);
        })
    }

    InputEnter()
    {
        if(this.state.titleTextTyped!=="")
        {
            this.state.Choice1CallBack(this.state.titleTextTyped,this.state.contentTextTyped);
            this.setState({Open:false})
        }

    }

    InputAlert(RenderDetails,OnChoiceOneSelectCallback,CancleCallback)
    {
        this.setState({
            Title:RenderDetails.Title,
            MainPlaceHolder:RenderDetails.MainPlaceHolder,
            TextBox:RenderDetails.TextBox,
            TextBoxPlaceHolder:RenderDetails.TextBoxPlaceHolder,
            Icon:RenderDetails.Icon,
            Button1Text:RenderDetails.Button1Text,
            Choice1CallBack:OnChoiceOneSelectCallback,
            CancleCallback:CancleCallback,
            titleTextTyped:"",
            contentTextTyped:"",
            Open:true,
        })
    }

    render() {
        return (
            <Modal open={this.state.Open} basic size='small'>
                <Header icon={this.state.Icon} content={this.state.Title} />
                <Modal.Content>
                    <Input onChange={(event, data) => this.setState({ titleTextTyped: data.value })} fluid placeholder={this.state.MainPlaceHolder} />
                </Modal.Content>
                {this.state.TextBox && 
                    <Modal.Content>
                        <Form>
                            <TextArea onChange={(event, data) => this.setState({ contentTextTyped: data.value })} autoHeight placeholder={this.state.TextBoxPlaceHolder} style={{ minHeight: "60vh" }} />
                        </Form>
                    </Modal.Content>
                }
                <Modal.Actions>
                    <Button onClick={()=>{this.state.CancleCallBack();this.setState({Open:false})}} floated={"left"}>
                        Cancel
                    </Button>
                    <Button onClick={()=>this.InputEnter()} inverted>
                        {this.state.Button1Text}
                    </Button>
                </Modal.Actions>
            </Modal>
        );
    }
}