import React from "react";
import { Icon, Card,Button,Progress  } from 'semantic-ui-react';
import {getWFS,Download} from "../../processors/WebDavManager";
import {formatBytes} from "../../processors/generic";
import {getEmitter} from '../../processors/EventEmitterManager';
const emitter = getEmitter();
var wfs;

const electronremote = window.require("electron").remote;
const {
shell} = electronremote;


class DownloadFileHolder extends React.Component 
{
    constructor(props) {
        super(props);
        this.state = {
            filedir:this.props.filedir,
            filename:"",
            filesize:"",
            progress:0,
            downloadProcessDetails:null,
            aborted:false,
        }
    }

    componentDidMount()
    {
        wfs = getWFS();
        this.ClearIfFinishedDownload = emitter.addListener("ClearAllDownloads", () => {
            this.ClearIfFinished();
        });
        this.ProcessDownload();
    }

    componentWillUnmount()
    {
        this.ClearIfFinishedDownload.remove();
    }

    async ProcessDownload()
    {
        var stats = await wfs.getDirectoryContents(this.state.filedir);
        stats = stats[0];
        var FileName = stats.basename;
        var FileSize = formatBytes(stats.size);
        var r = Download(this.state.filedir,FileName,(val)=>this.UpdateProgress(val));
        if(r==null)
        {
            this.ProcessClearClick();
            return;
        }
        else
        {
            this.setState({filename:FileName,filesize:FileSize,downloadProcessDetails:r}); 
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
            if(this.state.downloadProcessDetails!==null)
            {
                this.state.downloadProcessDetails.req();
            }
        }
        emitter.emit("RemoveDownload",this.state.filedir);
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
                <Card.Description>
                    <Progress percent={this.state.progress} active={this.state.progress < 100} color='green' >
                        {this.state.progress >= 100 ? "Downloaded" : "Downloading"}
                    </Progress>
                </Card.Description>
                <Button onClick={() => shell.showItemInFolder(this.state.downloadProcessDetails.downloadpath)} color={"grey"} floated="left" animated='vertical'>
                    <Button.Content visible >Open Folder</Button.Content>
                    <Button.Content hidden>
                        <Icon fitted name='folder open outline' />
                    </Button.Content>
                </Button>
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
export default DownloadFileHolder;