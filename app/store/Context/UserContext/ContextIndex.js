import {UserReducer, initialState} from './Reducer';
import {
  Logout,
  fetchUser,
  fetchContactList,
} from '../../../services/UserAccount';
import createDataContext from '../../Store';

export const {Context, Provider} = createDataContext(
  UserReducer,
  {Logout, fetchUser, fetchContactList},
  initialState,
);
