import { appAxios } from '../apiConfig';
import { refetchUser } from './userAction';

export const createReel = (data: any) => async (dispatch: any) => {
  try {
    const res = await appAxios.post('/reel', data);
    dispatch(refetchUser());
  } catch (error) {
    console.log('Reel create error', error);
  }
};
