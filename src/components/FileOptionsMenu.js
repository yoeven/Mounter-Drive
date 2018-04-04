import React from "react";
import { ContextMenu, Item, theme } from 'react-contexify';
import 'react-contexify/dist/ReactContexify.min.css';



const onCopyClick = ({ event, ref, data, dataFromProvider }) => {
    dataFromProvider.Copy();
 }

const onCutClick = ({ event, ref, data, dataFromProvider }) => {
    dataFromProvider.Cut();
}

const onPasteClick = ({ event, ref, data, dataFromProvider }) => {
    dataFromProvider.Paste();
}

const onRenameClick = ({ event, ref, data, dataFromProvider }) => {
    dataFromProvider.Rename();
}

const onDeleteClick = ({ event, ref, data, dataFromProvider }) => {
    dataFromProvider.Delete();
}

const onDownloadClick = ({ event, ref, data, dataFromProvider }) => {
    dataFromProvider.Download();
}


const MyAwesomeMenu = () => (
    <ContextMenu theme={theme.dark} id='menu_id'>
      <Item onClick={onRenameClick}>Rename</Item>
      <Item onClick={onDownloadClick}>Download</Item>
       <Item onClick={onCopyClick}>Copy</Item>
       <Item onClick={onCutClick}>Cut</Item>
       <Item onClick={onPasteClick} >Paste</Item>
       <Item onClick={onDeleteClick}>Delete</Item>
    </ContextMenu>
);


export default MyAwesomeMenu;