import React from "react";
import {  Breadcrumb } from 'semantic-ui-react';
import '../css/general.css';
import {getEmitter} from '../processors/EventEmitterManager';
const emitter = getEmitter();

class DirectoryListing extends React.Component 
{

    constructor(props) {
        super(props);
        this.state = {
            currentDir: [],
            renderDirectory:[],
        }
    }

    componentDidMount()
    {
        this.listener = emitter.addListener('UpdateDirectoryListing', (newdir) => {
            this.UpdateDirListing(newdir);
        });
    }

    OnDirListsingClick(index)
    {
        if(index === this.state.renderDirectory.length-1) return;
        var DirToGoTo = "";
        for (var i = 0; i <= index; i++) 
        {
            var tempNameList = this.state.currentDir[i]==="" ? this.state.currentDir[i] : "/" + this.state.currentDir[i];
            DirToGoTo += tempNameList;
        }
        emitter.emit('HandleItemClick', DirToGoTo,false);
    }

    UpdateDirListing(newDir)
    {
        var dirs = newDir.split("/");
        var compRend = [];
        for (var i = 0; i < dirs.length; i++) 
        {
            var NameOfDir = i === 0 ? "Home" : dirs[i];
            compRend.push(NameOfDir);
        }

        this.setState({renderDirectory:compRend,currentDir:dirs});
    }


    render() {
        return (
            <Breadcrumb className="try" size='big'>
                {this.state.renderDirectory.map((NameVal, index) =>
                    <span key={index} >
                        <Breadcrumb.Section 
                        link={index !== this.state.renderDirectory.length-1} 
                        active={index === this.state.renderDirectory.length-1} 
                        onClick={index !== this.state.renderDirectory.length-1?
                        () => this.OnDirListsingClick(index):null} >
                            {NameVal}
                        </Breadcrumb.Section>
                        <Breadcrumb.Divider as={"div"} icon='right chevron' />
                    </span>
                )}

           
            </Breadcrumb>
        );
    }
}

export default DirectoryListing;