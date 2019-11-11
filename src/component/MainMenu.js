import React from 'react'
import { Link, withRouter } from 'react-router-dom'
import { Menu, MenuItem } from '@material-ui/core'

const menuStructure = [
    {
        "label": "How to use",
        "route": "/docs/how-to-use",
    },
    {
        "label": "The text",
        "menuItems": [
            {
                "label": "Overview and about",
                "route": "/docs/text" 
            },
            {
                "label": "Folios",
                "route": "/folios" 
            },
            {
                "label": "List of entries",
                "route": "/entries" 
            },
            {
                "label": "Index of keywords (term indices)",
                "placeholder": true,
                "route": "/" 
            }
        ]
    },
    {
        "label": "Research and Resources",
        "menuItems": [
            {
                "label": "Overview",
                "placeholder": true,
                "route": "/" 
            },
            {
                "label": "Principles of transcription, translation, and encoding",
                "placeholder": true,
                "route": "/" 
            },
            {
                "label": "Research essays",
                "route": "/essays" 
            },
            {
                "label": "Bibliography",
                "placeholder": true,
                "route": "/" 
            },
            {
                "label": "Glossary",
                "placeholder": true,
                "route": "/" 
            },
            {
                "label": "Field notes",
                "placeholder": true,
                "route": "/" 
            },
            {
                "label": "Resources",
                "placeholder": true,
                "route": "/" 
            }

        ]
    },
    {
        "label": "About",
        "menuItems": [
            {
                "label": "Creation of the edition",
                "route": "/docs/about_creation" 
            },
            {
                "label": "About the M&amp;K Project",
                "route": "/docs/about_m-k-project" 
            },
            {
                "label": "Peer review",
                "route": "/docs/about_peer-review" 
            },
            {
                "label": "Credits",
                "placeholder": true,
                "route": "/" 
            },
            {
                "label": "Contact",
                "placeholder": true,
                "route": "/" 
            },
            {
                "label": "Sponsors",
                "placeholder": true,
                "route": "/" 
            },
            {
                "label": "How to cite",
                "placeholder": true,
                "route": "/" 
            },
        ]
    }
]

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

    renderTopNav() {
        
        const closeMenu = () => {
            this.setState({ ...this.state, activeMenuEl: null, activeMenu: null });
        }

        const topNavItems = [], subMenus = []
        let i = 0
        for( const topNavItem of menuStructure ) {
            const itemKey = `top-nav-item-${i++}`
            const activateMenu = (event) => {
                this.setState({ ...this.state, activeMenuEl: event.currentTarget, activeMenu: itemKey });
            }
            
            if( topNavItem.menuItems ) {
                topNavItems.push( <span key={itemKey} onMouseOver={activateMenu} onMouseOut={closeMenu}>{topNavItem.label}</span> )
                // subMenus.push( this.renderSubMenu(topNavItem.menuItems) )
            } else {
                topNavItems.push( <span key={itemKey} onClick={()=>{this.navTo(topNavItem.route)}}>{topNavItem.label}</span> )
            }
        }

        return (
            <div className="expandedViewOnly">
                { topNavItems }
                { subMenus }
            </div>
        )
    }

    renderSubMenu(menu) {
        const menuItems = []
        let i = 0
        for( const menuItem of menu.menuItems) {
            const itemKey = `menu-item-${i++}`
            if( !menuItem.placeholder ) {
                menuItems.push( <MenuItem key={itemKey}>{menuItem.label}</MenuItem> )
            } else {
                menuItems.push( <MenuItem key={itemKey} onClick={()=>{this.navTo(menuItem.route)}}>{menuItem.label}</MenuItem> ) 
            }
        }

        return( 
            <Menu style={{ marginLeft: 10, marginTop: 62 }} open={false} anchorEl={null}>
                { menuItems }
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
			return this.renderTopNav()
        }        
    }

}

export default withRouter(MainMenu);