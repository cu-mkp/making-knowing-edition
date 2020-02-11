import ReactGA from 'react-ga';

var DiplomaticActions = {};

DiplomaticActions.setFixedFrameMode = function setFixedFrameMode( state, mode ) {
   return {
       ...state,
       fixedFrameMode: mode 
   };
};

DiplomaticActions.recordLanding = function recordLanding(state) {
    const firstPage = window.location.hash.slice(1)
    ReactGA.pageview(firstPage);  
    // console.log('initial GA: '+firstPage)

    return {
        ...state,
        firstPageLoad: false 
    };
};

export default DiplomaticActions;