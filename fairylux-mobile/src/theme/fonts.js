import { Platform } from 'react-native';

export const fonts = {
  regular: Platform.select({ ios: 'Poppins-Regular', android: 'Poppins-Regular', default: 'Poppins-Regular' }),
  medium: Platform.select({ ios: 'Poppins-Medium', android: 'Poppins-Medium', default: 'Poppins-Medium' }),
  semiBold: Platform.select({ ios: 'Poppins-SemiBold', android: 'Poppins-SemiBold', default: 'Poppins-SemiBold' }),
  bold: Platform.select({ ios: 'Poppins-Bold', android: 'Poppins-Bold', default: 'Poppins-Bold' }),
};

export default fonts;
