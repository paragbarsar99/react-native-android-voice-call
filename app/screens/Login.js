import {Alert, Pressable, StyleSheet, View} from 'react-native';
import React, {useState, useEffect} from 'react';
import {Text, Button, TextInput} from 'react-native-paper';
import {SafeAreaView} from 'react-native-safe-area-context';
import auth from '@react-native-firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import usersCollection from '../utils/FirebaseCollection';
import messaging from '@react-native-firebase/messaging';

export default function Login() {
  const [getter, setter] = useState({
    email: '',
    password: '',
    userName: '',
    userPhone: '',
    isVisible: false,
    isLoading: false,
    emailError: '',
    passwordError: '',
    nameError: '',
    phoneError: '',
    signUp: false,
  });

  const onSingUp = async () => {
    if (getter.email && getter.password && getter.userName) {
      setter(prev => ({
        ...prev,
        isLoading: true,
      }));
      await auth()
        .createUserWithEmailAndPassword(getter.email, getter.password)
        .then(async Res => {
          console.log(Res);
          await AsyncStorage.setItem(
            '@userToken',
            JSON.stringify(Res.user.uid),
          );
          const token = await messaging().getToken();
          const uid = auth().currentUser.uid;
          await usersCollection.doc(uid).set({
            userName: getter.userName,
            userPhone: getter.userPhone,
            userid: uid,
            fcmToken: token,
          });
          setter(prev => ({
            ...prev,
            isLoading: false,
          }));
        })
        .catch(e => {
          setter(prev => ({
            ...prev,
            isLoading: false,
          }));
          Alert.alert('Somethig Went Wrong', e.message);
        });
      setter(prev => ({
        ...prev,
        emailError: '',
        passwordError: '',
        nameError: '',
        phoneError: '',
      }));
      return;
    }
    setter(prev => ({
      ...prev,
      emailError: prev.email == '' ? "Email Can't be Empty" : '',
      passwordError: prev.password == '' ? "Password Can't be Empty" : '',
      nameError: prev.userName == '' ? "name can't be empty" : '',
      phoneError: prev.userPhone == '' ? "Phone can't be empty" : '',
    }));
  };

  const onLoginClick = async () => {
    if (getter.email && getter.password) {
      setter(prev => ({
        ...prev,
        isLoading: true,
      }));
      await auth()
        .signInWithEmailAndPassword(getter.email, getter.password)
        .then(async Res => {
          const token = await messaging().getToken();
          const uid = auth().currentUser.uid;
          await usersCollection.doc(uid).update({
            fcmToken: token,
          });
          setter(prev => ({
            ...prev,
            isLoading: false,
          }));
        })
        .catch(e => {
          setter(prev => ({
            ...prev,
            isLoading: false,
          }));
          Alert.alert('Somethig Went Wrong', e.message);
        });
      setter(prev => ({
        ...prev,
        emailError: '',
        passwordError: '',
      }));
      return;
    }
    setter(prev => ({
      ...prev,
      emailError: prev.email == '' ? "Email Can't be Empty" : '',
      passwordError: prev.password == '' ? "Password Can't be Empty" : '',
    }));
  };
  useEffect(() => {
    setter(prev => ({
      ...prev,
      email: '',
      password: '',
      emailError: '',
      userName: '',
      userPhone: '',
      passwordError: '',
      nameError: '',
      phoneError: '',
    }));
  }, [getter.login, getter.signUp]);

  const ErrorCode = props => (
    <Text style={{color: 'red', fontSize: 14}}>{props.messsage}</Text>
  );

  return (
    <SafeAreaView style={{flex: 1}}>
      <View style={{flex: 1, paddingHorizontal: 20, justifyContent: 'center'}}>
        {getter.signUp ? (
          <React.Fragment>
            <View>
              <TextInput
                keyboardType="numeric"
                maxLength={10}
                error={getter.phoneError ? true : false}
                placeholder="Phone Number"
                defaultValue={getter.userPhone}
                style={{paddingHorizontal: 10, height: 50, marginVertical: 10}}
                onChangeText={e => {
                  setter(prev => ({...prev, userPhone: e}));
                }}></TextInput>
              {getter.phoneError != '' ? (
                <ErrorCode messsage={getter.phoneError} />
              ) : null}
            </View>
            <View>
              <TextInput
                error={getter.nameError ? true : false}
                placeholder="Enter Name"
                defaultValue={getter.userName}
                style={{paddingHorizontal: 10, height: 50, marginVertical: 10}}
                onChangeText={e => {
                  setter(prev => ({...prev, userName: e}));
                }}></TextInput>
              {getter.nameError != '' ? (
                <ErrorCode messsage={getter.nameError} />
              ) : null}
            </View>
            <View>
              <TextInput
                error={getter.emailError ? true : false}
                placeholder="Enter Email"
                defaultValue={getter.email}
                style={{paddingHorizontal: 10, height: 50, marginVertical: 10}}
                onChangeText={e => {
                  setter(prev => ({...prev, email: e}));
                }}></TextInput>
              {getter.emailError != '' ? (
                <ErrorCode messsage={getter.emailError} />
              ) : null}
            </View>
            <View>
              <TextInput
                error={getter.passwordError ? true : false}
                underlineColorAndroid={'transparent'}
                style={{paddingHorizontal: 10, height: 50, marginVertical: 10}}
                secureTextEntry={getter.isVisible ? false : true}
                placeholder="Enter Password"
                defaultValue={getter.password}
                onChangeText={e => {
                  setter(prev => ({...prev, password: e}));
                }}></TextInput>
              {getter.passwordError != '' && (
                <ErrorCode messsage={getter.passwordError} />
              )}
            </View>

            <Button
              style={{
                alignSelf: 'center',
                marginVertical: 10,
              }}
              contentStyle={{
                width: 100,
                alignSelf: 'center',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: 'tomato',
              }}
              mode="text"
              onPress={onSingUp}
              disabled={getter.isLoading ? true : false}
              loading={getter.isLoading ? true : false}>
              <Text style={{color: 'white'}}>SignUp</Text>
            </Button>
          </React.Fragment>
        ) : (
          <React.Fragment>
            <View>
              <TextInput
                error={getter.emailError ? true : false}
                placeholder="Enter Email"
                defaultValue={getter.email}
                style={{paddingHorizontal: 10, height: 50, marginVertical: 10}}
                onChangeText={e => {
                  setter(prev => ({...prev, email: e}));
                }}></TextInput>
              {getter.emailError != '' ? (
                <ErrorCode messsage={getter.emailError} />
              ) : null}
            </View>
            <View>
              <TextInput
                error={getter.passwordError ? true : false}
                underlineColorAndroid={'transparent'}
                style={{paddingHorizontal: 10, height: 50, marginVertical: 10}}
                secureTextEntry={getter.isVisible ? false : true}
                placeholder="Enter Password"
                defaultValue={getter.password}
                onChangeText={e => {
                  setter(prev => ({...prev, password: e}));
                }}></TextInput>
              {getter.passwordError != '' && (
                <ErrorCode messsage={getter.passwordError} />
              )}
            </View>
            <Button
              style={{
                alignSelf: 'center',
                marginVertical: 10,
              }}
              contentStyle={{
                width: 100,
                alignSelf: 'center',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: 'tomato',
              }}
              mode="text"
              onPress={onLoginClick}
              disabled={getter.isLoading ? true : false}
              loading={getter.isLoading ? true : false}>
              <Text style={{color: 'white'}}>Login</Text>
            </Button>
          </React.Fragment>
        )}
        {getter.signUp ? (
          <Pressable
            style={{
              alignSelf: 'center',
            }}
            onPress={() => {
              setter(prev => ({
                ...prev,
                signUp: !prev.signUp,
              }));
            }}>
            <Text>
              Already have an account
              <Text style={{color: 'tomato', fontWeight: 'bold'}}>
                {' '}
                Login Here!
              </Text>
            </Text>
          </Pressable>
        ) : (
          <Pressable
            style={{
              alignSelf: 'center',
            }}
            onPress={() => {
              setter(prev => ({
                ...prev,
                signUp: !prev.signUp,
              }));
            }}>
            <Text>
              Not have an account
              <Text style={{color: 'tomato', fontWeight: 'bold'}}>
                {' '}
                Signup Here!
              </Text>
            </Text>
          </Pressable>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({});
