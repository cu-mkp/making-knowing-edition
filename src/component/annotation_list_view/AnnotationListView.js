import React, {Component, useEffect, useState} from 'react';
import {connect} from 'react-redux';
import { Paper, Typography, IconButton, Divider, Button, Popover, Tooltip } from '@material-ui/core';
import { Icon } from "react-font-awesome-5";
import { Link } from 'react-scroll';
import { dispatchAction } from '../../model/ReduxStore';
import withWidth, { isWidthUp } from '@material-ui/core/withWidth';
import CardViewIcon from '@material-ui/icons/ViewModule';
import ThumbViewIcon from '@material-ui/icons/ViewComfy';
import AnnotationCard from './AnnotationCard';
import AnnotationThumb from './AnnotationThumb';
import ContentPage from '../ContentPage';
import ToggleButton from '@material-ui/lab/ToggleButton';
import ToggleButtonGroup from '@material-ui/lab/ToggleButtonGroup';

const AnnotationListView = props => {

    const [listMode, setListMode] = useState(isWidthUp('md', props.width) ? 'cards' : 'thumbs')

    useEffect(()=>{
        dispatchAction( props, 'DiplomaticActions.setFixedFrameMode', false )
    },[])

    const handleToggleListMode = (e, value) => {
        if(value) setListMode(value);
    };

    const {annotationSections} = props.annotations;
    const annotationCount = Object.keys(props.annotations.annotations).length;

    if( !props.annotations.loaded ) return null;
	return(
        <ContentPage
            menuNode={{
                page_heading: <h1 className='page-heading'>Research Essays for BnF Ms. Fr. 640</h1>, 
                header_graphic_filename: 'banner-essays.png',
                sections: annotationSections.map(s => ({title: s.name, id: s.id}))
            }}
            actionComponent={
                <ToggleButtonGroup
                    value={listMode}
                    exclusive
                    onChange={handleToggleListMode}
                    size='small'
                    style={{marginTop: 20}}
                >
                        <ToggleButton value='cards' >
                            <Tooltip title='Card View' >
                            <CardViewIcon className='view-icon' fontSize='large'/>
                            </Tooltip>
                        </ToggleButton>
                        <ToggleButton value='thumbs' >
                            <Tooltip title='Thumbnail View' >
                            <ThumbViewIcon className='view-icon' fontSize='large' />
                            </Tooltip>
                        </ToggleButton>
                </ToggleButtonGroup>
            }
        >
            <div id='annotation-list-view'>
                {annotationSections.map(s => {
                    return(
                        <div key={`section-${s.id}`}>
                            <h3 className='section-title' id={s.id}>{s.name}</h3>
                            <Divider style={{marginBottom: 20, marginTop: 5}}/>
                            <div className='flex-parent wrap jc-space-around' >
                                {s.annotations.map(a => {
                                    return(
                                        listMode === 'cards' ?
                                        <AnnotationCard 
                                            history={props.history} 
                                            key={`anno-${a.id}`} 
                                            annotation={a}
                                        /> :
                                        <AnnotationThumb 
                                            history={props.history} 
                                            key={`anno-${a.id}`} 
                                            annotation={a}>
                                        </AnnotationThumb>
                                    )
                                })}
                            </div>
                        </div>
                    )
                })

                }
            </div>
        </ContentPage>
    )
}

function mapStateToProps(state) {
    return {
        annotations: state.annotations
    };
}

export default withWidth() (connect(mapStateToProps)(AnnotationListView));
