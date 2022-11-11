import {CONTACT_LIST, USER_DETAILS} from './ActionType';

//Initial State
export const initialState = {
  userDetails: {
    isLoading: false,
    data: {
      userName: '',
      userPhone: '',
      fcmToken: '',
    },
    error: '',
  },
  contactList: {
    isLoading: false,
    data: [],
    error: '',
  },
};

//Reducer
export const UserReducer = (state, action) => {
  switch (action.type) {
    case USER_DETAILS:
      return {
        ...state,
        userDetails: {
          ...action.payload,
        },
      };
    case CONTACT_LIST:
      return {
        ...state,
        contactList: {
          ...action.payload,
        },
      };
    default:
      return state;
  }
};
