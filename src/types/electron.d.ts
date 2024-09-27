interface IpcRendererAPI {
    on(channel: string, func: (...args: any[]) => void): () => void;
    once(channel: string, func: (...args: any[]) => void): void;
    removeListener(channel: string, func: (...args: any[]) => void): void;
    removeAllListeners(channel: string): void;
    send(channel: string, ...args: any[]): void;
    invoke(channel: string, ...args: any[]): Promise<any>;
  }
  
  declare global {
    interface Window {
      electron: {
        ipcRenderer: IpcRendererAPI;
      };
    }
  }
  
  export {};