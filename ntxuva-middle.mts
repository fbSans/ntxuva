import { Ntxuva_Board, Ntxuva_Position, Ntxuva_Result } from "./ntxuva-engine.mjs"


/**debug print the slots of the board*/
export function print_board(board: Ntxuva_Board){
    let view = board.rows();
    for(let v of view.slice(0, 2)){
        console.log(v.map(a=>{return board.count(1, a)}));
    }
    console.log()
    for(let v of view.slice(2, 4)){
        console.log(v.map(a=>{return board.count(1, a)}));
    }    
}

export function sprint_pos(pos: Ntxuva_Position) {
    return "{row: " + pos.row + ", col: " + pos.col + "}"; 
}

export function sprint_res<T>(res: Ntxuva_Result<T>){
    let res_value_rep: any = res.value;
    if(typeof res.value != "number") res_value_rep = sprint_pos(res.value as Ntxuva_Position);
    return "{err: " + res.err + ", value: " + res_value_rep + "}"; 
}