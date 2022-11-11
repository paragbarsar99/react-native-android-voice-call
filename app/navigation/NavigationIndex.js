import {createStackNavigator} from '@react-navigation/stack';
import {useContext, useEffect, useState} from 'react';
import {SafeAreaView} from 'react-native';
import {IconButton} from 'react-native-paper';
import {Context as UserContext} from '../store/Context/UserContext/ContextIndex';
import Home from '../screens/Home';
import Login from '../screens/Login';
import Receive from '../screens/Receive';
import auth from '@react-native-firebase/auth';

const Stack = createStackNavigator();

const HomeStack = () => {
  const {state, Logout} = useContext(UserContext);
  return (
    <Stack.Navigator
      headerMode="screen"
      screenOptions={{
        headerRight: ({tintColor}) => (
          <IconButton
            onPress={() => {
              Logout();
            }}
            animated
            size={20}
            color={'black'}
            icon={{
              uri: 'https://cdn-icons-png.flaticon.com/512/992/992680.png',
            }}
          />
        ),
        headerRightContainerStyle: {
          paddingRight: 10,
        },
      }}>
      <Stack.Screen name="Home" component={Home} />
      <Stack.Screen name="Receive" component={Receive} />
    </Stack.Navigator>
  );
};

export default function MainNavigator() {
  const [isLogin, setIsLogin] = useState();

  useEffect(() => {
    const unsubscribe = auth().onAuthStateChanged(user => {
      if (user) {
        setIsLogin(true);
      } else {
        setIsLogin(false);
      }
    });
    return () => {
      unsubscribe();
    };
  }, []);

  return (
    <SafeAreaView style={{flex: 1}}>
      {isLogin ? (
        <Stack.Navigator headerMode="none">
          <Stack.Screen name="HomeStack" component={HomeStack} />
        </Stack.Navigator>
      ) : (
        <Stack.Navigator>
          <Stack.Screen name="Login" component={Login} />
        </Stack.Navigator>
      )}
    </SafeAreaView>
  );
}
