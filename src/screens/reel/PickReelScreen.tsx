import {
  ActivityIndicator,
  FlatList,
  Image,
  Linking,
  PermissionsAndroid,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import React, { useEffect, useState } from 'react';
import CustomView from '../../components/global/CustomView';
import { SafeAreaView } from 'react-native-safe-area-context';
import CustomHeader from '../../components/global/CustomHeader';
import PickerReelButton from '../../components/reel/PickerReelButton';
import CustomText from '../../components/global/CustomText';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { RFValue } from 'react-native-responsive-fontsize';
import { Colors } from '../../constants/Colors';
import { showToast } from '../../utils/ToastMessage';
import { CameraRoll } from '@react-native-camera-roll/camera-roll';
import { FONTS } from '../../constants/Fonts';
import { screenHeight } from '../../utils/Scaling';
import { convertDurationToMMSS } from '../../utils/DateUtils';
import { createThumbnail } from 'react-native-create-thumbnail';
import { navigate } from '../../utils/NavigationUtil';

interface VideoProp {
  uri: string;
  playableDuration: number;
}

const useGallery = ({ pageSize = 30 }) => {
  const [videos, setVideos] = useState<VideoProp[]>([]);
  const [nextCursor, setNextCursor] = useState<string | undefined>(undefined);
  const [permissionNotGranted, setPermissionGranted] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingNextPage, setIsLoadingNextPage] = useState(false);
  const [hasNextPage, setHasNextPage] = useState(true);

  const loadNextPagePictures = async () => {
    if (!hasNextPage) {
      return;
    }

    try {
      setIsLoadingNextPage(true);
      const videoData = await CameraRoll.getPhotos({
        first: pageSize,
        after: nextCursor,
        assetType: 'Videos',
        include: [
          'playableDuration',
          'fileSize',
          'filename',
          'fileExtension',
          'imageSize',
        ],
      });

      const videoExtracted = videoData?.edges?.map(edge => ({
        uri: edge.node.image.uri,
        playableDuration: edge.node.image.playableDuration,
        filePath: edge.node.image.filepath,
        fileName: edge.node.image.filename,
        extension: edge.node.image.extension,
      }));

      console.log('videoExtracted', videoExtracted);

      setVideos(prev => [...prev, ...videoExtracted]);
      setNextCursor(videoData.page_info.end_cursor);
      setHasNextPage(videoData.page_info.has_next_page);
    } catch (error) {
      console.log('An error occured while fetching videos');
      showToast('error', 'An error occured while fetching videos');
    } finally {
      setIsLoadingNextPage(false);
    }
  };

  const hasAndroidPermission = async () => {
    if ((Platform.Version as number) >= 33) {
      const statuses = await PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES,
        PermissionsAndroid.PERMISSIONS.READ_MEDIA_VIDEO,
      ]);
      return (
        statuses[PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES] ===
          PermissionsAndroid.RESULTS.GRANTED &&
        statuses[PermissionsAndroid.PERMISSIONS.READ_MEDIA_VIDEO] ===
          PermissionsAndroid.RESULTS.GRANTED
      );
    } else {
      const status = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
      );
      return status === PermissionsAndroid.RESULTS.GRANTED;
    }
  };

  const fetchInitial = async () => {
    const hasPermission = await hasAndroidPermission();
    if (!hasPermission) {
      setPermissionGranted(true);
    } else {
      setIsLoading(true);
      await loadNextPagePictures();
      setIsLoading(false);
    }
  };

  const fetchVideos = async () => {
    setIsLoading(true);
    await loadNextPagePictures();
    setIsLoading(false);
  };

  useEffect(() => {
    if (Platform.OS === 'ios') {
      fetchVideos();
    } else {
      fetchInitial();
    }
  }, []);

  return {
    videos,
    loadNextPagePictures,
    isLoading,
    permissionNotGranted,
    isLoadingNextPage,
    hasNextPage,
  };
};

const PickReelScreen = () => {
  const {
    hasNextPage,
    isLoading,
    isLoadingNextPage,
    loadNextPagePictures,
    permissionNotGranted,
    videos,
  } = useGallery({ pageSize: 30 });

  const handleOpenSetting = () => {
    Linking.openSettings();
  };

  const handleVideoSelect = async (data: any) => {
    const { uri } = data;
    console.log('uri', uri);
    if (Platform.OS === 'android') {
      createThumbnail({
        url: uri || '',
        timeStamp: 100,
      }).then(response => {
        console.log('thumbnail generate response', response);
        navigate('UploadReelScreen', {
          thumb_uri: response.path,
          file_uri: uri,
        }).catch(err => {
          console.log('Thumbnail generation error', err);
        });
      });

      return;
    }

    // const fileData = await CameraRoll.iosGetImageDataById(uri);
    // createThumbnail({
    //   url: fileData?.node?.image?.filepath || '',
    //   timeStamp: 100,
    // })
    //   .then(response => {
    //     console.log('create thumbnail ios response', response);
    //     navigate('UploadReelScreen', {
    //       thumb_uri: response.path,
    //       file_uri: uri,
    //     });
    //   })
    //   .catch(err => {
    //     console.log('Thumbnail generation error ios', err);
    //   });

    try {
      const thumbnail = await CameraRoll.getPhotoThumbnail(uri, {
        allowNetworkAccess: true,
        targetSize: {
          width: 0,
          height: 0,
        },
        quality: 1,
      });

      const thumbnailUri = thumbnail.thumbnailBase64;
      navigate('UploadReelScreen', {
        thumb_uri: thumbnailUri,
        file_uri: uri,
      });
    } catch (error) {
      console.log('Thumbnail generation error ios', error);
    }

    // try {
    //   const thumbnail = await CameraRoll.getPhotoThumbnail(uri, {
    //     allowNetworkAccess: true,
    //     targetSize: {
    //       width: 500,
    //       height: 500,
    //     },
    //     quality: 1,
    //   });

    //   const base64 = thumbnail.thumbnailBase64;

    //   if (!base64) {
    //     throw new Error('Thumbnail Base64 not found');
    //   }

    //   // Remove data:image/... prefix if CameraRoll returns one
    //   const cleanBase64 = base64.replace(/^data:image\/[a-zA-Z]+;base64,/, '');

    //   const thumbnailPath = `${
    //     RNFS.CachesDirectoryPath
    //   }/reel_thumbnail_${Date.now()}.jpg`;

    //   await RNFS.writeFile(thumbnailPath, cleanBase64, 'base64');

    //   const thumbnailFileUri = `file://${thumbnailPath}`;

    //   console.log('Thumbnail file:', thumbnailFileUri);

    //   navigate('UploadReelScreen', {
    //     thumb_uri: thumbnailFileUri,
    //     file_uri: uri,
    //   });
    // } catch (error) {
    //   console.log('Thumbnail generation error ios:', error);
    // }
  };

  const renderItem = ({ item }: { item: VideoProp }) => {
    return (
      <TouchableOpacity
        style={styles.videoItem}
        onPress={() => {
          handleVideoSelect(item);
        }}
      >
        <Image source={{ uri: item.uri }} style={styles.thumbnail} />
        <CustomText
          variant="h8"
          fontFamily={FONTS.SemiBold}
          style={styles.time}
        >
          {convertDurationToMMSS(item.playableDuration)}
        </CustomText>
      </TouchableOpacity>
    );
  };

  const renderFooter = () => {
    if (!isLoadingNextPage) return null;
    return <ActivityIndicator size={'small'} color={Colors.theme} />;
  };
  return (
    <CustomView>
      <SafeAreaView style={styles.margin}>
        <CustomHeader title="New Reel" />
      </SafeAreaView>
      <View>
        <PickerReelButton />
        <View style={styles.flexRow}>
          <CustomText>Recent</CustomText>
          <Icon name="chevron-down" size={RFValue(20)} color={Colors.white} />
        </View>
      </View>

      {permissionNotGranted ? (
        <View style={styles.permissionDeniedContainer}>
          <CustomText variant="h6" fontFamily={FONTS.Medium}>
            We need permission to access your gallery. Grant and reopen app
          </CustomText>
          <TouchableOpacity onPress={handleOpenSetting}>
            <CustomText
              variant="h6"
              fontFamily={FONTS.Medium}
              style={styles.permissionButton}
            >
              Open settings
            </CustomText>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          {isLoading ? (
            <ActivityIndicator size={'small'} color={Colors.white} />
          ) : (
            <FlatList
              data={videos}
              renderItem={renderItem}
              keyExtractor={(item, index) => index.toString()}
              numColumns={3}
              onEndReached={loadNextPagePictures}
              onEndReachedThreshold={0.5}
              ListFooterComponent={renderFooter}
            />
          )}
        </>
      )}
    </CustomView>
  );
};

export default PickReelScreen;

const styles = StyleSheet.create({
  margin: {
    margin: 10,
  },
  flexRow: {
    gap: 6,
    margin: 8,
    marginTop: 20,
    alignItems: 'center',
    flexDirection: 'row',
  },
  permissionDeniedContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    alignContent: 'center',
    padding: 16,
  },
  permissionButton: {
    marginTop: 15,
    color: Colors.theme,
  },
  thumbnail: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  videoItem: {
    width: '33%',
    height: screenHeight * 0.28,
    overflow: 'hidden',
    margin: 2,
  },
  time: {
    position: 'absolute',
    backgroundColor: 'rgba(0,0,0,0.2)',
    bottom: 3,
    right: 3,
  },
});
