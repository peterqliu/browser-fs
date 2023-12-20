
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
    const [queryPath] = Object.keys(req.query);
    readDirectory(queryPath, payload => res.send(payload));
});

//open directory in finder
app.get('/openDirectory', (req, res)=>{
    const [queryPath] = Object.keys(req.query);
    openExplorer(queryPath)
    res.send(queryPath)
});

// pass image file 
app.get('/getFile', (req, res)=>{

    const [query] = Object.keys(req.query);
    if (fs.existsSync(query))  res.sendFile(query)
    else res.send({error: 'error'})
});

// pass image preview with dimension (square)
app.get('/getPreview.png', (req, res) => {

    try {
        const [query, ratio, width, square] = req._parsedUrl.query.split('&');
        const r = parseFloat(ratio);
        const w = parseFloat(width*50);
    
        const resizeArguments = square ? [256, 256, {fit: 'cover'}] : [256];//[Math.round(256*(1-w)), Math.round(256*r*(1-w/r))];
    
        sharp(query, {failOn: 'none'})
            // .metadata((e,d)=>console.log(d.width, d.height))
            .resize(...resizeArguments)
            .toBuffer()
            .then(buffer => res.send(buffer))
            .catch(err=>res.send(err, query, 'sharperror'))
    }

    catch {res.send('error')}


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

        r = r.filter(n => n[0] !== '.');

        // if empty, end early
        if (!r.length) {
            cb({status: 'empty', items:[]})
            return
        }

        var output =  r
            .map(n => {

                const childPath = [path, n].join('/');
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