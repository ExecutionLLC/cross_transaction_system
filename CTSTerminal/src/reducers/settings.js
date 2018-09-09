import * as ActionTypes from '../actions/settings';


const initialState = {
  url: null,
};


function reduceSetUrl(state, { url }) {
  return {
    ...state,
    url,
  };
}

export default function (state = initialState, action) {
  switch (action.type) {
    case ActionTypes.SET_URL:
      return reduceSetUrl(state, action);
    default:
      return state;
  }
}
