import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { DateData } from 'react-native-calendars';

type Ledger = Record<string, { income?: number; expense?: number }>;

const dayLedger: Ledger = {
  '2025-10-08': { income: 620145, expense: 250000 },
  '2025-10-15': { income: 0, expense: 123000 },
};
type DayProps = {
  date: DateData;          
  state: 'disabled' | 'today' | ''; 
  onPress?: (date: DateData) => void;
};

const DayCell: React.FC<DayProps & { ledger: typeof dayLedger }> = ({ date, state, onPress,ledger,}) => {
  const rec = ledger[date.dateString] || {};
  const inc = rec.income ?? 0;
  const exp = rec.expense ?? 0;

  const incText = inc ? `+${inc.toLocaleString('ko-KR')}` : '';
  const expText = exp ? `-${Math.abs(exp).toLocaleString('ko-KR')}` : '';

  const disabled = state === 'disabled';

  return (
    <Pressable
      onPress={() => onPress?.(date)}
      disabled={disabled}
      style={[dayStyles.cell, disabled && { opacity: 0.35 }]}
      android_ripple={{ color: '#eee' }}
    >
      <Text style={[dayStyles.dayNumber, state === 'today' && dayStyles.today]}>
        {date.day}
      </Text>
      {incText ? (
        <Text style={dayStyles.income}>{incText}</Text>
      ) : (
        <View style={{ height: 16 }} />
      )}
      {expText ? (
        <Text style={dayStyles.expense}>{expText}</Text>
      ) : (
        <View style={{ height: 16 }} />
      )}
    </Pressable>
  );
};

const dayStyles = StyleSheet.create({
  cell: {
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: 4,
    paddingBottom: 2,
    minHeight: 68, 
  },
  dayNumber: {
    fontSize: 18,
    color: '#111',
    marginBottom: 2,
  },
  today: { fontWeight: '700' },
  income: { fontSize: 12, color: '#004DFF', lineHeight: 16 },
  expense: { fontSize: 12, color: '#FF0004', lineHeight: 16 },
});
export default DayCell; 