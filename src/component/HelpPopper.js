import React from 'react';
import Popper from '@material-ui/core/Popper';
import Typography from '@material-ui/core/Typography';
import Fade from '@material-ui/core/Fade';
import Paper from '@material-ui/core/Paper';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import {Icon} from "react-font-awesome-5";


const HelpPopper=(props)=>{
            
           return( <Popper  anchorEl={props.anchorEl} open={props.open} style={props.marginStyle}>
            
                        <Paper className="helpContainer">
                              <div onClick={props.onClose} className="closeX">
                                    <span className="fa fa-window-close" ></span>
                              </div>
                        <div className="helpHeader">
                              <Typography variant="subtitle1">Toolbar Buttons</Typography>
                        </div>
                        <div>
                              <List>
                                          <ListItem button>
                                                <span className='fa fa-lock active'></span>
                                                <ListItemText primary="Toggle Sync Views" />
                                          </ListItem>
                                          <ListItem button>
                                                <span className='fa fa-book active'></span>
                                                <ListItemText primary="Toggle Book Mode" />
                                          </ListItem>
                                          <ListItem button>
                                                <span className='fa fa-code active'></span>
                                                <ListItemText primary="Toggle XML Mode" />
                                          </ListItem>
                                          <ListItem button>
                                                <span className='fa fa-columns active'></span>
                                                <ListItemText primary="Toggle Single Column Mode" />
                                          </ListItem>
                                          <ListItem button>
                                          <span><Icon.ArrowCircleLeft/><Icon.ArrowCircleRight/></span>
                                                <ListItemText primary="Go Forward / Back" />
                                          </ListItem>
                                          <ListItem button>
                                                <span className='fa fa-hand-point-right active'></span>
                                                <ListItemText primary="Jump to folio" />
                                          </ListItem>
                                    </List>
                              </div>
                        </Paper>
          
      </Popper>)

}

export default HelpPopper;