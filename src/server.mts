import * as http from "http"
import { readFile} from "fs/promises";
import * as path from "path";



let port = 8000;
let host = "localhost";

const allowed_extensions =  {
    ".txt": "text/plain",
    ".html": "text/html",
    ".htm": "text/html",
    ".css": "text/css",
    ".js": "application/javascript",
    ".mjs": "application/javascript",
    ".png": "image/png",
};

function getValue(o: object, k: string){
    return Object.getOwnPropertyDescriptor(o, k)?.value;
}

function hasOwnProp (o: Object, p: string): boolean {
    return Object.getOwnPropertyDescriptor(o, p) != undefined;
}

let loadFile = async (filename: string) => {
    const ext = path.extname(filename);
    if(!hasOwnProp(allowed_extensions, ext)){
        return {content: "", status: false};
    };

    const curr_dir = path.resolve(".");
    const filepath = path.join(curr_dir, filename);
    const normalized_path = path.resolve(filepath);
    const normalized_dir = path.resolve(curr_dir);

    if(!normalized_path.startsWith(normalized_dir)) return {content: "", status: false};

    let content = await (async () => {
        return await readFile(normalized_path)
        .then((buffer) => {
            return {content: buffer.toString(), status: true};
        })
        .catch(() => {
            return {content: "", status: false}
        });
    })();

    return content;
}



let server = http.createServer(async (req, res) => {
    console.log(`HTTP ${req.method} ${req.url}`);

    switch(req.url){
        case '/ntxuva':
        case '/':
            res.writeHead(200, "OK", {"content-type" : "text/html"});
            res.end((await loadFile("./index.html")).content);
            break;
        default:
            if(req.url){
               //loadFile must fail in case of invalid extension 
               let file_data = await loadFile(req.url);
               if(file_data.status) {
                    res.writeHead(
                        200,
                        "OK", 
                        {
                            "content-type": getValue(allowed_extensions, path.extname(req.url)) as string,
                            "content-length": file_data.content.length,
                        },
                    );
                    res.end(file_data.content);
                    break;
               }
            }
            
            res.writeHead(404, "Not Found", {"content-type": 'text/plain'});
            res.end("404 Not Found");
    }
});

server.listen(port, host, () =>{
    console.log("Server: Listening on " + host + ":" + port);
});

server.on("close", () => {
    console.log("Server: closing...");
});
