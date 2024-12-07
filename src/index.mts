import {Ntxuva_Board, Ntxuva_Error, Ntxuva_Position, Ntxuva_Result} from "./ntxuva-engine.mjs"

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
        let rows = schema[i];
        let buttons_row = Array() as Array<InformedButton>;
        for(let pos of rows){
            let but = document.createElement('button');
            let but_player = Number(i) < 2 ? 1 : 0 as 0|1; 
            but.textContent = board.count(but_player, pos) + ""; //Initial text
            but.onclick = () => {
                let curr_player = board.get_current_player(); 
                if(curr_player != but_player || board.count(curr_player, pos) == 0) return; //Check trivial conditions
                
                let _ = board.next_move(pos); // Ignore the result of current play
                let player_element = document.getElementById("current-player");
                if(player_element != null)
                    player_element.textContent = "Current player: " + board.get_current_player();
                update_game_context(res);
            }
            but.className = "board_slot";
            buttons_row.push({button: but, position: pos, player: but_player});
        }
        buttons.push(buttons_row);
    }

    return res;
}

function update_game_context(ctx: GameContext){
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
    let side0 = document.createElement('div');
    let side1 = document.createElement('div');
    side0.className = side1.className = 'board_side';
    game_element.appendChild(side1);
    game_element.appendChild(side0);

    let player_element = document.getElementById("current-player");
    if(player_element != null)
        player_element.textContent = "Current player: " + board.get_current_player();

    //Side 1
    for (let rows of game_context.buttons.slice(0, 2)){
        let page_row = document.createElement('span');
        page_row.className = 'board_row';
        for(let row of rows){
            page_row.appendChild(row.button);
        }
        side1.appendChild(page_row);
    }


    //Side 2
    for (let rows of game_context.buttons.slice(2, 4)){
        let page_row = document.createElement('span');
        page_row.className = 'board_row';
        for(let row of rows){
            page_row.appendChild(row.button);
        }
        side0.appendChild(page_row);
    }
}












