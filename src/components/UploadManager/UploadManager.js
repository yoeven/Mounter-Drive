import React from "react";
import { Dropdown,Button,Card,Icon } from 'semantic-ui-react';
import UploadFileHolder from './UploadFileHolder';
import {getEmitter} from '../../processors/EventEmitterManager';
import '../../css/general.css';
const emitter = getEmitter();


class UploadManager extends React.Component 
{
    
    constructor(props) {
        super(props);
        this.state = {
            filesToUpload:[],

            open:false,
        }
    }

    componentDidMount()
    {
        this.AddUploadListener = emitter.addListener('AddUpload', (file) => {
            this.AddUpload(file);
        });

        this.RemoveUploadListener = emitter.addListener('RemoveUpload', (file) => {
            this.RemoveUpload(file);
        });
    }

    AddUpload(file)
    {
        var CurrentUps = this.state.filesToUpload;
        if(CurrentUps.some(item => item.path === file.path))
        {
            return;
        }
        CurrentUps.push(file);
        this.setState({filesToUpload:CurrentUps});
    }

    RemoveUpload(file)
    {
        var CurrentUps = this.state.filesToUpload;
        var index =CurrentUps.indexOf(file);
        if(index>-1)
        {
            CurrentUps.splice(index, 1);
        }
        var modalOp = CurrentUps.length<=0?false:true;
        this.setState({filesToUpload:CurrentUps,open:modalOp});
    }

    render() {
        return (
            <Dropdown 
                    open={this.state.open}  
                    icon={null}  
                    trigger={<Button icon="dropdown" labelPosition="right" content="Uploads" onClick={() => this.setState({ open: !this.state.open })} />}
                    onBlur={()=>this.setState({open:false})} 
                    disabled={this.state.filesToUpload.length<=0} 
                    pointing={"top right"} 
                    floating>
                <Dropdown.Menu >
                <Card fluid >
                    {this.state.filesToUpload.map((item,index) =>
                        <UploadFileHolder key={item.path} file={item} />
                    )}

                    <Card.Content extra>
                        <Button onClick={()=>emitter.emit("ClearAllUploads")} color={"blue"} floated="right" animated='vertical'>
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

export default UploadManager;