import { isWidthUp, Paper, Slide, withWidth } from '@material-ui/core';
import React, { useEffect, useState } from 'react';
import SideMenuIconLeft from '../icons/SideMenuIconLeft';
import SideMenuIconRight from '../icons/SideMenuIconRight';
import SideNavBar from './SideNavBar';

const ContentPage = props => {
    const {menuNode, contentId, children} = props;
    const {page_heading, sub_heading_link, header_graphic_filename, sections} = menuNode;
    const imagesBaseURL = `${process.env.PUBLIC_URL}/img`
    const isMobileView = !isWidthUp('sm', props.width);
    const [mobileNavOpen, setMobileNavOpen] = useState(false)
    const toggleMobileNav = () => setMobileNavOpen(!mobileNavOpen);

    useEffect(() => {
        if(!isMobileView && mobileNavOpen) setMobileNavOpen(false);
    }, [isMobileView])

    return (
        <div id='content-page'>

                {/* MOBILE VIEW SIDE NAV */}
                <Slide in={mobileNavOpen && isMobileView} direction='right' >
                    <Paper elevation={3} className='bg-yellow-tan-gradient-tb mobile-nav-container' >
                        <SideNavBar 
                            sections={sections} 
                            actionComponent={props.actionComponent}
                            toggleMobileNav={toggleMobileNav}
                        />
                    </Paper>
                </Slide>
                <div className='bg-maroon-gradient accent-bar' />

                {/* PAGE HEADER */}
                <Paper elevation={2} className='flex-parent jc-space-btw page-header bg-light-gradient-tb'>
                    <div className='heading-text flex-parent wrap column jc-center'>
                        {typeof page_heading === 'string' ?
                            <h1 className='page-heading'>
                                {page_heading}
                            </h1> :
                            page_heading                           
                        }
                        {sub_heading_link &&
                            <a className='sub-heading-link' href={sub_heading_link.url}>
                                {sub_heading_link.text}
                            </a>
                        }

                    </div>
                    {!isMobileView &&
                        <div className='image-container'>
                            <img src={`${imagesBaseURL}/${header_graphic_filename}`}/>
                        </div>
                    }
                </Paper>

                <div className='flex-parent'>

                    {/* NON-MOBILE VIEW SIDE NAV */}
                    {!isMobileView &&
                        <>
                            <div className='bg-dark-gradient-bt nav-bg'/>
                            <div>
                                <SideNavBar 
                                    sections={sections} 
                                    actionComponent={props.actionComponent} 
                                />
                            </div>
                        </>
                    }
                    <div id='content' 
                        style={{
                            width: `calc(100% - ${isMobileView ? '0px' : '300px'})`,
                        }}  
                    >

                        {children}

                        {/* TAB TO OPEN MOBILE SIDE NAV */}
                        <Slide in={isMobileView} direction='right' >
                            <Paper 
                                elevation={3}
                                className='side-menu-tab flex-parent ai-center jc-end' 
                                onDrag={toggleMobileNav}
                                onClick={toggleMobileNav}
                                style={{left: mobileNavOpen ? '75vw' :  -1}}
                            >
                                {mobileNavOpen 
                                    ? <SideMenuIconLeft color='white' width={30}/>
                                    : <SideMenuIconRight color='white' width={30}/>
                                }
                            </Paper>
                        </Slide>
                    </div>
                </div>
        </div>
    );
};

ContentPage.propTypes = {

};

export default withWidth()(ContentPage);