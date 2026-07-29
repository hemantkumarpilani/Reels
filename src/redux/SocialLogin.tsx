import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { navigate, resetAndNavigate } from '../utils/NavigationUtil';
import { showToast } from '../utils/ToastMessage';
import { setUser } from './reducers/userSlice';
import { token_storage } from './storage';
import axios from 'axios';
import { LOGIN } from './API';
import {
  LoginManager,
  AccessToken,
  GraphRequest,
  GraphRequestManager,
  Settings,
  AuthenticationToken,
} from 'react-native-fbsdk-next';
import { requestTrackingPermission } from 'react-native-tracking-transparency';
import { jwtDecode } from 'jwt-decode';
import { Platform } from 'react-native';

interface RegisterData {
  id_token: string;
  provider: string;
  name: string;
  email: string;
  userImage: string;
}

const handleSignInSuccess = async (res: any, dispatch: any) => {
  token_storage.set('access_token', res.data.tokens.access_token);
  token_storage.set('refresh_token', res.data.tokens.refresh_token);
  await dispatch(setUser(res.data.user));
  resetAndNavigate('BottomTab');
};

const handleSignInError = (error: any, data: RegisterData) => {
  if (error?.response?.status === 401) {
    navigate('RegisterScreen', {
      ...data,
    });
    return;
  }
  console.log('handleSignInError', error);
  showToast('error', 'We are facing issues, try again later');
};

export const signInWithGoogle = () => async (dispatch: any) => {
  console.log('signInWithGoogle');
  try {
    await GoogleSignin.hasPlayServices();
    await GoogleSignin.signOut();

    const { data, type } = await GoogleSignin.signIn();
    console.log('signInWithGoogle', data);
    await axios
      .post(LOGIN, {
        provider: 'google',
        id_token: data?.idToken,
      })
      .then(async res => {
        await handleSignInSuccess(res, dispatch);
      })
      .catch((err: any) => {
        const errorData = {
          email: data?.user.email,
          name: data?.user.name,
          userImage: data?.user.photo,
          provider: 'google',
          id_token: data?.idToken,
        };
        handleSignInError(err, errorData as RegisterData);
      });
  } catch (error) {
    console.log('GOGGLE ERROR', error);
  }
};

// export const signInWithFacebook = () => async (dispatch: any) => {
//   const trackingStatus = await requestTrackingPermission();
//   const useClassicLogin = trackingStatus === 'authorized';

//   LoginManager.logOut();
//   Settings.initializeSDK();
//   LoginManager.logInWithPermissions(
//     ['public_profile', 'email'],
//     useClassicLogin ? 'enabled' : 'limited',

//     // 'limited',
//   ).then(
//     result => {
//       if (result.isCancelled) {
//       } else {
//         AccessToken.getCurrentAccessToken().then(async (data: any) => {
//           const auth = await AuthenticationToken.getAuthenticationTokenIOS();

//           // console.log(data.applicationID);

//           console.log('ACCESS TOKEN');
//           console.log(data);

//           console.log('AUTH TOKEN');
//           console.log(auth);

//           console.log(
//             'Facebook AccessToken object:',
//             JSON.stringify(data, null, 2),
//           );
//           console.log('Access Token:', data?.accessToken);
//           console.log('Auth Token:', auth?.authenticationToken);

//           try {
//             // const url = `https://graph.facebook.com/v20.0/me?fields=id,name,email&access_token=${encodeURIComponent(
//             //   data.accessToken,
//             // )}`;
//             // console.log('hemantt ', url);

//             const graph = await axios.get(
//               `https://graph.facebook.com/me?fields=id,name,email&access_token=${data?.accessToken}`,
//             );

//             // const graph = await axios.get(
//             //   `https://graph.facebook.com/me?fields=id,name,email&access_token=${auth?.authenticationToken}`,
//             // );

//             // const graph = await axios.get(url);

//             console.log('GRAPH SUCCESS');
//             console.log(graph.data);
//           } catch (e: any) {
//             console.log('GRAPH FAILED');
//             console.log(e.response?.data);
//           }

//           const infoRequest = new GraphRequest(
//             '/me?fields=name,picture,email',
//             undefined,
//             async (err: any, result: any) => {
//               if (err) {
//                 showToast('error', 'Facebook error');
//               }
//               console.log('Facebool error', result.err);

//               await axios
//                 .post(LOGIN, {
//                   provider: 'facebook',
//                   id_token: data?.accessToken,
//                   // id_token: auth?.authenticationToken,
//                 })
//                 .then(async res => {
//                   await handleSignInSuccess(res, dispatch);
//                 })
//                 .catch((err: any) => {
//                   const errorData = {
//                     email: result.email,
//                     name: result.name,
//                     userImage: result?.picture?.data?.url,
//                     provider: 'facebook',
//                     id_token: data?.accessToken,
//                   };
//                   handleSignInError(err, errorData);
//                 });
//             },
//           );

//           new GraphRequestManager().addRequest(infoRequest).start();
//         });
//       }
//     },
//     error => {
//       console.log('FB Error', error);
//     },
//   );
// };
export const signInWithFacebook = () => async (dispatch: any) => {
  try {
    const trackingStatus = await requestTrackingPermission();
    const useClassicLogin = trackingStatus === 'authorized';
    console.log('useClassicLogin', trackingStatus, typeof useClassicLogin);

    LoginManager.logOut();
    Settings.initializeSDK();

    const result = await LoginManager.logInWithPermissions(
      ['public_profile', 'email'],
      useClassicLogin ? 'enabled' : 'limited',
    );

    if (result.isCancelled) return;

    if (
      Platform.OS === 'android' ||
      trackingStatus === 'denied' ||
      trackingStatus === 'unavailable'
    ) {
      console.log('iffff');
      const data: any = await AccessToken.getCurrentAccessToken();
      const graph = await axios.get(
        `https://graph.facebook.com/me?fields=id,name,email,picture&access_token=${data?.accessToken}`,
      );
      await axios
        .post(LOGIN, {
          provider: 'facebook',
          id_token: data?.accessToken,
          token_type: 'access_token',
        })
        .then(res => handleSignInSuccess(res, dispatch))
        .catch(err =>
          handleSignInError(err, {
            email: graph.data.email,
            name: graph.data.name,
            userImage: graph.data.picture?.data?.url,
            provider: 'facebook',
            id_token: data?.accessToken,
          } as any),
        );
    } else {
      console.log('elseee');
      const auth: any = await AuthenticationToken.getAuthenticationTokenIOS();
      if (!auth?.authenticationToken) {
        showToast('error', 'Facebook login failed');
        return;
      }
      const decoded: any = jwtDecode(auth.authenticationToken);
      await axios
        .post(LOGIN, {
          provider: 'facebook',
          id_token: auth.authenticationToken,
          token_type: 'id_token',
        })
        .then(res => handleSignInSuccess(res, dispatch))
        .catch(err =>
          handleSignInError(err, {
            email: decoded.email,
            name: decoded.name,
            userImage: decoded.picture,
            provider: 'facebook',
            id_token: auth.authenticationToken,
          } as any),
        );
    }
  } catch (error) {
    console.log('FB Error', error);
    showToast('error', 'Facebook login failed');
  }
};
