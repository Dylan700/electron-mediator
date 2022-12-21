# Why use this?
## Simplicity
Interprocess communication in Electron is already quite simple, however, you'll often find that as an application grows, so does its complexity. This package aims to simplify the communication between renderer processes and the main process even more, by provided a simple promise-based API for sending messages.

## Type-Safety
Improve the scalability of your code with TypeScript. All responses and requests require types to be defined, ensuring that you won't accidentally use an invalid or unexpected value. If you so wish, this package can be used with plain JavaScript too.
## Security
This package is designed to be used with a number of secure browser settings, namely, `ContextIsolation: true` and `NodeIntegration: false`. 

The IpcRenderer Electron module (used for interprocess communication) is NOT arbitrarily exposed since each channel is given its own send/receive functionality. This prevents the client from being able to send messages to any channel on the main process, but only the channels you define.

# Usage
Please follow the example below to get started:
1. Setup types for sending and receiving responses (shared between renderer and main for type-safety):
```ts
// this is the structure of a request
type DemoRequest = {
    name: string,
    id: number,
}

// this is the structure of a response
type DemoResponse = {
    result: number
}
```
2. In the Main Process, setup the mediator and any channels for communication.
```ts
import { MainMediator, IpcChannel, IpcRequest } from "@dylan700/electron-mediator/main";

// this is a channel to handle "demo" requests
class DemoChannel implements IpcChannel<DemoRequest, DemoResponse> {
    public getName(): string {
        return "demo";
    }

    public handle(_event: Electron.IpcMainEvent, request: IpcRequest<DemoRequest>): void {
        // use params like this:
        console.log(request.params.name, request.params.id);
        // return results to the renderer like this
        return {result: 1};
    }
}

// register channels in the main process
MainMediator.registerChannel(new DemoChannel());
```
3. In the Electron preload script, call the function below:
```ts
import { initPreload } from '@dylan700/electron-mediator/main';
// include the channels as a list of arguments or an array of strings using the spread operator; e.g. initPreload(...["demo", "anotherChannel"])
initPreload("demo"); // multiple channels as defined in main can be supplied here too, e.g. initPreload("demo", "anotherChannel");
```
4. Use the mediator in the Renderer process:
```ts
import { RendererMediator } from "@dylan700/electron-mediator/renderer";
RendererMediator.send<DemoRequest, DemoResponse>("demo", {name: "Jason Bourne", id: 1}).then((res) => console.log(res.result));
```
or
```ts
import { RendererMediator } from "@dylan700/electron-mediator/renderer";
const result: DemoResponse = await RendererMediator.send<DemoRequest, DemoResponse>("demo", {name: "Jason Bourne", id: 1});
```