// Type declarations for fingerprintjs2
declare module 'fingerprintjs2' {
  interface Component {
    key: string;
    value: any;
  }

  interface Options {
    excludes?: {
      [key: string]: boolean;
    };
  }

  namespace Fingerprint2 {
    function get(callback: (components: Component[]) => void): void;
    function get(options: Options, callback: (components: Component[]) => void): void;
    function x64hash128(value: string, seed: number): string;
  }

  export = Fingerprint2;
}
