import React, {Component} from 'react';
import {connect} from 'react-redux';
import {dispatchAction} from '../model/ReduxStore';

class ContentView extends Component {

    componentWillMount() {
        dispatchAction( this.props, 'DiplomaticActions.setFixedFrameMode', true );
    }

	render() {
        return (
            <div id="content-view">
                <h1>BnF Ms Fr. 640</h1>
                <p>The manuscript now preserved at the Bibliothèque nationale de France, known as Ms. Fr. 640, comprises a compilation of technical "recipes" and observations about craft processes and natural materials. It was most probably written in the late sixteenth century by an experienced practitioner in the vicinity of Toulouse, France. The 171 folios of this rich and intriguing manuscript constitute the written record of the author-practitioner’s collection of recipes and his workshop investigations. The manuscript contains a remarkable range of techniques, including casting, mold making, metalwork, pigment and varnish making, drawing and painting instruction, practical therapeutics, vernacular natural history, practical perspective construction and the creation of optical effects, mechanical constructions, and even jokes and sleight-of-hand tricks. It offers a window into the early modern artisan’s workshop, revealing not only the materials and methods used by artisans and artists, but also insights into how and why nature was employed in creating art, and the extensive processes of experimentation that went on in an early modern workshop.</p>
            </div>
        );
	}
}

function mapStateToProps(state) {
    return {
        // TODO
    };
}

export default connect(mapStateToProps)(ContentView);
