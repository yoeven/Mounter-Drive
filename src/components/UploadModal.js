import React from 'react';
import { Button, Modal,Icon } from 'semantic-ui-react';
import Dropzone from 'react-dropzone';
import {getEmitter} from '../processors/EventEmitterManager';
import  '../css/general.css';

const emitter = getEmitter();
  
class UploadModal extends React.Component 
{
    constructor(props) {
        super(props);
        this.state = {
            trigger: this.props.trigger!=null? this.props.trigger:<Button>Show Modal</Button>,
            open:false,
        }
    }

    onDrop(files) {
        for(var i =0;i<files.length;i++)
        {
            emitter.emit("AddUpload",files[i]);
        }
        this.setState({open:false});
    }

    render() {
        return (
            <Modal open={this.state.open} onClose={()=>this.setState({open:false})} onOpen={()=>this.setState({open:true})} trigger={this.state.trigger}>
                <Modal.Header>Upload a File</Modal.Header>
                <Modal.Content image>
                    <Dropzone onDrop={(file)=>this.onDrop(file)} className="uploadBoxDropArea" >
                        <Icon size={"huge"} name='upload' />
                        <p>Drop file here or click to upload</p>
                    </Dropzone>
                </Modal.Content>
            </Modal>
        );
    }
}
export default UploadModal