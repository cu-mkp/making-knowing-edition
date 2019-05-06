
var AuthorActions = {};

AuthorActions.loadAuthors = function loadAuthors( state, authorData ) {
    return {
        ...state,
        loaded: true,
        authors: authorData
    }
};

export default AuthorActions;