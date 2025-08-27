declare module 'react-native-vector-icons/*' {
  import { Component } from 'react';
  import { TextStyle, ViewStyle, ImageStyle } from 'react-native';

  export interface IconProps {
    name: string;
    size?: number;
    color?: string;
    style?: TextStyle | ViewStyle | ImageStyle | Array<TextStyle | ViewStyle | ImageStyle>;
  }

  export default class Icon extends Component<IconProps> {}
}
