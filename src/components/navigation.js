import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import * as transcriptionActions from '../actions/transcriptionActions';
import PropTypes from 'prop-types';
import React from 'react';

class navigation extends React.Component {
    componentWillMount() {
        this.props.transcriptionActions.fetchtranscription();
    }

    renderData(item) {
        return <div key={item.id}>{item.name}</div>;
    }

    render() {
        if(!this.props.transcription){
            return (
                <div>
                    Loading transcription...
                </div>
            )
        }else{
            return (
                <div className="">
                    {
                        this.props.transcription.map((item, index) => {
                            return (
                                this.renderData(item)
                            );
                        })
                    }
                </div>
            )
        }
    }
}

navigation.propTypes = {
    transcriptionActions: PropTypes.object,
    transcription: PropTypes.array
};

function mapStateToProps(state) {
    return {
        transcription: state.transcription
    };
}

function mapDispatchToProps(dispatch) {
    return {
       transcriptionActions: bindActionCreators(transcriptionActions, dispatch)
    };
}

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(navigation);
