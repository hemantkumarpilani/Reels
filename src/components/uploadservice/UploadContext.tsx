import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from 'react';
import {
  Animated,
  Easing,
  Image,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useAppDispatch } from '../../redux/reduxHook';
import { uploadFile } from '../../redux/actions/fileAction';
import { createReel } from '../../redux/actions/reelAction';
import { Colors } from '../../constants/Colors';
import { showToast } from '../../utils/ToastMessage';
import RNFS from 'react-native-fs';

interface UploadContextType {
  isUpload: boolean;
  loadingMessage: string | null;
  uploading: boolean;
  uploadProgress: number;
  startUpload: (thumb_uri: string, file_uri: string, caption: string) => void;
  uploadAnimation: Animated.Value;
  showUpload: (value: boolean) => void;
  thumbnailUri: string;
}

const defaultContext: UploadContextType = {
  isUpload: false,
  loadingMessage: null,
  uploadProgress: 0,
  startUpload: () => {},
  uploading: false,
  showUpload: () => {},
  uploadAnimation: new Animated.Value(0),
  thumbnailUri: '',
};

const UploadContext = createContext<UploadContextType>(defaultContext);

export const UploadProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [isUpload, showUpload] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [loadingMessage, setLoadingMessage] = useState<string | null>(null);
  const [uploadAnimation] = useState<Animated.Value>(new Animated.Value(0));
  const [thumbnailUri, setThumbnailUri] = useState<string>('');
  const [uploading, setUploading] = useState<boolean>(false);

  const dispatch = useAppDispatch();

  const startUpload = async (
    thumb_uri: string,
    file_uri: string,
    caption: string,
  ) => {
    Animated.timing(uploadAnimation, {
      toValue: 1,
      duration: 500,
      easing: Easing.inOut(Easing.ease),
      useNativeDriver: true,
    }).start();
    setUploadProgress(0);
    setThumbnailUri(thumb_uri);
    setUploading(true);
    setLoadingMessage('Uploading thumbnail...🚀');
    showUpload(true);

    // const base64 = thumb_uri?.thumbnailBase64;

    // if (!base64) {
    //   throw new Error('Thumbnail Base64 not found');
    // }

    // Remove data:image/... prefix if CameraRoll returns one
    const cleanBase64 = thumb_uri.replace(/^data:image\/[a-zA-Z]+;base64,/, '');

    const thumbnailPath = `${
      RNFS.CachesDirectoryPath
    }/reel_thumbnail_${Date.now()}.jpg`;

    await RNFS.writeFile(thumbnailPath, cleanBase64, 'base64');

    const thumbnailFileUri = `file://${thumbnailPath}`;

    const thumbnailResponse = await dispatch(
      uploadFile(
        Platform.OS === 'ios' ? thumbnailFileUri : thumb_uri,
        'reel_thumbnail',
      ),
    );
    setUploadProgress(30);
    setLoadingMessage('Uploading video...📹');
    const videoResponse = await dispatch(uploadFile(file_uri, 'reel_video'));
    setUploadProgress(70);
    setLoadingMessage('Finishing upload...✨');
    const data = {
      videoUri: videoResponse,
      thumbUri: thumbnailResponse,
      caption: caption,
    };

    await dispatch(createReel(data));

    setUploading(false);
    setUploadProgress(100);
    await setTimeout(() => {
      Animated.timing(uploadAnimation, {
        toValue: 0,
        duration: 500,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: true,
      }).start(() => showUpload(false));
    }, 5000);
  };

  return (
    <UploadContext.Provider
      value={{
        isUpload,
        loadingMessage,
        startUpload,
        uploadAnimation,
        thumbnailUri,
        uploadProgress,
        uploading,
        showUpload(value) {},
      }}
    >
      {children}
      <UploadProgress />
    </UploadContext.Provider>
  );
};

export const useUpload = () => useContext(UploadContext);

const UploadProgress: React.FC = () => {
  const {
    isUpload,
    loadingMessage,
    showUpload,
    startUpload,
    thumbnailUri,
    uploadAnimation,
    uploadProgress,
    uploading,
  } = useUpload();

  useEffect(() => {
    if (!isUpload) {
      Animated.timing(uploadAnimation, {
        toValue: 0,
        duration: 500,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: true,
      }).start();
    }
  }, [isUpload]);

  if (!isUpload) {
    return null;
  }

  const translateY = uploadAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [100, 0],
  });

  return (
    <Animated.View style={[styles.toast, { transform: [{ translateY }] }]}>
      <TouchableOpacity
        style={styles.content}
        disabled={uploading}
        onPress={() => {
          uploading ? showToast('info', 'Chill bro !, uploading') : null;
        }}
      >
        <Image source={{ uri: thumbnailUri }} style={styles.thumbnail} />
        <View style={styles.textContainer}>
          <Text style={styles.toastText}>
            {uploading ? `${loadingMessage}` : 'Upload completed'}
          </Text>
          {!uploading && (
            <TouchableOpacity
              onPress={() => {
                showUpload(false);
              }}
            >
              <Text style={styles.viewText}>View</Text>
            </TouchableOpacity>
          )}
        </View>
      </TouchableOpacity>

      {uploading && (
        <View style={styles.progressBarContainer}>
          <View style={[styles.progressBar, { width: `${uploadProgress}%` }]} />
        </View>
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  toast: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 20 : 10,
    left: 0,
    right: 0,
    marginHorizontal: 10,
    backgroundColor: '#0f141c',
    padding: 10,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 0.6,
    borderColor: Colors.border,
  },
  progressBarContainer: {
    height: 4,
    width: '100%',
    backgroundColor: '#555',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: Colors.theme,
  },
  thumbnail: {
    width: 40,
    height: 40,
    borderRadius: 4,
    marginRight: 10,
  },
  textContainer: {
    flex: 1,
  },
  toastText: {
    color: 'white',
  },
  viewText: {
    color: 'white',
    fontSize: 14,
    textDecorationLine: 'underline',
  },
});
