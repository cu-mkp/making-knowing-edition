import React, {Component} from 'react';
import {connect} from 'react-redux';
import Typography from '@material-ui/core/Typography';

import CustomizedTooltops from './CustomizedTooltops';

class EditorComment extends Component {

    render() {
        const comments = this.props.comments.comments

        // TODO get the comment from the comments table
        
        const frag = (
            <div>
                <Typography>{comments[this.props.commentID].comment}</Typography>
            </div>
        )
        const style = { color: 'red' }

        return ( 
            <CustomizedTooltops 
                htmlFragment={frag}
                inner={<span style={style}>*</span>}
            >                    
            </CustomizedTooltops>                  
        )
    }
}

function mapStateToProps(state) {
    return {
        comments: state.comments
    };
}

export default connect(mapStateToProps)(EditorComment);
