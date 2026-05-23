import { View, Text, TextStyle, StyleSheet } from 'react-native';
import React, { FC } from 'react';
import { FONTS } from '../../constants/Fonts';
import { RFValue } from 'react-native-responsive-fontsize';
import { Colors } from '../../constants/Colors';

interface Props {
  variant?:
    | 'h1'
    | 'h2'
    | 'h3'
    | 'h4'
    | 'h5'
    | 'h6'
    | 'h7'
    | 'h8'
    | 'h9'
    | 'body';
  fontFamily?: FONTS;
  fontSize?: number;
  style?: TextStyle | TextStyle[];
  children: React.ReactNode;
  numberOfLines?: number;
  onLayout?: (event: object) => void;
  onMentionPress?: (mention: string) => void;
}

const CustomText: FC<Props> = ({
  variant = 'body',
  fontFamily = FONTS.Regular,
  fontSize,
  style,
  children,
  numberOfLines,
  onLayout,
  onMentionPress,
}) => {
  let computedFontSize: number;
  switch (variant) {
    case 'h1':
      computedFontSize = RFValue(fontSize || 22);
      break;
    case 'h2':
      computedFontSize = RFValue(fontSize || 20);
      break;
    case 'h3':
      computedFontSize = RFValue(fontSize || 18);
      break;
    case 'h4':
      computedFontSize = RFValue(fontSize || 16);
      break;
    case 'h5':
      computedFontSize = RFValue(fontSize || 14);
      break;
    case 'h6':
      computedFontSize = RFValue(fontSize || 12);
      break;
    case 'h7':
      computedFontSize = RFValue(fontSize || 12);
      break;
    case 'h8':
      computedFontSize = RFValue(fontSize || 10);
      break;
    case 'h9':
      computedFontSize = RFValue(fontSize || 9);
      break;
    default:
      computedFontSize = RFValue(fontSize || 12);
  }
  return (
    <View style={[styles.container, style]}>
      <Text
        onLayout={onLayout}
        numberOfLines={numberOfLines !== undefined ? numberOfLines : undefined}
        style={[
          styles.text,
          {
            color: Colors.text,
            fontSize: computedFontSize,
            fontFamily: fontFamily,
          },
          style,
        ]}
      >
        {children}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  text: {
    textAlign: 'left',
  },
  mention: {
    textAlign: 'left',
  },
});

export default CustomText;
