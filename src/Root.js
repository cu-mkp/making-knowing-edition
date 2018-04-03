import React from 'react'
import PropTypes from 'prop-types'
import { Provider } from 'react-redux'
import DiploMatic from './DiploMatic';
import { HashRouter, Route } from 'react-router-dom'

const Root = ({ store }) => (
	<Provider store={store}>
		<HashRouter>
			<Route path="/:filter?" component={DiploMatic}/>
		</HashRouter>
	</Provider>
)

Root.propTypes = {
	store: PropTypes.object.isRequired
}

export default Root
