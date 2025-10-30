import Header from '../../components/header';
import { Tabs } from 'expo-router';
import React from 'react';
import { Image, View } from 'react-native';

const ICON_HOME = require('../../assets/images/bott_home.png');
const ICON_HOME_FOCUSED = require('../../assets/images/bott_home_choose.png');
const ICON_STATS = require('../../assets/images/bott_stats.png');
const ICON_STATS_FOCUSED = require('../../assets/images/bott_stats_choose.png');
const ICON_CONTENT = require('../../assets/images/bott_content.png');
const ICON_CONTENT_FOCUSED = require('../../assets/images/bott_content_choose.png');
const ICON_CHAT = require('../../assets/images/bott_chat.png');
const ICON_CHAT_FOCUSED = require('../../assets/images/bott_chat_choose.png');

const makeTabIcon =
  (normal: any, focusedImg: any) =>
  ({ focused }: { focused: boolean }) => (
    <View
      style={{
        alignItems: 'center',
        justifyContent: 'flex-start',
        width: 80,    
      }}
    >
      <View
        style={{
          height: 4,
          width: 60,
          borderRadius: 2,
          backgroundColor: focused ? '#000' : 'transparent', 
          marginBottom: 6,
        }}
      />
      <Image
        source={focused ? focusedImg : normal}
        style={{ width: 35, height: 35, resizeMode: 'contain' }}
      />
    </View>
  );

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: true,
        header: () => <Header />,
        tabBarShowLabel: false,
        tabBarStyle: {
          height: 80,     
          paddingTop: 1,
          borderTopColor: 'transparent',
        },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          tabBarIcon: makeTabIcon(ICON_HOME, ICON_HOME_FOCUSED),
        }}
      />
      <Tabs.Screen
        name="stats"
        options={{
          tabBarIcon: makeTabIcon(ICON_STATS, ICON_STATS_FOCUSED),
        }}
      />
      <Tabs.Screen
        name="content"
        options={{
          tabBarIcon: makeTabIcon(ICON_CONTENT, ICON_CONTENT_FOCUSED),
        }}
      />
      <Tabs.Screen
        name="chat"
        options={{
          tabBarIcon: makeTabIcon(ICON_CHAT, ICON_CHAT_FOCUSED),
        }}
      />
    </Tabs>
  );
}
