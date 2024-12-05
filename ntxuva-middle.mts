import { Ntxuva_Board } from "./ntxuva-engine.mjs"

/**debug print the slots of the board*/
export function print_board(board: Ntxuva_Board){
    let view = board_rows(board);
    for(let v of view.slice(0, 2)){
        console.log(v);
    }
    console.log()
    for(let v of view.slice(2, 4)){
        console.log(v);
    }    
}

/**organizes the board slots in rows that can be used to directly fill the slots in visualization*/
export function board_rows(board: Ntxuva_Board): Array<Array<number>>{
    let res = [] as Array<Array<number>>;
    let sides = board.get_sides();
    let len = sides.first.length;
    let half_len = len / 2;
    
    //Player2: row1
    //len-1 len-2 ... half_len
    res.push(sides.second.slice(half_len, len).reverse());

    // Player2: row0
    // 0 1    ...   helf_len-1
    res.push(sides.second.slice(0, half_len ));

    //Player1: row0
    //half_len-1 ... 1 0
    res.push(sides.first.slice(0, half_len).reverse());

    //Player2: row1
    //half_len ... len-2 len-1
    res.push(sides.first.slice(half_len, len));

    return res;
}