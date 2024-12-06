
import {Ntxuva_Board, Ntxuva_Error, Ntxuva_Result, Ntxuva_Position} from "./ntxuva-engine.mjs"
import {print_board, sprint_res} from "./ntxuva-middle.mjs"

let board: Ntxuva_Board;

//============================================== Testing functions ========================================================
function expect_result(actual_res: Ntxuva_Result<number | Ntxuva_Position>, expected_res: Ntxuva_Result<number| Ntxuva_Position>, test_name?: string){
    if(test_name == undefined) test_name = "";
    test_name = "[" + test_name + "]";

    let actual_res_rep: any = actual_res;
    if(typeof actual_res != "number") actual_res_rep = sprint_res(actual_res);

    let expected_res_rep: any = actual_res;
    if(typeof actual_res != "number") expected_res_rep = sprint_res(expected_res);


    if(!(actual_res.err == expected_res.err && actual_res.value == expected_res.value)) console.error(test_name + ":failed: expeceted " + expected_res_rep + ", but got" + actual_res_rep);
    else console.log(test_name + ":sucessfull")
}

function expect_error(actual_err: Ntxuva_Error, expeceted_err: Ntxuva_Error, test_name?: string){
    if(test_name == undefined) test_name = "";
    test_name = "[" + test_name + "]"
    if(actual_err != expeceted_err) console.error(test_name + ":failed: expected " + expeceted_err + ", but got " + actual_err);
    else console.log(test_name+ ":sucessfull")
}



//============================================ Start the testing ===============================================
console.log('==========================================================');
//Checking bounds
console.log("test 1");
board = new Ntxuva_Board(12);
expect_result(board.next_move({row: 2, col: 0}), {err: Ntxuva_Error.ROW_OUT_OF_BOUNDS, value: 2}, "exeeding row");
expect_result(board.next_move({row: 0, col: 12}), {err: Ntxuva_Error.COL_OUT_OF_BOUNDS, value: 12}, "exceeding column");

console.log('==========================================================');


console.log("test 2");
//Testing taking from empty
board = new Ntxuva_Board();
expect_error(board.next_move({row: 0, col: 0}).err, Ntxuva_Error.OK, "successful first move");
expect_error(board.next_move({row: 0, col: 3}).err, Ntxuva_Error.EMPTY_POSITION, "empty position");
expect_error(board.next_move({row: 1, col: 3}).err, Ntxuva_Error.EMPTY_POSITION, "empty position, same player");


console.log('===========================================================');

console.log("test 3");
//Testing a specific game sequence
//TODO: use expect result, to validate the values
board = new Ntxuva_Board();
let debug_print = true;

if(debug_print) print_board(board);

//Move 1
let i = 1;
expect_result(board.next_move({row: 0, col: 0}),{err: Ntxuva_Error.OK, value: 4}, "move " + i++);
if(debug_print) print_board(board);
console.log('-----------------------------------------------------------');

//Move 2
expect_result(board.next_move({row: 0, col: 2}),{err: Ntxuva_Error.OK, value: 7}, "move " + i++);
if(debug_print) print_board(board);
console.log('-----------------------------------------------------------');

//Move 3
expect_result(board.next_move({row: 0, col: 4}),{err: Ntxuva_Error.OK, value: 0}, "move " + i++);
if(debug_print) print_board(board);
console.log('-----------------------------------------------------------');

//Move 4
expect_result(board.next_move({row: 0, col: 5}),{err: Ntxuva_Error.OK, value: 0}, "move " + i++);
if(debug_print) print_board(board);
console.log('-----------------------------------------------------------');

//Move 5
expect_result(board.next_move({row: 0, col: 3}),{err: Ntxuva_Error.OK, value: 2}, "move " + i++);
if(debug_print) print_board(board);
console.log('-----------------------------------------------------------');

//Move 6
expect_result(board.next_move({row: 0, col: 0}),{err: Ntxuva_Error.OK, value: 6}, "move " + i++);
if(debug_print) print_board(board);
console.log('-----------------------------------------------------------');

//Move 7
expect_result(board.next_move({row: 1, col: 1}),{err: Ntxuva_Error.OK, value: 8}, "move " + i++);
if(debug_print) print_board(board);
console.log('-----------------------------------------------------------');

//Move 8
expect_result(board.next_move({row: 1, col: 1}),{err: Ntxuva_Error.OK, value: 3}, "move " + i++);
if(debug_print) print_board(board);
console.log('-----------------------------------------------------------');

//Move 9
expect_result(board.next_move({row: 0, col: 1}),{err: Ntxuva_Error.OK, value: 1}, "move " + i++);
if(debug_print) print_board(board);
console.log('-----------------------------------------------------------');

//Move 10
expect_result(board.next_move({row: 0, col: 1}),{err: Ntxuva_Error.OK, value: 0}, "move " + i++);
if(debug_print) print_board(board);
console.log('-----------------------------------------------------------');

//Move 11
expect_result(board.next_move({row: 0, col: 5}),{err: Ntxuva_Error.OK, value: 0}, "move " + i++);
if(debug_print) print_board(board);
console.log('-----------------------------------------------------------');






