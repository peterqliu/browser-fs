## browser-fs

Access the local filesystem from the browser, via Express.js server.

### Usage

`server.js`

```js
import browserFS from '@peterqliu/browser-fs'

// start a local server at location of the file
browserFS();
```

`app.js`

```js
    fetch(`localhost:8000/readDirectory?path=/Users`)
        .then((response) => response.json())
        .then(r => console.log(r))
```
## API

### Server side

`browserFS({root, port, endpoints})`

Starts a local Express server, with optional parameters object.

root: path specifying the directory to use as the root, for the server. Default is directory of the current file.

port: Port number to use. Default is 8000.

endpoints: Object of custom endpoints to add to the built-ins. Each key and value of the object will serve as the route path and callback function respectively, as specified in the Express [app.get()](https://expressjs.com/en/starter/basic-routing.html) functionality.

For example, starting the server with 
```js
browserFS({
    endpoints:{
        customEndpoint: (req, res) => res.send(req.query)
    }
})
```

allows the client to

```js
    fetch(`localhost:8000/customEndpoint?key=value`)
        .then((response) => response.json())
        .then(r => {
            // r will be {key: value}
        })
```

### Client side

Interact with server via requests in the format of `${host}/${method}?${key=value}`. Current methods are read only.

`/readDirectory?path=${path}`

Read contents of directory of the specified path. uses `fs.readdir()` under the hood.

`/openDirectory?path=${path}`

Open directory of the specified path, with the system finder.

`/getFile?path=${path}`

Get file of the specified path.

`/openFile?path=${path}`

Open file of the specified path, with the system-default application.


