import axios from 'axios';
import { appAxios } from '../apiConfig';
import { setUser } from '../reducers/userSlice';
import { CHECK_USERNAME, REGISTER } from '../API';
import { token_storage } from '../storage';
import { resetAndNavigate } from '../../utils/NavigationUtil';
import { showToast } from '../../utils/ToastMessage';

interface registerData {
  id_token: string;
  provider: string;
  name: string;
  email: string;
  userImage: string;
  token_type?: string;
  nonce?: string;
}

export const refetchUser = () => async (dispatch: any) => {
  try {
    const res = await appAxios.get('/user/profile');
    await dispatch(setUser(res.data.user));
  } catch (error) {
    console.log('Refetch user ', error);
  }
};

export const register = (data: registerData) => async (dispatch: any) => {
  try {
    const res = await axios.post(REGISTER, data);
    token_storage.set('access_token', res.data.tokens.access_token);
    token_storage.set('refresh_token', res.data.tokens.refresh_token);
    await dispatch(setUser(res.data.user));
    resetAndNavigate('BottomTab');
  } catch (error: any) {
    showToast('error', 'Error, try again');
    console.log('Register error ->', error);
  }
};

export const checkUserNameAvailability =
  (username: string) => async (dispatch: any) => {
    try {
      const res = await axios.post(CHECK_USERNAME, {
        username,
      });
      return res.data.available;
    } catch (error: any) {
      console.log('export const checkUserNameAvailability error', error);
      return null;
    }
  };
