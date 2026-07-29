import axios from 'axios';
import { UPLOAD } from '../API';
import { showToast } from '../../utils/ToastMessage';

export const uploadFile =
  (local_uri: string, mediaType: string) => async (dispatch: any) => {
    try {
      const formData = new FormData();
      formData.append('image', {
        uri: local_uri,
        name: 'profile.jpg',
        type: 'image/jpeg',
      } as any);

      formData.append('mediaType', mediaType);
      const res = await axios.post(UPLOAD, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      console.log('UPLOAD URL', UPLOAD);
      return res.data.mediaUrl;
    } catch (error: any) {
      console.log('UPLOAD URL', UPLOAD);
      console.log('Upload error', error);
      showToast('error', 'Upload error');
      return null;
    }
  };
