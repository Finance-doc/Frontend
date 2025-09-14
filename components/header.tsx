import { Colors } from '@/constants/colors';
import React from 'react';
import { Image, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const ICON_PROFILE = require('@/assets/images/ic_profile.png');

export default function Header() {
  return (
    <SafeAreaView edges={['top']} style={styles.safe}>
      <View style={styles.bar}>
        <TouchableOpacity style={styles.profileBtn} onPress={() => { }}>
          <Image source={ICON_PROFILE} style={styles.profileIcon} resizeMode="contain" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { backgroundColor: Colors.white },
  bar: {
    height: 48,
    paddingHorizontal: 20,
    alignItems: 'flex-end',
    justifyContent: 'center',
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  profileBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileIcon: { width: 28, height: 28 },
});
