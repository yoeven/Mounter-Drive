import React from "react";
import { Container, Table,Loader,Dimmer } from 'semantic-ui-react';
import FileHolder from "./FileHolder";
import {getWFS} from "../processors/WebDavManager";
import {getEmitter} from '../processors/EventEmitterManager';
import { formatBytes } from "../processors/generic";



const emitter = getEmitter();
var wfs;

var currentDirectoryPos;

export function GetCurrentDirectoryPos()
{
  return currentDirectoryPos;
}


class FileList extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      currentDir:"",
      directoryListing: [],
      Loading: false,
      TotalSize:0,
    }
  }

  componentDidMount() {
    wfs = getWFS();


    this.HandleItemClickListener = emitter.addListener('HandleItemClick', (dir,isFile) => {
      this.HandleItemClick(dir,isFile);
    });

    this.RefreshCurrectDirectoryListener = emitter.addListener('RefreshCurrectDirectory', () => {
      this.RefreshCurrectDirectory();
    });
    
    this.UpdateDirectory("");
  }

  componentWillUnmount(){
    emitter.removeAllListeners();
  }

  RefreshCurrectDirectory()
  {
    this.UpdateDirectory(this.state.currentDir);
  }

  HandleItemClick(location,isFile)
  {
    if(!isFile)
    {
      this.UpdateDirectory(location,true);
    }
  }
  
   UpdateDirectory(dir,Loading = false) {
    this.setState({Loading:Loading});    
    wfs
    .getDirectoryContents(dir)
    .then(async (contents) => {
      var tSize = 0;
      for(var i=0;i<contents.length;i++)
      {
        tSize+=contents[i].size;
      }
      if(tSize>0)
      {
        tSize = formatBytes(tSize) + " Total";
      }
      else{
        tSize = "No Size";
      }
      await this.setState({Loading:false,currentDir:dir,directoryListing: contents,TotalSize:tSize });
      currentDirectoryPos = dir;
      emitter.emit('UpdateDirectoryListing', dir);
    });
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
      <Container fluid>
        <Table fixed color={'teal'} singleLine>
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell colSpan='2' >Name</Table.HeaderCell>
              <Table.HeaderCell width={5} textAlign={"right"}>Size</Table.HeaderCell>
              <Table.HeaderCell  textAlign={"right"}>Date Modified</Table.HeaderCell>
            </Table.Row>
          </Table.Header>
          
          <Table.Body>
          {this.state.directoryListing.map(item=>
              <FileHolder
                key={this.state.currentDir+item.basename}
                stats={item}
                directoryPosition={this.state.currentDir}
              />
          )}
          </Table.Body>

          <Table.Footer>
            <Table.Row>
              <Table.HeaderCell colSpan='2' >{this.state.directoryListing.length} Files/Folders</Table.HeaderCell>
              <Table.HeaderCell textAlign={"right"} >{this.state.TotalSize}</Table.HeaderCell>
              <Table.HeaderCell></Table.HeaderCell>
            </Table.Row>
          </Table.Footer>
        </Table>
      </Container>
    );
  }
}

export default FileList;