declare module "react-native-svg" {
  import * as React from "react";
  import { ViewProps } from "react-native";

  export interface SvgProps extends ViewProps {
    width?: number | string;
    height?: number | string;
    viewBox?: string;
  }

  export default class Svg extends React.Component<SvgProps> {}

  export class G extends React.Component<any> {}
  export class Path extends React.Component<any> {}
  export class Line extends React.Component<any> {}
  export class Text extends React.Component<any> {}
  export class Circle extends React.Component<any> {}
  export class Rect extends React.Component<any> {}

}
