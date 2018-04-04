import React from "react";
import { Icon, Card,Button,Progress  } from 'semantic-ui-react';
import {Upload} from "../../processors/WebDavManager";
import {formatBytes} from "../../processors/generic";
import {getEmitter} from '../../processors/EventEmitterManager';
import {GetCurrentDirectoryPos} from '../FileList';

const emitter = getEmitter();

const electronremote = window.require("electron").remote;
const {
shell} = electronremote;


class UploadFileHolder extends React.Component 
{
    constructor(props) {
        super(props);
        this.state = {
            file:this.props.file,
            filedir:"",
            filename:"",
            filesize:"",
            progress:0,
            uploadProcessDetails:null,
            aborted:false,
        }
    }

    componentDidMount()
    {
        this.ClearIfFinishedUpload = emitter.addListener("ClearAllUploads", () => {
            this.ClearIfFinished();
        })
        this.ProcessUpload();
    }

    componentWillUnmount()
    {
        this.ClearIfFinishedUpload.remove();
    }

    async ProcessUpload()
    {
        var file = this.state.file;
        var fileName = file.name;
        var fileSize = formatBytes(file.size);
        var fileDir = file.path;


        var currentRemoteDir = GetCurrentDirectoryPos();

        var req = await Upload(currentRemoteDir,fileName,file.size,fileDir,(val)=>this.UpdateProgress(val));
        if(req===null)
        {
            this.ProcessClearClick();
            return;
        }
        else
        {
            this.setState({
                filename:fileName,
                filesize:fileSize,
                filedir:fileDir,
                uploadProcessDetails:req
            });
        }
    }

    UpdateProgress(val)
    {
        if(val==="Done" && !this.state.aborted)
        {
            this.setState({progress:100});
        }
        else if(val==="Error")
        {
            console.log("Download Error");
        }
        else if(val>=0)
        {
            this.setState({progress:val});
        }
    }

    async ProcessClearClick()
    {
        if(this.state.progress<100)
        {
            await this.setState({aborted:true});
            if(this.state.uploadProcessDetails!==null)
            {
                this.state.uploadProcessDetails();
            }
        }
        emitter.emit("RemoveUpload",this.state.file);
    }

    ClearIfFinished()
    {
        if(this.state.progress>=100)
        {
            this.ProcessClearClick();
        }
    }


    render() {
        return (
            <Card.Content extra >
                <Card.Header title={this.state.filename} className={"downloadManagerDropDown"}>{this.state.filename}</Card.Header>
                <Card.Meta>{this.state.filesize}</Card.Meta>
                <Card.Meta onClick={() => shell.showItemInFolder(this.state.filedir)} >{this.state.filedir}</Card.Meta>
                <Card.Description>
                    <Progress percent={this.state.progress} active={this.state.progress < 100} color='yellow' >
                        {this.state.progress >= 100 ? "Uploaded" : "Uploading"}
                    </Progress>
                </Card.Description>
                <Button onClick={() => this.ProcessClearClick()} color={this.state.progress >= 100 ? "blue" : "red"} size="small" floated="right" animated='vertical'>
                    <Button.Content hidden>{this.state.progress >= 100 ? "Clear" : "Stop"}</Button.Content>
                    <Button.Content visible>
                        <Icon fitted name='delete' />
                    </Button.Content>
                </Button>
            </Card.Content>
        );
    }
}
export default UploadFileHolder;