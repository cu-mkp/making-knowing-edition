import React from 'react';
import Popper from '@material-ui/core/Popper';
import Typography from '@material-ui/core/Typography';
import Fade from '@material-ui/core/Fade';
import Paper from '@material-ui/core/Paper';
import CloseIcon from '@material-ui/icons/Cancel';

const SearchHelpPopper=(props)=>{            
    return ( 
        <Popper style={{zIndex: 2}} anchorEl={props.anchorEl} open={props.open}>
            <Fade in={props.open} >
                <Paper className="searchHelpContainer">
                    <div onClick={props.onClose} className="closeX">
                        <CloseIcon />
                    </div>
                    <div className="helpHeader">
                        <Typography variant="subtitle1">Quick Search Tips</Typography>
                    </div>
                    <div style={{ marginTop: 10}}>
                        <ul>
                            <li><Typography >Results given for pages on which all words appear (i.e., default search is AND)</Typography></li>
                            <li><Typography >Use * for wildcard search (e.g., gol* = gold, golden, goldsmith, etc.)</Typography></li>
                            <li><Typography >Use " " for exact phrases (e.g., "goldsmiths' forge")</Typography></li>
                            <li><Typography >Use "exit search" button in upper left of left pane to return to regular browsing</Typography></li>
                        </ul>                    
                    </div>                        
                </Paper>
            </Fade>
        </Popper>
    )
}

export default SearchHelpPopper;