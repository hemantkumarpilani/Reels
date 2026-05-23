import {
  createNavigationContainerRef,
  CommonActions,
  StackActions,
} from '@react-navigation/native';

export const navigationRef = createNavigationContainerRef();

export const navigate = async (routeName: string, params?: object) => {
  await navigationRef.isReady();
  if (navigationRef.isReady()) {
    navigationRef.dispatch(CommonActions.navigate(routeName, params));
  }
};

export const resetAndNavigate = async (routeName: string) => {
  await navigationRef.isReady();
  if (navigationRef.isReady()) {
    navigationRef.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name: routeName }],
      }),
    );
  }
};

export const push = async (routeName: string, params?: object) => {
  await navigationRef.isReady();
  if (navigationRef.isReady()) {
    navigationRef.dispatch(StackActions.push(routeName, params));
  }
};

export const prepareNavigation = async (routeName: string, params?: object) => {
  await navigationRef.isReady();
};
