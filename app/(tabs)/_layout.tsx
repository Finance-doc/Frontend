import Header from '@/components/header';
import { Tabs } from 'expo-router';
import React from 'react';
import { Image } from 'react-native';

const ICON_HOME = require('../../assets/images/bott_home.png');
const ICON_HOME_FOCUSED = require('../../assets/images/bott_home_choose.png');
const ICON_STATS = require('../../assets/images/bott_stats.png');
const ICON_STATS_FOCUSED = require('../../assets/images/bott_stats_choose.png');
const ICON_CONTENT = require('../../assets/images/bott_content.png');
const ICON_CHAT = require('../../assets/images/bott_chat.png');
const ICON_CHAT_FOCUSED = require('../../assets/images/bott_chat_choose.png');

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: true, 
        header: () => <Header />, 
        tabBarShowLabel: false, 
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          tabBarIcon: ({ focused }) => (
            <Image
              source={focused ? ICON_HOME_FOCUSED : ICON_HOME}
              style={{ width: 35, height: 35, resizeMode: 'contain' }}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="stats"
        options={{
          tabBarIcon: ({ focused }) => (
            <Image
              source={focused ? ICON_STATS_FOCUSED : ICON_STATS}
              style={{ width: 35, height: 35, resizeMode: 'contain' }}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="content"
        options={{
          tabBarIcon: ({ focused }) => (
            <Image
              source={ICON_CONTENT}
              style={{ width: 35, height: 35, resizeMode: 'contain' }}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="chat"
        options={{
          tabBarIcon: ({ focused }) => (
            <Image
              source={focused ? ICON_CHAT_FOCUSED : ICON_CHAT}
              style={{ width: 35, height: 35, resizeMode: 'contain' }}
            />
          ),
        }}
      />
    </Tabs>
  );
}
