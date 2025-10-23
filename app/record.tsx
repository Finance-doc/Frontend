// app/record.tsx
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
 
export default function RecordScreen() {
  const { date } = useLocalSearchParams<{ date?: string }>();
  const router = useRouter();
  return (
    <View style={styles.container}>
      <TouchableOpacity activeOpacity={0.9} onPress={() => {router.replace('/home');}}>
        <Image
          source={require('../assets/images/ic_arrow_left_choose.png')}
          style={{ width: 30, height: 30, position: 'absolute' }}
          resizeMode="contain"
        />
      </TouchableOpacity>

      <Text style={{ fontSize: 18, fontWeight: '600' }}>
        선택한 날짜: {date ?? '없음'}
      </Text>
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 40,
    paddingBottom: 32,
  },
  backicon: {}
})
