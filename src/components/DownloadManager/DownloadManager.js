import React from "react";
import { Dropdown,Button,Card,Icon } from 'semantic-ui-react';
import DownloadFileHolder from './DownloadFileHolder';
import {getEmitter} from '../../processors/EventEmitterManager';
import '../../css/general.css';
const emitter = getEmitter();



class DownloadManager extends React.Component 
{
    
    constructor(props) {
        super(props);
        this.state = {
            dirsToDownload:[],

            open:false,
        }
    }

    componentDidMount()
    {
        this.AddDownloadListener = emitter.addListener('AddDownload', (dir) => {
            this.AddDownload(dir);
        });

        this.RemoveDownloadListener = emitter.addListener('RemoveDownload', (dir) => {
            this.RemoveDownload(dir);
        });
    }

    AddDownload(dir)
    {
        var CurrentDowns = this.state.dirsToDownload;
        CurrentDowns.push(dir);
        this.setState({dirsToDownload:CurrentDowns});
    }

    RemoveDownload(dir)
    {
        var CurrentDowns = this.state.dirsToDownload;
        var index = CurrentDowns.indexOf(dir);
        if(index>-1)
        {
            CurrentDowns.splice(index, 1);
        }
        var modalOp = CurrentDowns.length<=0?false:true;
        this.setState({dirsToDownload:CurrentDowns,open:modalOp});
    }

    render() {
        return (
            <Dropdown 
                open={this.state.open}  
                icon={null}  
                trigger={<Button icon="dropdown" labelPosition="right" content="Downloads" onClick={() => this.setState({ open: !this.state.open })} />}
                onBlur={()=>this.setState({open:false})} 
                disabled={this.state.dirsToDownload.length<=0}
                pointing={"top right"} 
                floating>
                <Dropdown.Menu >
                <Card fluid >
                        {this.state.dirsToDownload.map(item =>
                            <DownloadFileHolder key={item} filedir={item} />
                        )}
                    <Card.Content extra>
                        <Button onClick={()=>emitter.emit("ClearAllDownloads")} color={"blue"} floated="right" animated='vertical'>
                            <Button.Content visible >Clear All</Button.Content>
                            <Button.Content hidden>
                                <Icon fitted name='tasks' />
                            </Button.Content>
                        </Button>
                    </Card.Content>
                </Card>
                </Dropdown.Menu>
            </Dropdown>
        );
    }
}

export default DownloadManager;