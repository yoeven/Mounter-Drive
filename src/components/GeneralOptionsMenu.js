import React from "react";
import { Container,Dropdown } from 'semantic-ui-react';
import UploadModal from './UploadModal';
import {GetCurrentDirectoryPos} from './FileList';
import {InputAlert} from './AlretManager/AlertManager';
import {CreateTextFile,CreateFolder} from '../processors/WebDavManager';
import  '../css/general.css';


let FileRenderDetails = {
    Title:"New Text File",
    MainPlaceHolder:"File Name",
    TextBox:true,
    TextBoxPlaceHolder:"Content",
    Icon:"file text outline",
    Button1Text:"Enter",
}

let FolderRenderDetails = {
    Title:"New Folder",
    MainPlaceHolder:"Folder Name",
    TextBox:false,
    TextBoxPlaceHolder:"",
    Icon:"folder open outline",
    Button1Text:"Enter",
}

class GeneralOptionsMenu extends React.Component 
{
    CreateNewFolder()
    {
        InputAlert(FolderRenderDetails,(val)=>{
            var currentDir = GetCurrentDirectoryPos();
            CreateFolder(currentDir,val);
        })
    }

    CreateNewFile()
    {
        InputAlert(FileRenderDetails,(val,content)=>{
            var currentDir = GetCurrentDirectoryPos();
            CreateTextFile(currentDir,val,content);
        })
    }


    render() {
        return (
            <Container className="generalOptionsMenu" fluid>
            <Dropdown icon='add' floating button className='icon'>
                <Dropdown.Menu >
                    <Dropdown.Item onClick={()=>this.CreateNewFolder()} icon='folder open outline' text='New Folder' />
                    <Dropdown.Item onClick={()=>this.CreateNewFile()} icon='file text outline' text='New text File' />
                    <UploadModal trigger={<Dropdown.Item icon='upload' text='Upload' />} />
                </Dropdown.Menu>
            </Dropdown>
            </Container>
        );
    }
}

export default GeneralOptionsMenu;