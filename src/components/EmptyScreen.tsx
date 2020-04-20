import React from 'react';
import {SafeAreaView, useColorScheme} from 'react-native';
import EmptyList from './EmptyList';
import Colors from '../constants/Colors';

const EmptyScreen: React.FC = () => {
  const colorScheme = useColorScheme();

  return (
    <SafeAreaView
      style={{
        backgroundColor: Colors.system('background', colorScheme),
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
      }}>
      <EmptyList />
    </SafeAreaView>
  );
};

export default EmptyScreen;
