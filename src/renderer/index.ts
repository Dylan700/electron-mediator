declare global {
	interface Window {
		mediator: {
			[key: string]: (arg: any) => void;
		}
	}
}

// represents a request sent to the main process
export interface IpcRequest<T> {
	params: T;
}

class RendererMediator {
	public send<Q, S>(channel: string, request: Q): Promise<S>{
		if(window === undefined)
			return Promise.reject("The window object is not available. Are you using this 'send' method in the renderer process?");
		if(window.mediator === undefined)
			return Promise.reject("The mediator API is not available. Did you call initPreload() in the preload script?");
		const req: IpcRequest<Q> = {params: request};
		window.mediator[`send_${channel}`](req);
		return new Promise<S>((resolve) => {
			window.mediator[`receive_${channel}`]((response: S) => {
				resolve(response);
			});
		});
	}
}

const rendererMediator = new RendererMediator();
export { rendererMediator as RendererMediator };