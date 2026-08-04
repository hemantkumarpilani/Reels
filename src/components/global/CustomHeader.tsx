import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import React, { FC } from 'react';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { goBack } from '../../utils/NavigationUtil';
import { Colors } from '../../constants/Colors';
import { RFValue } from 'react-native-responsive-fontsize';
import CustomText from './CustomText';

interface HeaderProps {
  title: string;
  onInfoPress?: () => void;
}

const CustomHeader: FC<HeaderProps> = ({ title, onInfoPress }) => {
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        margin: 5,
      }}
    >
      <TouchableOpacity onPress={() => goBack()}>
        <Icon
          name="keyboard-backspace"
          color={Colors.text}
          size={RFValue(20)}
        />
      </TouchableOpacity>
      <CustomText variant="h4">{title}</CustomText>
      <TouchableOpacity onPress={onInfoPress}>
        <Icon
          name="information-outline"
          color={Colors.text}
          size={RFValue(20)}
        />
      </TouchableOpacity>
    </View>
  );
};

export default CustomHeader;

const styles = StyleSheet.create({});
