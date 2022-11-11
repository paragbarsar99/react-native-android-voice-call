import userCollection from '../utils/FirebaseCollection';
import auth from '@react-native-firebase/auth';
import {
  USER_DETAILS,
  CONTACT_LIST,
} from '../store/Context/UserContext/ActionType';
import usersCollection from '../utils/FirebaseCollection';

//Actions
export const fetchUser = dispatch => async () => {
  try {
    dispatch({
      type: USER_DETAILS,
      payload: {
        isLoading: true,
        data: {},
        error: '',
      },
    });
    await userCollection
      .where('userid', '==', auth().currentUser.uid)
      .get()
      .then(res => {
        if (!res.empty) {
          res.docs.forEach(user => {
            dispatch({
              type: USER_DETAILS,
              payload: {
                isLoading: false,
                data: {
                  ...user.data(),
                },
                error: '',
              },
            });
          });
        }
      })
      .catch(error => {
        dispatch({
          type: USER_DETAILS,
          payload: {
            isLoading: false,
            data: {},
            error: '',
          },
        });
      });
  } catch (error) {
    console.log(`error inside FetchUser is: ${error}`);
  }
};

export const Logout = dispatch => async () => {
  try {
    await auth().signOut();
  } catch (error) {}
};

export const fetchContactList = dispatch => async () => {
  try {
    dispatch({
      type: CONTACT_LIST,
      payload: {
        isLoading: true,
        data: [],
        error: '',
      },
    });
    const currentUserId = auth().currentUser.uid;
    await usersCollection
      .where('userid', '!=', currentUserId)
      .get()
      .then(Res => {
        if (!Res.empty) {
          const getUserData = [];
          Res.forEach(item => {
            getUserData.push(item.data());
          });
          dispatch({
            type: CONTACT_LIST,
            payload: {
              isLoading: false,
              data: [...getUserData],
              error: '',
            },
          });
        }
      });
  } catch (err) {
    dispatch({
      type: CONTACT_LIST,
      payload: {
        isLoading: false,
        data: [],
        error: err,
      },
    });
    console.error('contactList: ', err);
  }
};
