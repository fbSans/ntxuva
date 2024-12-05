import {Ntxuva_Board, Ntxuva_Error, Ntxuva_Slot, Ntxuva_Position, Ntxuva_Result} from "./ntxuva-engine.mjs"

type InformedButton = {button:HTMLButtonElement, position: Ntxuva_Position, player: 0|1}
type GameContext = {board: Ntxuva_Board, buttons: Array<Array<InformedButton>>}

function create_game_context(board: Ntxuva_Board): GameContext {
    let schema = board.rows();
    let buttons = [] as Array<Array<InformedButton>>;

    let res : GameContext= {
        board: board,
        buttons: buttons
    };

    for(let i in schema){
        let row = schema[i];
        let buttons_row = Array() as Array<InformedButton>;
        for(let slot of row){
            let but = document.createElement('button');
            let but_player = Number(i) < 2 ? 1 : 0 as 0|1; 
            but.textContent = slot.count + ""; //Initial text
            but.onclick = () => {
                let curr_player = board.get_current_player(); 
                if(curr_player != but_player || board.count(curr_player, slot.position) == 0) return; //Check trivial conditions
                
                let _ = board.next_move(slot.position); // Ignore the result of current play

                update_context(res);
            }
            buttons_row.push({button: but, position: slot.position, player: but_player});
        }
        buttons.push(buttons_row);
    }

    return res;
}

function update_context(ctx: GameContext){
    for(let i = 0; i < ctx.buttons.length; i++){
        for(let j = 0; j < ctx.buttons[i].length; ++j){
            let infod_but = ctx.buttons[i][j];
            infod_but.button.innerText = ctx.board.count(infod_but.player, infod_but.position) + "";
        }
    }
};



window.onload = (e) => {
    let game_element = document.getElementById("game") as HTMLDivElement;
    
    let board = new Ntxuva_Board();
    let game_context = create_game_context(board);
    
    for (let rows of game_context.buttons){
        let page_row = document.createElement('div');
        page_row.className = 'board_row';
        for(let row of rows){
            page_row.appendChild(row.button);
        }
        game_element.appendChild(page_row);
    }
}












