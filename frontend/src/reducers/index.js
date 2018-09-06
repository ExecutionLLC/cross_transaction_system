import { combineReducers } from 'redux';

import { authentication } from './authentication_reducer';

const rootReducer = combineReducers({
  authentication,
});

export default rootReducer;
