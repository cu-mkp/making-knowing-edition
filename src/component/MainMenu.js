import { IconButton, Menu, MenuItem } from '@material-ui/core';
import withWidth, { isWidthUp } from '@material-ui/core/withWidth';
import MenuIcon from '@material-ui/icons/Menu';
import SearchIcon from '@material-ui/icons/Search';
import React from 'react';
import { connect } from 'react-redux';
import { Link, withRouter } from 'react-router-dom';


class MainMenu extends React.Component {

    constructor(props,context) {
        super(props,context);
        this.state = {
            activeMenuEl: null,
            activeMenu: null
        }
    }

    renderProduction() {
        return (
            <div className="expandedViewOnly">
                <span>Research Essays</span>
                <Link to='/entries'>Entries</Link>
                <Link to='/folios'>Folios</Link>
                <span>About</span>
            </div>
        );
    }

    closeMenu = () => {
        this.setState({ ...this.state, activeMenuEl: null, activeMenu: null });
    }

    renderTopNav() {
        const {menuStructure} = this.props.contents
        const topNavItems = [], subMenus = []
        const currentRoute = window.location.hash.replace('#', '');
        let i = 0
        for( const topNavItem of menuStructure ) {
            const itemKey = `top-nav-item-${i++}`
            const activateMenu = (event) => {
                this.setState({ ...this.state, activeMenuEl: event.currentTarget, activeMenu: itemKey });
            }
            
            if( topNavItem.menuItems ) {
                topNavItems.push( <span key={itemKey} onClick={activateMenu} >{topNavItem.label}</span> )
                subMenus.push( this.renderSubMenu(topNavItem.menuItems, itemKey) )
            } else if(topNavItem.label) {
                const activeClass = currentRoute === topNavItem.route ? 'active' : ''
                topNavItems.push( 
                <a 
                    className={`cta-link nav-item ${activeClass}`} 
                    key={itemKey} 
                    onClick={()=>{this.navTo(topNavItem.route)}}
                >
                    {topNavItem.label}
                </a> 
                )
            }
        }
        if (isWidthUp('md', this.props.width)){
            const searchNavItem = <a 
                key='search-button'
                className='cta-link nav-item search-link' 
                onClick={this.props.onToggleSearch}
            >
                Search 
            </a>;

            return (
                <div className="expandedViewOnly flex-parent jc-space-btw ai-end row-reverse">
                    {[...topNavItems, searchNavItem].reverse()}
                    {subMenus}
                    <Link to='/' className='home-link' >
                        <img className="" alt="Project Logo" src="/img/mk-banner-logo.png"></img>
                    </Link>
                </div>
            )
        } else {
            return (
                <>
                    <Link to='/' onClick={this.props.isMobileMenuOpen ? this.props.onToggleMobileMenu : null} className='home-link' >
                        <img className="" alt="Project Logo" src="/img/mk-banner-logo.png"></img>
                    </Link>
                    <div className='flex-parent'>
                        <IconButton 
                            style={{width: 54, height: 54, color: 'black'}}
                            onClick={this.props.onToggleMobileMenu}
                        >
                            <MenuIcon />
                        </IconButton>
                        <IconButton 
                            style={{width: 54, height: 54, color: 'black'}}
                            onClick={this.props.onToggleSearch}
                        >
                            <SearchIcon />
                        </IconButton>
                    </div>
                </>
            )
        }
    }

    renderSubMenu(menuItems, menuKey) {

        const onClickCallback = (route) => {
            return () => {
                this.navTo(route)
                this.closeMenu()
            }
        }

        const menuItemElements = []
        let i = 0
        for( const menuItem of menuItems) {
            const itemKey = `menu-item-${i++}`
            if( menuItem.placeholder ) {
                menuItemElements.push( 
                    <MenuItem 
                        key={itemKey} 
                        onClick={this.closeMenu}
                        style={{ color: "gray" }}
                    >
                        <i>{menuItem.label}</i>
                    </MenuItem> 
                )
            } else {
                menuItemElements.push( 
                    <MenuItem 
                        key={itemKey} 
                        onClick={onClickCallback(menuItem.route)}
                    >
                        {menuItem.label}
                    </MenuItem> 
                ) 
            }
        }

        const isOpen = this.state.activeMenu === menuKey
        const anchorEl = isOpen ? this.state.activeMenuEl : null
        
        return ( 
            <Menu                      
                key={`${menuKey}-submenu`}
                style={{ marginLeft: 10, marginTop: 62 }} 
                open={isOpen} 
                anchorEl={anchorEl}
                disableAutoFocusItem={true}
                onBackdropClick={this.closeMenu}
            >
                { menuItemElements }
            </Menu>
        )            
    }

    navTo(route) {
        this.props.history.push(route);
    }

    render() {
        if( process.env.REACT_APP_HIDE_IN_PROGRESS_FEATURES === 'true') {
            return this.renderProduction()
		} else {
            if( !this.props.contents.menuStructure ) return null;
			return this.renderTopNav()
        }        
    }

}

function mapStateToProps(state) {
    return {
        contents: state.contents
    };
}

export default withWidth()(connect(mapStateToProps)(withRouter(MainMenu)));
