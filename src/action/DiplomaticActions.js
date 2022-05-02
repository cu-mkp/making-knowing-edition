import ReactGA from 'react-ga4';

var DiplomaticActions = {};

DiplomaticActions.setFixedFrameMode = function setFixedFrameMode( state, mode ) {
   return {
       ...state,
       fixedFrameMode: mode 
   };
};

DiplomaticActions.recordLanding = function recordLanding(state) {
    const firstPage = window.location.hash.slice(1)
    ReactGA.send({ hitType: "pageview", page: firstPage });  
    // console.log('initial GA: '+firstPage)

    return {
        ...state,
        firstPageLoad: false 
    };
};

export default DiplomaticActions;