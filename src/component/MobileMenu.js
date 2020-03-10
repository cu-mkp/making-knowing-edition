import React, {useState} from 'react';
import Menu from '@material-ui/core/Menu';
import MenuIcon from '@material-ui/icons/Menu';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ExpandLess from '@material-ui/icons/ExpandLess';
import ExpandMore from '@material-ui/icons/ExpandMore';
import Collapse from '@material-ui/core/Collapse';

export default function MobileMenu(props) {
    const {menuStructure} = props;

    const defaultMenuState = menuStructure.map((item, i) => {
        if(item.menuItems){
            return {...item, isOpen: false}
        } else {
            return item
        }
    });
    const [menuState, setMenuState] = useState(defaultMenuState)
    const toggleSubMenu = (i) => {
        let stateCopy = Object.assign([], menuState)
        stateCopy[i].isOpen = !stateCopy[i].isOpen
        return setMenuState(stateCopy)
    }

    const [anchorEl, setAnchorEl] = React.useState(null);
    const handleMenuOpen = event => {
        setAnchorEl(event.currentTarget);
    };
    const handleMenuClose = () => {
        setAnchorEl(null);
        setMenuState(defaultMenuState)
    };
    const navTo = (route) => {
        handleMenuClose()
        props.history.push(route)
    }

    return (
        <div style={{display: "flex", justifyContent: "flex-end"}}>
            <div onClick={handleMenuOpen} style={{cursor: "pointer"}}>
                <MenuIcon style={{width: 30, height: 30}}/>
            </div>
            <Menu
                anchorEl={anchorEl}
                keepMounted
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
                style={{ top: 50}}
            >
                <List component="nav" style={{ width: 300, outline: "none"}}>
                {menuState.map((item, i) => {
                    if(item.menuItems) {
                        return(
                            <div key={`top-nav-item-${i}`}>
                                <ListItem 
                                    button 
                                    onClick={()=>toggleSubMenu(i)}
                                >
                                    <ListItemText primary={item.label} />
                                    {item.isOpen ? <ExpandLess /> : <ExpandMore />}
                                </ListItem>
                                <Collapse in={item.isOpen} timeout="auto" unmountOnExit>
                                    <List component="div" disablePadding>
                                        {item.menuItems.map((subItem, i) =>
                                            <ListItem button key={`sub-nav-item-${i}`}>
                                                <ListItemText 
                                                    primary={subItem.label}
                                                    onClick={() => navTo(subItem.route)}
                                                    style={{ paddingLeft: 15}}
                                                />
                                            </ListItem>
                                        )}
                                    </List>
                                </Collapse>
                            </div>
                        )
                    } else {
                        return(
                            <ListItem button key={`top-nav-item-${i}`}>
                                <ListItemText onClick={() => navTo(item.route)} primary={item.label}/>
                            </ListItem>
                        )
                    }
                }
                )}
                </List>
            })}
            </Menu>
        </div>
    );
}