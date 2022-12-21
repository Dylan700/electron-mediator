import { contextBridge, ipcMain, IpcMainEvent, ipcRenderer, IpcRendererEvent } from "electron";
import { IpcRequest } from "../renderer";

class MainMediator {
	private channels: IpcChannel<any, any>[] = [];

	public registerChannel(channel: IpcChannel<any, any>){
		this.channels.push(channel);
		this.initChannel(channel);
	}

	public registerChannels(...channels: IpcChannel<any, any>[]){
		this.channels.push(...channels);
		channels.forEach((c: IpcChannel<any, any>) => this.initChannel(c));
	}

	private initChannel(channel: IpcChannel<any, any>){
		ipcMain.on(channel.getName(), (e: IpcMainEvent, request: IpcRequest<any>) => e.sender.send(channel.getName(), channel.handle(e, request)));
	}
}

export const initPreload = (...channels: string[]) => {
	var mediatorAPI: any = {};
	channels.forEach((channel: string) => {
		mediatorAPI[`send_${channel}` as keyof typeof mediatorAPI] = (data: any) => {
			ipcRenderer.send(channel, data);
		}
		mediatorAPI[`receive_${channel}` as keyof typeof mediatorAPI] = (handler: any) => {
			ipcRenderer.once(channel, (event: IpcRendererEvent, ...response: any) => handler(...response));
		}
	});
	contextBridge.exposeInMainWorld("mediator", mediatorAPI);
}

const mainMediator = new MainMediator();
export { mainMediator as MainMediator };

// represents a channel where requests are sent and handled
export interface IpcChannel<Q, S> {
	getName(): string;
	handle(event: IpcMainEvent, request: IpcRequest<Q>): S;
}
