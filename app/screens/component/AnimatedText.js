import {StyleSheet, Text, View, Animated, Easing} from 'react-native';
import React, {useEffect, useRef} from 'react';

const RingingText = Animated.createAnimatedComponent(Text);

export default function AnimatedText({textValue}) {
  const textRef_1 = useRef(new Animated.Value(0)).current;
  const useTextRef = useRef(
    Animated.loop(
      Animated.sequence([
        Animated.timing(textRef_1, {
          toValue: 10,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(textRef_1, {
          toValue: 0,
          duration: 800,
          useNativeDriver: true,
        }),
      ]),
      {
        iterations: -1,
      },
    ),
  );
  useEffect(() => {
    if (useTextRef.current) {
      useTextRef.current.start();
    }
  }, []);

  return (
    <View
      style={{flexDirection: 'row', alignSelf: 'center', marginTop: '100%'}}>
      <Text
        style={{
          alignSelf: 'center',
          color: 'gray',
          fontSize: 20,
        }}>
        {textValue}
      </Text>
      <RingingText
        style={{
          alignSelf: 'center',
          color: 'gray',
          fontSize: 20,
          opacity: textRef_1,
        }}>
        ...
      </RingingText>
    </View>
  );
}

const styles = StyleSheet.create({});
