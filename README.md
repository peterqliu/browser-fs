## browser-fs

Access the local filesystem from the browser, via Express.js server.

### Usage

`server.js`

```
import browserFS from '@peterqliu/browser-fs'

// start a local server at location of the file
browserFS();
```

`app.js`

```
    fetch(`localhost:8000/readDirectory?path=/Users`)
        .then((response) => response.json())
        .then(r => console.log(r))
```
## API

### Server side
`browserFS({root, port, endpoints})`

Starts a local Express server, with optional parameter object.

root: path specifying the directory to use as the root, for the server. Default is directory of the current file.

port: Port number to use. Default is 8000.

endpoints: Object of custom endpoints to add to the built-ins. Each key and value of the object will serve as the route path and callback function respectively, as specified in the Express [app.get()](https://expressjs.com/en/starter/basic-routing.html) functionality.

For example, starting the server with 
```
browserFS({
    endpoints:{
        customEndpoint: (req, res) => res.send(req.query)
    }
})
```

allows the client to

```
    fetch(`localhost:8000/customEndpoint?key=value`)
        .then((response) => response.json())
        .then(r => {
            // r will be {key: value}
        })
```





