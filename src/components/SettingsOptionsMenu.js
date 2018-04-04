import React from "react";
import { Container,Dropdown } from 'semantic-ui-react';
import  '../css/general.css';


class SettingsOptionsMenu extends React.Component 
{
    render() {
        return (
            <Container fluid>
            <Dropdown pointing={"top right"} icon='setting' floating button className='icon'>
                <Dropdown.Menu >
                    <Dropdown.Item onClick={()=>this.props.LogOut()} icon='log out' text='Log Out' />
                </Dropdown.Menu>
            </Dropdown>
            </Container>
        );
    }
}

export default SettingsOptionsMenu;