import { lchown } from "fs";

export enum Ntxuva_Error{
    OK,
    EMPTY_POSITION,
    COL_OUT_OF_BOUNDS,
    ROW_OUT_OF_BOUNDS,
    OVERLAP_NOT_ALLOWED,
    CANNOT_START_WITH_ONE,
    INVALID_STONE_COUNT,
}

export type Ntxuva_Position = {row: number, col: number};
export type Ntxuva_Result<T> = {err: Ntxuva_Error, value: T}

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
   
    public count(pos: Ntxuva_Position) : number {
        return this.slots[this.slot_from_position(pos)];
    }

    /**Get a copy of the slots of the side*/
    public see_slots(): Array<number>{
        return this.slots.slice();
    }
    public position_in_bounds({row, col}: Ntxuva_Position): boolean {
        let slot = row * (this.slots.length / 2) + col;
        return slot < this.slots.length;
    }

    /** Cleans a column
    * @returns the number of stones taken from the column
    */
    public take_from_col(col: number) : Ntxuva_Result<number> {
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
    public start_from({row, col}: Ntxuva_Position) : Ntxuva_Result<Ntxuva_Position|number> {
        let half_len = this.slots.length / 2;
        if ( col < 0 || col >= half_len) return {err: Ntxuva_Error.COL_OUT_OF_BOUNDS, value: col};
        if ( row < 0 || row >= 2) return {err: Ntxuva_Error.ROW_OUT_OF_BOUNDS, value: row};
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
    private slot_from_position({row, col}: Ntxuva_Position) : number{
        if (!this.position_in_bounds({row, col})) throw Error(""+{row, col});
        let len = this.slots.length;
        return  row == 0 ? col : len - 1 - col ;
    }

    /*low leval: crashes when out of bounds*/
    private slot_is_empty(pos: Ntxuva_Position): boolean{
        if (!this.position_in_bounds(pos)) throw Error(`Position out of bounds: ${pos}`);
        let current_slot = this.slot_from_position(pos);
        if (current_slot >= this.slots.length) return false;
        return this.slots[current_slot] == 0;
    }


    /*low leval: crashes when out of bounds*/
    private position_from_slot(slot: number):Ntxuva_Position {
        let len = this.slots.length;
        let half_len = len / 2;
        let pos: Ntxuva_Position = {
            row: Math.floor(slot / half_len),
            col: slot < half_len? slot: len - 1 - slot
        };
        if (!this.position_in_bounds(pos)) throw Error(`Position out of bounds:` + pos.row + ", " + pos.col);
        return pos;
    }

    /*low leval: crashes when out of bounds*/
    private is_legal_start(pos: Ntxuva_Position): Ntxuva_Result<Ntxuva_Position>{ 
        if (!this.position_in_bounds(pos)) throw Error(`Position out of bounds: ` + pos);
        if(this.slot_is_empty(pos)) return {err: Ntxuva_Error.EMPTY_POSITION, value: pos};

        //Try to overlap when all slots have one stone or less;
        let more_than_one = this.has_slot_with_more_than_one_stone();
        let next_pos = this.next_slot(this.slot_from_position(pos));
        if(!more_than_one && this.slots[next_pos] != 0){
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
    private fill_from_slot (slot: number, stones_count: number): Ntxuva_Result<Ntxuva_Position|number>{
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

export class Ntxuva_Board {
    private current_player : 0 | 1;
    private slots_count: number
    private sides: Array<Side>;

    //Start the board in a valid state;
    public constructor(slots_count: number = 12){
        this.slots_count = slots_count;
        this.current_player = 0;
        this.sides = new Array<Side>(2);
        this.sides[0] = new Side(slots_count);
        this.sides[1] = new Side(slots_count);
    }

 

    public next_move(position: Ntxuva_Position): Ntxuva_Result<number | Ntxuva_Position> {
        let other_player = 1 - this.current_player as 0 | 1;
        let stop_position_res = this.sides[this.current_player].start_from(position);

        if(stop_position_res.err != Ntxuva_Error.OK) return stop_position_res; 
        //From here every position is in bounds 
        
        //Update rivals side and change turn;
        let taken = 0;
        let stop_position = stop_position_res.value as Ntxuva_Position;
        if(stop_position.row == 0){
            let remove_pos = this.rival_peer_column(stop_position.col);
            if (this.count(other_player, {row: 0, col: remove_pos}) > 0)
                taken = this.sides[other_player].take_from_col(remove_pos).value;
        }
        this.current_player = other_player as 0 | 1;
        return {err: Ntxuva_Error.OK, value: taken}
    }

    /**Tells the scheme on which to organize the rows*/
    public rows(): Array<Array<Ntxuva_Position>>{
        let res = [] as Array<Array<Ntxuva_Position>>;
        let sides = this.get_sides();
        let len = sides.first.length;
        let half_len = len / 2;
        
        //Player2: row1
        //len-1 len-2 ... half_len
        res.push(new Array(half_len).fill(0).map((_, i) => {return {row: 1, col: i}}));
        // Player2: row0
        // 0 1    ...   helf_len-1
        res.push(new Array(half_len).fill(0).map((_, i) => {return {row: 0, col: i}}));
        //Player1: row0
        //half_len-1 ... 1 0
        res.push(new Array(half_len).fill(0).map((_, i) => {return {row: 0, col: half_len - i - 1}}));
    
        //Player2: row1
        //half_len ... len-2 len-1
        res.push(new Array(half_len).fill(0).map((_, i) => {return {row: 1, col: half_len - i - 1}}));
        return res;
    }


    public count(player: 0|1, position: Ntxuva_Position) : number {
        return this.sides[player].count(position);
    }

    public get_current_player() : 0 | 1{
        return this.current_player;
    }

    /*low leval: does not check bounds*/
    private rival_peer_column(col: number): number {
        let half_len = this.slots_count / 2;
        return Math.floor(half_len - col - 1);
    }

    /**pack a copy of sides array*/
    private get_sides() : {first: Array<number>, second: Array<number>}{
        return {
            first: this.sides[0].see_slots(),
            second: this.sides[1].see_slots(),
        }
    }
}





