import React from "react";
import { Icon, Table,Header} from 'semantic-ui-react';
import {getFileExtension,getFileIcon} from "../../processors/generic";
import {getEmitter} from '../../processors/EventEmitterManager';
import "../../css/general.css";

const emitter = getEmitter();



class SearchResultHolder extends React.Component 
{
    constructor(props) {
        super(props);
        this.state = {
            filedata:this.props.filedata,
            fileicon:"folder",
            mouseOverBoxClass:"",
        }
    }

    componentDidMount(){
        this.processSearch();
    }

    processSearch()
    {
        if(this.state.filedata.IsFile)
        {
            var ext = getFileExtension(this.state.filedata.ItemName);
            this.setState({fileicon:getFileIcon(ext)});
        }
    }

    ProcessMouse(action) {
        if (action === "onClick") {
            var dToGo = this.state.filedata.IsFile?this.state.filedata.ParentDest:this.state.filedata.ItemDest;
            emitter.emit("HandleItemClick",dToGo,false);
        }
        else if (action === "onMouseEnter") {
            this.setState({ mouseOverBoxClass: "mouseOverBoxDefault" })
        }
        else if(action === "onMouseLeave") {
            this.setState({ mouseOverBoxClass: "" })
        }
    }

    render() {
        return (
            <Table.Row
                onMouseEnter={() => this.ProcessMouse("onMouseEnter")}
                onMouseLeave={() => this.ProcessMouse("onMouseLeave")}
                onClick={() => this.ProcessMouse("onClick")}
                className={this.state.mouseOverBoxClass}
            >
                <Table.Cell>
                    <Header as='h4'>
                        <Icon name={this.state.fileicon} />
                        <Header.Content>
                            <span
                                title={
                                    this.state.filedata.ItemName.length > 60 ?
                                        this.state.filedata.ItemName : ""
                                }
                            > 
                            {this.state.filedata.ItemName}
                            </span>
                            <Header.Subheader title={
                               this.state.filedata.ItemDest.length > 70 ?
                               this.state.filedata.ItemDest : ""
                            }
                            >
                                {this.state.filedata.ItemDest}
                            </Header.Subheader>
                        </Header.Content>
                    </Header>
                </Table.Cell>
            </Table.Row>
        );
    }
}
export default SearchResultHolder;