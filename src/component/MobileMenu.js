import { withWidth } from '@material-ui/core';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import React from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';

const MobileMenu = props => {
    const {onToggleMobileMenu} = props;
    const menuStructure = props.contents.menuStructure
        ? props.contents.menuStructure.filter(m => m.label) 
        : [];

    const navTo = (route) => {
        onToggleMobileMenu()
        props.history.push(route)
    }

    return (
        <div className='flex-parent list-container'>
            <List style={{outline: "none"}}>
                {menuStructure.map((item, i) => {
                    return(
                            <ListItem
                                button
                                onClick={()=>navTo(item.route)}
                                key={item.route}
                            >
                                <ListItemText 
                                    style={{textAlign: 'center', color: '#E9E1DB', fontSize: 22}} 
                                    primary={item.label}
                                    disableTypography
                                />
                            </ListItem>
                    )
                })}
            </List>
            <img 
                style={{
                    width: 50, 
                    position: 'absolute', 
                    right: -75, 
                    top: 'calc(50% - 27.5px'
                }} 
                src='/img/lizard-no-bg.png'
            />
        </div>
    );
}

function mapStateToProps(state) {
    return {
        contents: state.contents
    };
}

export default withWidth()(connect(mapStateToProps)(withRouter(MobileMenu)));