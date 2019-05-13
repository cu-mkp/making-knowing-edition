import React, {Component} from 'react';
import {connect} from 'react-redux';
import Typography from '@material-ui/core/Typography';

import CustomizedTooltops from './CustomizedTooltops';

class EditorComment extends Component {

    render() {
        const comments = this.props.comments.comments
        const commentText = comments[this.props.commentID] ? 
            comments[this.props.commentID] : 
            `ERROR: Could not find comment for id: ${this.props.commentID}.`
        
        const frag = (
            <div>
                <Typography>{commentText}</Typography>
            </div>
        )
        const style = { fontStyle: 'bold', fontSize: '20pt', color: 'red' }

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
