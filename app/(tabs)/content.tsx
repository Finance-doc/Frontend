import { Colors } from '@/constants/colors';
import React from 'react';
import { StyleSheet, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function Content() {
  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <Text style={styles.title}>단어 검사실</Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.white,},
  title: { fontSize: 20, fontWeight: '900', textAlign: 'center', borderBottomWidth: StyleSheet.hairlineWidth, paddingTop:13, paddingBottom: 13,},
});
