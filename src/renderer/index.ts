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

// represents a response sent from the main process
export interface IpcResponse {
	isRejected: boolean;
}

class RendererMediator {
	public send<Q, S>(channel: string, request: Q): Promise<S>{
		if(window === undefined)
			return Promise.reject("The window object is not available. Are you using this 'send' method in the renderer process?")
		if(window.mediator === undefined)
			return Promise.reject("The mediator API is not available. Did you call initPreload() in the preload script?")
		if(window.mediator[`send_${channel}`] == undefined || window.mediator[`receive_${channel}`] == undefined)
			return Promise.reject("The mediator object does not contain a method for the supplied channel. Did you register the channel in initPreload()?")
		const req: IpcRequest<Q> = {params: request} 
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-ignore
		window.mediator[`send_${channel}`](req)
		return new Promise<S>((resolve, reject) => {
			// eslint-disable-next-line @typescript-eslint/ban-ts-comment
			// @ts-ignore
			window.mediator[`receive_${channel}`]((response: IpcResponse) => {
				// check if the response is rejected or resolved from main
				!response.isRejected ? resolve(response as unknown as S | Promise<S>) : reject(response)
			})
		})
	}
}

const rendererMediator = new RendererMediator()
export { rendererMediator as RendererMediator }