import React from 'react';
import Popper from '@material-ui/core/Popper';
import Typography from '@material-ui/core/Typography';
import Fade from '@material-ui/core/Fade';
import Paper from '@material-ui/core/Paper';

const SearchHelpPopper=(props)=>{            
    return ( 
        <Popper anchorEl={props.anchorEl} open={props.open}>
            <Fade in={props.open} >
                <Paper className="searchHelpContainer">
                    <div onClick={props.onClose} className="closeX">
                        <span className="fa fa-window-close" ></span>
                    </div>
                    <div className="helpHeader">
                        <Typography variant="subtitle1">Searching the Edition</Typography>
                    </div>
                    <div style={{ marginTop: 10}}>
                        <Typography>The search bar allows you to search for words or phrases in the critical edition as well as the research essays. To search for a phrase, wrap the phrase in "quotes". Terms not in quotes are looked for together in the same entry, but not as a single phrase. The search is very literal, but if you want to find variants of a word you can use a wildcard "*" character. You can search in French and in English.</Typography>
                    </div>                        
                </Paper>
            </Fade>
        </Popper>
    )
}

export default SearchHelpPopper;