import React from "react";
import { Container, Menu,Sticky } from 'semantic-ui-react';
import DirectoryListing from './DirectoryListing';
import GeneralOptionsMenu from './GeneralOptionsMenu';
import SettingsOptionsMenu from './SettingsOptionsMenu';
import UploadManager from './UploadManager/UploadManager';
import DownloadManager from './DownloadManager/DownloadManager';
import SearchManager from './SearchManager/SearchManager';
import '../css/general.css';



class TopMenu extends React.Component 
{ 
    render() {
        return (
            <Container fluid>
            <Sticky className={"sticky"} >
                <Menu borderless pointing>
                    <Menu.Item position='left'>
                        <SearchManager icon='search' placeholder='Search...' />
                        <GeneralOptionsMenu />
                    </Menu.Item>
                    <Menu.Item >
                        <DownloadManager />
                    </Menu.Item>
                    <Menu.Item >
                        <UploadManager />
                    </Menu.Item>
                    <Menu.Item >
                        <SettingsOptionsMenu LogOut={this.props.LogOut} />
                    </Menu.Item>
                </Menu>
            </Sticky>
                <DirectoryListing />
            </Container>
        );
    }
}

export default TopMenu;