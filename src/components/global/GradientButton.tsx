import { FC } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { Colors } from '../../constants/Colors';
import LinearGradient from 'react-native-linear-gradient';
import CustomText from './CustomText';
import { FONTS } from '../../constants/Fonts';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { RFValue } from 'react-native-responsive-fontsize';

const GradientButton: FC<{
  text: string;
  iconName?: string;
  onPress?: () => void;
}> = ({ text, iconName, onPress }) => {
  return (
    <TouchableOpacity
      style={styles.gradientButtonContainer}
      activeOpacity={0.4}
      onPress={onPress}
    >
      <LinearGradient
        colors={['#333', '#444', '#555', '#444', '#333']}
        // insta gradient
        //   colors={['#f09433', '#e6683c', '#dc2743', '#cc2366', '#bc1888']}
        start={{ x: 0, y: 0.5 }}
        end={{ x: 1, y: 0.5 }}
        style={styles.gradientButton}
      >
        <View style={styles.innerButton}>
          <CustomText
            variant="h8"
            style={styles.text}
            fontFamily={FONTS.Medium}
          >
            {text}
          </CustomText>
        </View>
        <Icon
          name={iconName ? iconName : 'wallet-giftcard'}
          style={styles.icon}
          size={RFValue(16)}
        />
      </LinearGradient>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  gradientButtonContainer: {
    width: '70%',
    justifyContent: 'center',
    alignItems: 'center',
    margin: 20,
    overflow: 'hidden',
  },
  gradientButton: {
    borderRadius: 20,
    padding: 8,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  innerButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  text: {
    color: Colors.white,
    marginRight: 5,
  },
  icon: {
    color: Colors.white,
  },
  skeletonLoader: {
    ...StyleSheet.absoluteFill,
    borderRadius: 20,
  },
  gradient: {
    width: '70%',
    height: '100%',
  },
});

export default GradientButton;
