import React from "react";
import { Icon, Table, Input } from 'semantic-ui-react';
import { getEmitter } from '../processors/EventEmitterManager';
import { getWFS, Copy, Paste, Cut, Delete } from "../processors/WebDavManager";
import { formatBytes, handleKeyPress, handleFocusHighlight, getFileExtension, getFileIcon } from "../processors/generic";

import { ContextMenuProvider } from 'react-contexify';

import '../css/general.css';
const emitter = getEmitter();
var wfs;


class FileHolder extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            stats: this.props.stats,
            directoryPosition: this.props.directoryPosition != null ? this.props.directoryPosition : "",
            filename: "",
            lastModifide: "",
            fileSize: "",
            isFile: false,
            fileExt: null,
            fileIcon: "file outline",
            mouseOverBoxClass: "",
            contextMenuOpen: false,
            selected: false,

            Renaming: false,
            RenamingInputText: "",
            RenamingHighlightMaxIndex: null,
        }
    }

    componentDidMount() {
        wfs = getWFS();
        this.processDir();
        this.UnSelectListen = emitter.addListener("UnSelect", () => {
            this.UnSelect();
        })
    }

    componentWillUnmount() {
        this.UnSelectListen.remove();
    }

    async processDir(refresh = false) {
        var stats;

        if (refresh) {
            stats = await wfs.getDirectoryContents(this.state.directoryPosition + "/" + this.state.filename + "/");
            stats = stats[0];
        }
        else {
            stats = this.state.stats;
        }

        //date
        var d = new Date(stats.lastmod);
        var dateFormatted = d.getDate() + '/' + (d.getMonth() + 1) + '/' + d.getFullYear();

        //Type
        var isFile = stats.type === "directory" ? false : true;

        //size
        var fileSize = isFile ? formatBytes(stats.size) : "";

        //extension
        var fileExtension = getFileExtension(stats.basename);

        //Icon
        var fileIcon = isFile ? getFileIcon(fileExtension) : "folder";

        var highlightmaxindex = isFile ? (stats.basename.length - fileExtension.length) - 1 : null;


        await this.setState({
            stats: stats,
            filename: stats.basename,
            lastModifide: dateFormatted,
            fileSize: fileSize,
            isFile: isFile,
            fileExt: fileExtension,
            fileIcon: fileIcon,
            RenamingHighlightMaxIndex: highlightmaxindex,
            ContentMenuOpen: false,
            selected: false,
        });
    }

    UnSelect() {
        this.setState({ contextMenuOpen: false, selected: false, mouseOverBoxClass: "" });
    }

    processClick() {
        if (this.state.Renaming) return;
        emitter.emit('HandleItemClick', this.state.directoryPosition + "/" + this.state.filename, this.state.isFile);
    }

    Copy() {
        Copy(this.state.directoryPosition, this.state.filename);
    }

    Cut() {
        Cut(this.state.directoryPosition, this.state.filename)
    }

    Paste() {
        Paste(this.state.directoryPosition);
    }

    Delete() {
        Delete(this.state.directoryPosition + "/" + this.state.filename);
    }

    OpenRenameBox() {
        this.setState({ Renaming: true, RenamingInputText: this.state.filename });
    }

    Rename() {
        var newFileName = this.state.RenamingInputText;
        if (newFileName !== "" && newFileName !== this.state.filename) {
            console.log(newFileName);
            wfs.moveFile(this.state.directoryPosition + "/" + this.state.filename,
                this.state.directoryPosition + "/" + newFileName).then(() => {
                    this.setState({ filename: newFileName });
                    this.processDir(true);
                });
        }
        this.setState({ Renaming: false });
    }


    Download() {
        if (this.state.isFile) {
            emitter.emit("AddDownload", this.state.directoryPosition + "/" + this.state.filename + "/");
        }
    }


    ProcessMouse(action) {
        if (action === "onClick") {
            this.setState({ selected: true, mouseOverBoxClass: "selectedBox" });
        }
        else if (action === "onContextMenu") {
            this.setState({ contextMenuOpen: true, mouseOverBoxClass: "selectedBox" });
        }
        else if (!this.state.contextMenuOpen && !this.state.selected) {
            if (action === "onMouseEnter") {
                if (this.state.isFile) {
                    this.setState({ mouseOverBoxClass: "mouseOverBoxDefault" })
                }
                else {
                    this.setState({ mouseOverBoxClass: "mouseOverBoxDefault" })
                }
            }
            else {
                this.setState({ mouseOverBoxClass: "" })
            }
        }
    }

    render() {
        const data = {
            Copy: () => this.Copy(),
            Paste: () => this.Paste(),
            Cut: () => this.Cut(),
            Delete: () => this.Delete(),
            Rename: () => this.OpenRenameBox(),
            Download: () => this.Download(),
        }



        return (
            <ContextMenuProvider
                storeRef={false}
                id="menu_id"
                data={data}
                component={Table.Row}
                onMouseEnter={() => this.ProcessMouse("onMouseEnter")}
                onMouseLeave={() => this.ProcessMouse("onMouseLeave")}
                onContextMenu={() => this.ProcessMouse("onContextMenu")}
                onClick={() => this.ProcessMouse("onClick")}
                className={this.state.mouseOverBoxClass}
                onDoubleClick={() => this.processClick()}
            >
                <Table.Cell
                    title={
                        this.state.filename.length > 57 && !this.state.Renaming ?
                            this.state.filename : ""
                    }
                    colSpan='2'>
                    <Icon size='large' name={this.state.fileIcon} />
                    {!this.state.Renaming &&
                        this.state.filename
                    }
                    {this.state.Renaming &&
                        <Input
                            focus
                            onFocus={(e) => handleFocusHighlight(e, 0, this.state.RenamingHighlightMaxIndex)}
                            icon={{ name: 'edit', circular: true, link: true, onClick: () => this.Rename() }}
                            placeholder={this.state.filename}
                            value={this.state.RenamingInputText}
                            onKeyPress={(e) => handleKeyPress(e, "Enter", () => this.Rename())}
                            onChange={(event, data) => this.setState({ RenamingInputText: data.value })}
                        />
                    }

                </Table.Cell>
                <Table.Cell collapsing textAlign={"right"} >{this.state.fileSize}</Table.Cell>
                <Table.Cell collapsing textAlign={"right"}>{this.state.lastModifide}</Table.Cell>

            </ContextMenuProvider>
        );
    }
}

export default FileHolder;