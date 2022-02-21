// export interface electron {
//   'electron': () => {Promise<void>},
// }
import { DialogFileData } from './types';
declare global {
  interface Window {
    electron :{
      myPing : () => void;
      on:(channel : string, listener: (event: any, ...arg: any) => void) => void;
      once :(channel : string, listener: (event: any, ...arg: any) => void) => void;
      electronAPI : () => Promise<any>;
      openFile : () => Promise<DialogFileData>;
    };
  }
}
