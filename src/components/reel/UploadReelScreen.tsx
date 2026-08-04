import {
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import React, { useState } from 'react';
import CustomSafeAreaView from '../global/CustomSafeAreaView';
import CustomHeader from '../global/CustomHeader';
import { useRoute } from '@react-navigation/native';
import { Colors } from '../../constants/Colors';
import { FONTS } from '../../constants/Fonts';
import GradientButton from '../global/GradientButton';
import { goBack } from '../../utils/NavigationUtil';
import { useUpload } from '../uploadservice/UploadContext';

interface uriData {
  thumb_uri: string;
  file_uri: string;
}

const UploadReelScreen = () => {
  const data = useRoute();
  const item = data?.params as uriData;
  console.log('UploadReelScreen', item);
  const [caption, setCaption] = useState<string>('');
  const cleanBase64 = item.thumb_uri
    .replace(/\r?\n|\r/g, '')
    .replace(/\s/g, '');

  const iosImageUri = cleanBase64.startsWith('data:image')
    ? cleanBase64
    : `data:image/jpeg;base64,${cleanBase64}`;

  const { startUpload } = useUpload();

  return (
    <CustomSafeAreaView>
      <CustomHeader title="Upload" />
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.flexDirectionRow}>
          <Image
            source={{
              uri: Platform.OS === 'ios' ? iosImageUri : item.thumb_uri,
            }}
            style={styles.img}
          />
          <TextInput
            style={[styles.input, styles.textArea]}
            value={caption}
            placeholderTextColor={Colors.border}
            onChangeText={setCaption}
            placeholder="Enter your caption here...."
            multiline={true}
            numberOfLines={8}
          />
        </View>

        <GradientButton
          text="Upload"
          iconName="upload"
          onPress={() => {
            goBack();
            startUpload(item.thumb_uri, item.file_uri, caption);
          }}
        />
      </ScrollView>
    </CustomSafeAreaView>
  );
};

export default UploadReelScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 5,
    paddingHorizontal: 0,
    marginTop: 30,
    alignItems: 'center',
  },
  img: {
    width: '25%',
    height: 150,
    resizeMode: 'cover',
    borderRadius: 10,
  },
  flexDirectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
  },
  textArea: {
    height: 150,
    textAlignVertical: 'top',
  },
  input: {
    height: 150,
    borderColor: 'grey',
    borderWidth: 1,
    color: Colors.text,
    borderRadius: 5,
    fontFamily: FONTS.Medium,
    padding: 10,
    marginVertical: 10,
    width: '68%',
  },
});
