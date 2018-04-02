import React from 'react';
import {connect} from 'react-redux';

class ImageZoomControl extends React.Component {

	render() {
		let in_id="os-zoom-in "+this.props.side;
	 	let out_id="os-zoom-out "+this.props.side;
		return (
			<ul className="ImageZoomControl">
			  <li><i id={in_id} className="zoom-in fas fa-plus-circle fa-2x"></i></li>
			  <li><i className="zoom-3 fas fa-circle fa-2x"></i></li>
			  <li><i className="zoom-2 fas fa-circle fa-lg"></i></li>
			  <li><i className="zoom-1 fas fa-circle"></i></li>
			  <li><i id={out_id}  className="zoom-out fas fa-minus-circle fa-2x"></i></li>
			  <li className={this.props.navigationState.bookMode?'hidden':''}><i onClick={this.props.onZoomGrid} className="zoom-grid fas fa-th fa-2x"></i></li>
			</ul>
		);
	}
}

function mapStateToProps(state) {
	return {
		navigationState: state.navigationState
	};
}
export default connect(mapStateToProps)(ImageZoomControl);
