
const express = require('express')
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const mt = require('mime-types');
const openExplorer = require('open-file-explorer');

const app = express();

app.use(cors());

app.use("/", express.static(path.join(__dirname, "/")));

app.get('/', (req, res) => {
	res.sendFile(path.join(__dirname + '/'));
});


app.listen(3000, () => {
    console.log('Server on port 3000!')
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

// pass image file 
app.get('/getFile', (req, res)=>{

    const {path} = req.query;
    if (fs.existsSync(path))  res.sendFile(path)
    else res.send({error: 'error'})
});

app.get('/test', (req, res) =>{
    console.log('PING')
    res.send('test')
})



function readDirectory(_path, cb) {

    fs.readdir(_path, (e,r) => {

        // if error, return empty array
        if (e) {
            console.error(e); 
            cb({status: 'error', items:[]})
            return
        }
        console.log(r)
        r = r.filter(n => n[0] !== '.');

        // if empty, end early
        if (!r.length) {
            cb({status: 'empty', items:[]})
            return
        }

        var output =  r
            .map(n => {

                const childPath = [_path, n].join('/');
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
            })
        
        cb({items: output})
    })
}