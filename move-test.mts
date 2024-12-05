import { assert } from "console";
import {Ntxuva_Board, Ntxuva_Error, Ntxuva_Result, Ntxuva_Position} from "./ntxuva-engine.mjs"
import {print_board} from "./ntxuva-middle.mjs"

let board: Ntxuva_Board;

function sprint_res<T>(res: Ntxuva_Result<T>){
    return "{err: " + res.err + ", value: " + res.value + "}"; 
}

function expect_result(actual_res: Ntxuva_Result<number | Ntxuva_Position>, expected_res: Ntxuva_Result<number| Ntxuva_Position>, test_name?: string){
    if(test_name == undefined) test_name = "";
    test_name = "[" + test_name + "]"
    if(!(actual_res.err == expected_res.err && actual_res.value == expected_res.value)) console.error(test_name + ":failed: expeceted " + sprint_res(expected_res) + ", but got" + sprint_res(actual_res));
    else console.log(test_name + ":sucessfull")
}

function expect_error(actual_err: Ntxuva_Error, expeceted_err: Ntxuva_Error, test_name?: string){
    if(test_name == undefined) test_name = "";
    test_name = "[" + test_name + "]"
    if(actual_err != expeceted_err) console.error(test_name + ":failed: expected " + expeceted_err + ", but got " + actual_err);
    else console.log(test_name+ ":sucessfull")
}


//Checking bounds
console.log("test 1");
board = new Ntxuva_Board(12);
expect_result(board.next_move({row: 2, col: 0}), {err: Ntxuva_Error.ROW_OUT_OF_BOUNDS, value: 2}, "exeeding row");
expect_result(board.next_move({row: 0, col: 12}), {err: Ntxuva_Error.COL_OUT_OF_BOUNDS, value: 2}, "exceeding column");

console.log('============================');


console.log("test 2");
//Testing taking from empty
board = new Ntxuva_Board();
expect_error(board.next_move({row: 0, col: 0}).err, Ntxuva_Error.OK, "successful first move");
expect_error(board.next_move({row: 0, col: 3}).err, Ntxuva_Error.EMPTY_POSITION, "empty position");
expect_error(board.next_move({row: 1, col: 3}).err, Ntxuva_Error.EMPTY_POSITION, "empty position, same player");


console.log('============================');

console.log("test 3");
//Testing a specific game sequence
//TODO: use expect result, to validate the values
board = new Ntxuva_Board();
//Move 1
let i = 1;
expect_error(board.next_move({row: 0, col: 0}).err, Ntxuva_Error.OK, "move " + i++);

console.log('--------------------------------------');

//Move 2
expect_error(board.next_move({row: 0, col: 2}).err, Ntxuva_Error.OK, "move " + i++);

console.log('--------------------------------------');

//Move 3
expect_error(board.next_move({row: 0, col: 4}).err, Ntxuva_Error.OK, "move " + i++);

console.log('--------------------------------------');

//Move 4
expect_error(board.next_move({row: 0, col: 5}).err, Ntxuva_Error.OK, "move " + i++);

console.log('--------------------------------------');

//Move 5
expect_error(board.next_move({row: 0, col: 3}).err, Ntxuva_Error.OK, "move " + i++);

console.log('--------------------------------------');

//Move 6
expect_error(board.next_move({row: 1, col: 2}).err, Ntxuva_Error.OK, "move " + i++);

console.log('--------------------------------------');

//Move 7
expect_error(board.next_move({row: 0, col: 0}).err, Ntxuva_Error.OK, "move " + i++);

console.log('--------------------------------------');

//Move 8
expect_error(board.next_move({row: 0, col: 0}).err, Ntxuva_Error.OK, "move " + i++);


console.log('--------------------------------------');

//Move 8
expect_error(board.next_move({row: 1, col: 2}).err, Ntxuva_Error.OK, "move " + i++);


console.log('--------------------------------------');

//Move 8
expect_error(board.next_move({row: 1, col: 0}).err, Ntxuva_Error.OK, "move " + i++);

console.log('--------------------------------------');

//Move 9
expect_error(board.next_move({row: 1, col: 3}).err, Ntxuva_Error.OK, "move " + i++);






