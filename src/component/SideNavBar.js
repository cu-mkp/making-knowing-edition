import { useScrollTrigger } from '@material-ui/core';
import React from 'react';
import { Link } from 'react-scroll';

const SideNavBar = (props) => {
    const {sections, actionComponent, toggleMobileNav} = props;

    const scrollTrigger = useScrollTrigger({disableHysteresis: true});

    return (
        <div
            id='navbar' style={scrollTrigger ? {position: 'sticky'} : {}}
        >
            {sections && sections.map((s, i) => {
                return(
                    <div key={`section-${s.id}`} className='sections-container'>
                        <Link 
                            to={s.id}
                            onClick={toggleMobileNav ? toggleMobileNav : null}
                            activeClass="active-section" 
                            spy={true} 
                            smooth="true" 
                            offset={-120}
                        >
                            <p className="section-link" >
                                {s.title}              
                            </p> 
                        </Link>
                        <div className='flex-parent column sub-section-container'>
                            {s.sub_sections ? s.sub_sections.map(ss => {
                                return(
                                    <Link 
                                        to={ss.id}
                                        onClick={toggleMobileNav ? toggleMobileNav : null}
                                        key={`section-${ss.id}`}
                                        activeClass="active-section" 
                                        spy={true} 
                                        smooth="true" 
                                        offset={-230}
                                    >
                                        <p className="sub-section-link" >
                                            {ss.title}              
                                        </p> 
                                    </Link>
                                )
                            }) : ''}
                        </div>
                    </div>
                )
            })}
            {!!actionComponent &&
                <div style={{width: 'fit-content'}} onClick={toggleMobileNav} >
                    {actionComponent}
                </div>
            }
        </div>
    );
};

export default SideNavBar;