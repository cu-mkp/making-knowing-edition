import React from 'react'
import { Link } from 'react-router-dom'
import { Button, Menu, MenuItem } from '@material-ui/core'

export default class MainMenu extends React.Component {

    constructor(props,context) {
        super(props,context);
        this.state = {
            anchorEl: null,
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

    clickHowToUse = () => {
        // TODO navigate to home page
    }

    toggleTextMenu = (event) => {
        this.setState({ ...this.state, anchorEl: event.currentTarget, activeMenu: true });
    }

    toggleResearchMenu = () => {

    }

    toggleAboutMenu = () => {

    }


    handleClose = () => {
        this.setState({ ...this.state, anchorEl: null, activeMenu: false });
    }

    render() {
        if( process.env.REACT_APP_HIDE_IN_PROGRESS_FEATURES === 'true') {
            return this.renderProduction()
		} else {
            const { anchorEl, activeMenu } = this.state

			return (
				<div className="expandedViewOnly">
					<Button onClick={this.clickHowToUse}>How to use</Button>
					<Button onClick={this.toggleTextMenu}>The text</Button>
                    <Menu open={activeMenu} anchorEl={anchorEl}>
                      <MenuItem onClick={this.handleClose}>Overview and about</MenuItem>
                      <MenuItem onClick={this.handleClose}>Folios</MenuItem>
                      <MenuItem onClick={this.handleClose}>List of entries</MenuItem>
                    </Menu>
					<Button onClick={this.toggleResearchMenu}>Research and Resources</Button>
                    <Menu open={false} anchorEl={anchorEl}>
                      <MenuItem onClick={this.handleClose}>Overview</MenuItem>
                      <MenuItem onClick={this.handleClose}>Principles of transcription, translation, and encoding</MenuItem>
                      <MenuItem onClick={this.handleClose}>Research essays</MenuItem>
                      <MenuItem onClick={this.handleClose}>Bibliography</MenuItem>
                      <MenuItem onClick={this.handleClose}>Resources</MenuItem>
                    </Menu>
					<Button onClick={this.toggleAboutMenu}>About</Button>
                    <Menu open={false} anchorEl={anchorEl}>
                      <MenuItem onClick={this.handleClose}>Creation of the edition</MenuItem>
                      <MenuItem onClick={this.handleClose}>About the M&amp;K Project</MenuItem>
                      <MenuItem onClick={this.handleClose}>Peer review</MenuItem>
                      <MenuItem onClick={this.handleClose}>Credits</MenuItem>
                      <MenuItem onClick={this.handleClose}>Contact</MenuItem>
                      <MenuItem onClick={this.handleClose}>Sponsors</MenuItem>
                      <MenuItem onClick={this.handleClose}>How to cite</MenuItem>
                    </Menu>
				</div>
			);
        }        
        
        // <Link to='/essays'>Research Essays</Link>
		// <Link to='/entries'>Entries</Link>
		// <Link to='/folios'>Folios</Link>

    }

}