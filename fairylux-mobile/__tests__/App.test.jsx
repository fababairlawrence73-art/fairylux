/**
 * @format
 */

import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import {Text, TextInput, TouchableOpacity} from 'react-native';
import {onAuthStateChanged, signInWithEmailAndPassword} from '@react-native-firebase/auth';
import App from '../App';

// Native services are boundaries of this auth-shell test; no live Firebase calls.
jest.mock('@react-native-firebase/auth', () => {
  const auth = {};
  return {
    getAuth: () => auth,
    onAuthStateChanged: jest.fn(() => jest.fn()),
    signInWithEmailAndPassword: jest.fn(),
  };
});
jest.mock('@react-native-firebase/firestore', () => {
  const db = {};
  return {getFirestore: () => db};
});
jest.mock('@react-native-google-signin/google-signin', () => ({
  GoogleSignin: {configure: jest.fn()},
  statusCodes: {},
}));
jest.mock('@react-navigation/native', () => ({
  NavigationContainer: ({children}) => children,
  DefaultTheme: {colors: {}},
}));
jest.mock('../src/navigation/RootNavigator', () => ({RootNavigator: () => null}));
jest.mock('react-native-safe-area-context', () => {
  const mock = require('react-native-safe-area-context/jest/mock');
  return mock.default || mock;
});

test('shows the sign-in form after Firebase reports a signed-out session', async () => {
  let renderer;
  await ReactTestRenderer.act(() => {
    renderer = ReactTestRenderer.create(<App />);
  });
  await ReactTestRenderer.act(async () => {
    await onAuthStateChanged.mock.calls[0][1](null);
  });

  expect(renderer.root.findAllByType(Text).some(node => node.props.children === 'Customer Sign In')).toBe(true);
  const inputs = renderer.root.findAllByType(TextInput);
  await ReactTestRenderer.act(() => {
    inputs.find(node => node.props.placeholder === 'customer@example.com').props.onChangeText('classmate@example.com');
    inputs.find(node => node.props.placeholder === 'Enter your password').props.onChangeText('example-password');
  });
  const signIn = renderer.root.findAllByType(TouchableOpacity).find(node =>
    node.findAllByType(Text).some(label => label.props.children === 'Sign In'),
  );
  await ReactTestRenderer.act(async () => {
    await signIn.props.onPress();
  });
  expect(signInWithEmailAndPassword).toHaveBeenCalledWith(expect.any(Object), 'classmate@example.com', 'example-password');
  await ReactTestRenderer.act(() => renderer.unmount());
});
