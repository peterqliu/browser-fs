import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import mt from 'mime-types';
import open from 'open';
import openExplorer from 'open-file-explorer';
import * as url from 'url';

function browserFS(params) {

    const {root, port=8000, endpoints} = params;
    const app = express();
    app.use(cors());
    
    const __dirname = root || url.fileURLToPath(new URL('.', import.meta.url));
    app.use("/", express.static(path.join(__dirname, "/")));
    
    app.get('/', (req, res) => {
        res.sendFile(path.join(__dirname + '/'));
    });
    
    
    app.listen(port, () => {
        console.log(`BrowserFS on port ${port}!`)
    });
    
    // read contents of folder
    app.get('/readDirectory', (req, res)=>{
        const {path} = req.query;
        readDirectory(path, payload => res.send(payload));
    });
    
    //open directory in finder
    app.get('/openDirectory', (req, res)=>{
        const {path} = req.query;
        openExplorer(path)
        res.send(path)
    });
    
    // pass file 
    app.get('/getFile', (req, res)=>{    
        const {path} = req.query;
        if (fs.existsSync(path))  res.sendFile(path)
        else res.send({error: 'error'})
    });
    
    // open file 
    app.get('/openFile', (req, res) => {
        const {path} = req.query;
        open(path)
        res.send('success')
    });
    
    // custom endpoints
    if (endpoints) {
        Object.entries(endpoints)
            .forEach(([key, fn])=>{
                app.get(`/${key}`, fn)
            })
    }
    
    return app;
}

function readDirectory(_path, cb) {

    fs.readdir(_path, (e,r) => {

        // if error, return empty array
        if (e) {
            // console.error(e); 
            cb({status: 'error', items:[]})
            return
        }
        
        // filter out hidden files
        r = r.filter(([firstCharacter]) => firstCharacter !== '.');

        // if empty, end early
        if (!r.length) {
            cb({status: 'empty', items:[]})
            return
        }

        var output =  r
            .map(n => {

                const childPath = [_path, n].join('/');

                try {
                    const stats = fs.statSync(childPath)
                    const isFolder = stats.isDirectory();
                    const type = (mt.lookup(n) || undefined)?.split('/')[0];
    
                    const extname = path.extname(n);
    
                    return {
                        name: isFolder ? n : n.replace(extname, ''), 
                        ext: isFolder ? false : extname,
                        f: isFolder,
                        t: type,
                        s: stats.size
                    }
                }

                catch (error) {
                    return {error}
                }
            })
        
        cb({items: output})
    })
}

export default browserFS;