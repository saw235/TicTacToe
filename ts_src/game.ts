/// <reference path="references.ts" />
import {utils} from './utils'
// Game logic layer for tic tac toe
// Board state is just represented by an array of size 9 
// All the functions in this layer are pure 
export module game {
    export type Gamestate = XWin | OWin | Tie | Turn
    export type Boardstate = string[]
    interface XWin { kind: 'xwin'}
    interface OWin { kind: 'owin'}
    interface Tie { kind: 'tie' }
    interface Turn {
        kind: 'turn'
        xo: string
    }

    // constructors
    export const turn = (xo: string) : Gamestate => ({ kind : 'turn', xo })
    export const owin = () : Gamestate => ({kind: 'owin'})
    export const xwin = () : Gamestate => ({kind: 'xwin'})    
    export const tie = () : Gamestate => ({kind: 'tie'})

    export function initBoard() : Boardstate {
        return Array(9).fill("#")	
    }
    
    export function initGame() {
        let game = {
            gamestate : turn('o'),
            boardstate : initBoard()
        }
        return game
    }
    
    export function playMove (pos: number, boardstate: Boardstate, gamestate: Gamestate) : Boardstate {
        var cloneboardstate = utils.cloneArr(boardstate)
        if (gamestate.kind == 'turn' && validMove(gamestate.xo, pos, boardstate) ){
            cloneboardstate[pos] = gamestate.xo
        }
        return cloneboardstate
    }
    
    export function validMove (xo: string, pos: number, boardstate: Boardstate) : boolean {
        return (boardstate[pos] == "#") && (xo == "x" || xo == "o") && utils.between(pos, 0, 8) 
    }
    
    export function nexGameState (boardstate: Boardstate, gamestate: Gamestate) : Gamestate {
        if (gamestate.kind == 'turn'){
            let wins = [checkWin("x", boardstate), checkWin("o",boardstate)]
            if (wins.includes(true)) {
                if (wins[0]) return xwin()
                if (wins[1]) return owin()
                return gamestate 
            } else if (checkFilled(boardstate)) {
                return tie()
            } else {
                return swapTurn(gamestate)
            }
        } else return gamestate
    }
    
    export function swapTurn (gamestate: Turn) : Turn {
        if (gamestate.xo != 'x' && gamestate.xo != 'o') {
            throw Error("Error occured when swapping turns")
        }
        let nextPlaying = gamestate.xo == "x" ? "o" : "x" 
        return <Turn>turn(nextPlaying)
    }
    
    export function checkFilled (boardstate: Boardstate) : boolean {
        return boardstate.every(v => (v == "x" || v == "o"))
    }

    export function checkWin (xo: string, boardstate: Boardstate) : boolean {
        let boardstateClone = utils.cloneArr(boardstate)
    
        let f = (row: any[]) => {
            row = utils.cloneArr(row)
            return utils.allEqual(extract3(boardstateClone, row), xo)
        }
    
        let winAnyRow = rows3x3().map(f)
        let winAnyCol = col3x3().map(f)
        let winAnyDia = dia3x3().map(f)
    
        return winAnyRow.concat(winAnyCol, winAnyDia).includes(true)
    }
    
    export function extract3(boardstate: Boardstate, arr3: number[]) {
        let boardstateClone = utils.cloneArr(boardstate)
        let arr3Clone = utils.cloneArr(arr3)
        return [boardstateClone[arr3Clone[0]], 
                boardstateClone[arr3Clone[1]], 
                boardstateClone[arr3Clone[2]]]
    }
        
    export function rows3x3 () {
        return [[0,1,2],
                [3,4,5],
                [6,7,8]]
    }
    
    export function col3x3 () {
        return [[0,3,6],
                [1,4,7],
                [2,5,8]]
    }
    
    export function dia3x3() {
        return [[0,4,8], [2,4,6]]
    }
    
}


