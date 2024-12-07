import { exec} from "child_process";
import path from "path";

const source_folder = "./src"
const source = ["./index.mts", "./move-test.mts", "./server.mts"].map((p) => { return path.join(source_folder, p);});

const tsc_path = path.join(".", "node_modules", ".bin", "tsc");

function compile_source(srcpath){
    console.log(`building ${srcpath}...`)
    const tsc = exec(`${tsc_path} ${srcpath} --outDir ./build`);

    tsc.on("close", (code) => {
        if(code != 0) {
            console.error(`${srcpath} failed with code ${code}`);
            return;
        }
        console.log(`${srcpath} was compilled successfully`);
    })
}

source.forEach((srcpath) => {compile_source(srcpath)});