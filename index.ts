enum Ntxuva_Error{
    OK,
    POSITION_OUT_OF_BOUNDS,
    POSITION_IS_EMPTY,
    SLOT_OUT_OF_BOUNDS,
    COL_OUT_OF_BOUNDS,
    ROW_OUT_OF_BOUNDS,
    OVERLAP_NOT_ALLOWED,
    CANNOT_START_WITH_ONE,
    INVALID_STONE_COUNT,
}

type Position = {row: number, col: number};
type Res<T> = {err: Ntxuva_Error, value: T}


class Player {
    public name: string;
    public constructor(name: string){
        this.name = name;
    }
}

/*
    Mapping between the index of the slot and its positioning
    (23) (22) (21) (20) (19) (18) (17) (16) (15) (14) (13) (12)   
    ( 0) ( 1) ( 2) ( 3) ( 4) ( 5) ( 6) ( 7) ( 8) ( 9) (10) (11)  
*/


class Side {
    private slots : Array<number>;

    public constructor(slots_count: number = 12){
        if(slots_count <= 0 || slots_count % 2 != 0) throw Error(`Expected the number of solots must be positive and even but got ` + slots_count);
        this.slots = new Array<number>(slots_count);
        this.slots.fill(2) 
    }
   
    public position_in_bounds({row, col}: Position): boolean {
        let slot = row * (this.slots.length / 2) + col;
        return slot < this.slots.length;
    }

    /** Cleans a column
    * @returns the number of stones taken from the column
    */
    public take_from_col(col: number) : Res<number> {
        if ( col < 0 || col >= this.slots.length / 2) return {err: Ntxuva_Error.COL_OUT_OF_BOUNDS, value: col};
        //From here every position is in bounds

        let peer_slot = this.peer_slot(col);
        let stones_count = this.slots[col] + this.slots[peer_slot];
        this.slots[col] = this.slots[peer_slot] = 0;
        return {err: Ntxuva_Error.OK, value: stones_count};
    }

    /** Starts a game move from the specified position, the intial stones are taken from this stone 
     * @returns the stop position
    */
    public start_from({row, col}: Position) : Res<Position|number> {
        let half_len = this.slots.length / 2;
        if ( col < 0 || col >= half_len) return {err: Ntxuva_Error.COL_OUT_OF_BOUNDS, value: col};
        if ( row < 0 || row >= 1) return {err: Ntxuva_Error.ROW_OUT_OF_BOUNDS, value: row};
        //From here every position is in bounds
        let legality = this.is_legal_start({row, col});
        if(legality.err != Ntxuva_Error.OK) return legality;

        let current_slot = this.slot_from_position({row, col});

        let current_slot_stones_count = this.slots[current_slot]; //Take from current slot

        //Given the legallity 
        if(!this.has_slot_with_more_than_one_stone()){ //here is a state check (be careful with messing with the stones before)
            this.slots[this.next_slot(current_slot)] = 1;
            this.slots[current_slot] = 0; // clean
            return {
                err: Ntxuva_Error.OK,
                value: this.position_from_slot(this.next_slot(current_slot))
            }
        }
 
        this.slots[current_slot] = 0; //clean
        //Iterate positions and fill accordingly
        return this.fill_from_slot(this.next_slot(current_slot), current_slot_stones_count);
    }; 

   /*low leval: crashes when out of bounds*/
    private next_slot(current_slot: number) : number {
        let row, col;
        let pos = {row, col} = this.position_from_slot(current_slot);
        if (!this.position_in_bounds(pos)) throw Error(`Position out of bounds: ${{row, col}}`);
        return (current_slot + 1) % this.slots.length;
    }

   /*low leval: crashes when out of bounds*/
    private peer_slot(current_slot: number) : number {
        let pos;
        let {row, col} = pos = this.position_from_slot(current_slot);
        if (!this.position_in_bounds(pos)) throw Error(`Position out of bounds: ${{row, col}}`);
        let len = this.slots.length;
        return len - current_slot - 1;
    }


    /*low leval: crashes when out of bounds*/
    private slot_from_position({row, col}: Position) : number{
        if (!this.position_in_bounds({row, col})) throw Error(""+{row, col});
        let half_len = this.slots.length / 2;
        return  row * half_len + col;
    }

    /*low leval: crashes when out of bounds*/
    private slot_is_empty(pos: Position): boolean{
        if (!this.position_in_bounds(pos)) throw Error(`Position out of bounds: ${pos}`);
        let current_slot = this.slot_from_position(pos);
        if (current_slot >= this.slots.length) return false;
        return this.slots[current_slot] == 0;
    }


    /*low leval: crashes when out of bounds*/
    private position_from_slot(slot: number):Position {
        let half_len = this.slots.length / 2;
        let pos: Position = {
            row: Math.floor(slot / half_len),
            col: slot % half_len
        };
        if (!this.position_in_bounds(pos)) throw Error(`Position out of bounds:` + pos.row + ", " + pos.col);
        return pos;
    }

    /*low leval: crashes when out of bounds*/
    private is_legal_start(pos: Position): Res<Position>{ 
        if (!this.position_in_bounds(pos)) throw Error(`Position out of bounds: ` + pos);
        if(this.slot_is_empty(pos)) return {err: Ntxuva_Error.POSITION_IS_EMPTY, value: pos};

        //Try to overlap when all slots have one stone or less;
        let more_than_one = this.has_slot_with_more_than_one_stone();
        if(!more_than_one && !this.next_slot(this.slot_from_position(pos))){
           return  {err: Ntxuva_Error.OVERLAP_NOT_ALLOWED , value: pos};
        }

        if(more_than_one && this.slots[this.slot_from_position(pos)] == 1) return {err: Ntxuva_Error.CANNOT_START_WITH_ONE, value: pos};

        return {err: Ntxuva_Error.OK, value: pos};
    }

    /*low level*/
    private has_slot_with_more_than_one_stone (): boolean {
        for(let i = 0; i < this.slots.length; ++i){
            if (this.slots[i] > 1) return true;
        }
        return false;
    }

   /*low leval: crashes when out of bounds*/
    private fill_from_slot (slot: number, stones_count: number): Res<Position|number>{
        let pos = this.position_from_slot(slot);
        if (!this.position_in_bounds(pos)) throw Error(`Position out of bounds:` + pos);

        if (stones_count <= 0) return {err: Ntxuva_Error.INVALID_STONE_COUNT, value: stones_count};

        let current_slot = slot; 
      
        while(stones_count > 0) {
            if (stones_count == 1){
                let current_slot_stones_count = this.slots[current_slot];

                if (current_slot_stones_count == 0){
                    stones_count--; //this here is irrelevant (putting only for the semantics)
                    this.slots[current_slot] ++;
                    return {
                        err: Ntxuva_Error.OK,
                        value: this.position_from_slot(current_slot)
                    }
                } 

                this.slots[current_slot] = 0; // Taking from current slot
                stones_count += current_slot_stones_count; // Join to the stones count to keep the redistribution
            } else {
                this.slots[current_slot]++;
                stones_count--;
            }
            current_slot = this.next_slot(current_slot);
        }

        //The amount of stones is always decreasing and eventually does be 1 
        throw Error("fill_from_col: Unreachable");
    }

      
}


/* Mapping between the index of the slot and its positioning
    (23) (22) (21) (20) (19) (18) (17) (16) (15) (14) (13) (12)   
    ( 0) ( 1) ( 2) ( 3) ( 4) ( 5) ( 6) ( 7) ( 8) ( 9) (10) (11)

    (11) (10) ( 9) ( 8) ( 7) ( 6) ( 5) ( 4) ( 3) (2 ) ( 1) ( 0)
    (12) (13) (14) (15) (16) (17) (18) (19) (20) (21) (22) (23)
*/

class Board {
    public player1 : Player;
    public player2 : Player;
    private current_player : number;
    private slots_count: number
    private sides: Array<Side>;

    public constructor(player1: Player, player2: Player, slots_count: number = 12){
        this.player1 = player1;
        this.player2 = player2;
        this.slots_count = slots_count;
        this.current_player = 0;
        this.sides = new Array<Side>(2);
        this.sides[0] = new Side(slots_count);
        this.sides[1] = new Side(slots_count);
    }

    /*low leval: does not check bounds*/
    private rival_peer_column(col: number): number {
        let half_len = this.slots_count / 2;
        return Math.floor(half_len - col - 1);
    }

    public getWinner() : Player | undefined {
        throw Error("Board.getWinner: Not implemented");
    }

    public next_move(position: Position): Res<number | Position> {
        let other_player = 1 - this.current_player;
        let stop_position_res = this.sides[this.current_player].start_from(position);

        if(stop_position_res.err != Ntxuva_Error.OK) return stop_position_res; 
        //From here every position is in bounds 
        
        //Update rivals side and change turn;
        let taken = 0;
        let stop_position = stop_position_res.value as Position;
        if(stop_position.row == 0){
            console.log(stop_position)
            let remove_pos = this.rival_peer_column(stop_position.col);
            taken = this.sides[other_player].take_from_col(remove_pos).value;
        }
        this.current_player = other_player;
        return {err: Ntxuva_Error.OK, value: taken}
    }


}