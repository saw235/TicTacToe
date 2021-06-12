/// <reference path="references.ts" />

// Higher abstraction API layer for the game 
// Match making policies can be injected here
// All the methods are pure

import {game} from './game'
import {utils} from './utils'
import * as R from 'ramda'

export module matchmaking {
    // Algebrac Data Types for the session
    // When a session is created, it can either be Waiting for players to join 
    // or the game has already started which is represented by Playing
    export type MaybeSessionstate = Sessionstate | None
    export type Sessionstate = Waiting | Playing | Done
    export type MaybePlayer = Player | None
    export type Players = [Player, Player]
    export type Sid = string

    export interface None {
        kind : 'none'
    }

    export interface Waiting {
        kind : 'waiting'
        po : MaybePlayer
        px : MaybePlayer
    }

    export interface Playing {
        kind : 'playing'
        gamestate : game.Gamestate
        boardstate : game.Boardstate
        players : Players
    }

    export interface Done {
        kind : 'done'
        gamestate : game.Gamestate
        boardstate : game.Boardstate
        players : Players
    }

    export interface Player {
        kind : 'player'
        uuid : string
    }

    // constructors
    export const waiting = (po: MaybePlayer, px:MaybePlayer) : Sessionstate => ({ kind : 'waiting', po, px })
    export const playing = (gs: game.Gamestate, bs: game.Boardstate, ps: Players) : Sessionstate => ({ kind : 'playing', gamestate: gs , boardstate: bs , players: ps })
    export const done = (gs: game.Gamestate, bs: game.Boardstate, ps: Players) : Sessionstate => ({ kind : 'done', gamestate: gs , boardstate: bs , players: ps })
    export const none = () : None => ({kind : 'none'})
    export const player = (uuid: string) : Player => ({kind : 'player', uuid})

    export function newSessionState() { 
        return waiting(none(),none())
    }

    export function joinBattle(uuid:string, sessionstate: Sessionstate) : utils.Either<Sessionstate, Error> {
        if (sessionstate.kind == 'playing') {return {kind: "Right", right: Error("Game has already started.")}}
        else if (sessionstate.kind == "waiting") {
            if (sessionstate.po.kind == "none" && sessionstate.px.kind == "none") 
                {return {kind: "Left", "left" : waiting(player(uuid), none())}}
            else if (sessionstate.po) {return {kind: "Left", "left" : waiting(sessionstate.po, player(uuid))}}
            else if (sessionstate.px) {return {kind: "Left", "left" : waiting(player(uuid), sessionstate.px)}}
            else {return {kind: "Right", right: Error("Unable to join battle.")}}
        } else {return {kind: "Right", right: Error("Incorrect session state. Unable to join battle.")}}
    }

    // Takes in a waiting sessionstate with 2 players and starts it
    // returns a session state with the corresponding intialized board and gamestate
    export function startSession(sessionstate : Waiting): Sessionstate {
            let g = game.initGame()
            let bs = g.boardstate
            let gs = g.gamestate
            return playing(gs, bs, [<Player> sessionstate.po, <Player> sessionstate.px])
    }

    export function placeMarker(pos: number, uuid: string, sessionstate: Playing) : utils.Either<Sessionstate, Error> {
        if (isTurn(uuid,sessionstate)) {
            let nextbs = game.playMove(pos, sessionstate.boardstate, sessionstate.gamestate)
            let nextgs = game.nexGameState(nextbs, sessionstate.gamestate)
            return { kind: "Left", left : nextSessionstate(nextgs, nextbs, sessionstate.players)}
            
        } else {
            if (!isTurn(uuid,sessionstate)){
                return { kind: "Right", right: Error("It is not your turn.")}
            }
            return { kind: "Right", right: Error("Internal error.")}
        }
    }

    export function nextSessionstate(nextgs: game.Gamestate, nextbs: game.Boardstate, players: Players) : Sessionstate {
        switch(nextgs.kind) {
            case 'xwin':
            case 'owin':
            case 'tie':
                return done(nextgs, nextbs, players)
            case 'turn':
                return playing(nextgs, nextbs, players)    
        }
    }

    export function isTurn(uuid:string, sessionstate:Playing) : utils.Either<boolean, Error> {
        if (sessionstate.gamestate.kind == "turn"){
            // (==sessionstate.gamestate.xo) <$> mapUuidtoXO(uuid, sessionstate.players)
            utils.fmap(R.equals(sessionstate.gamestate.xo), mapUuidtoXO(uuid, sessionstate.players))
        } else {return {kind: "Right", right: Error("Incorrect gamestate when checking player's turn")}}
        return { kind: "Right", right: Error("Internal error.")}
    }

    export function mapUuidtoXO(uuid:string, ps: Players): utils.Either<string, Error> {
        if (uuid == ps[0].uuid) { return { kind: "Left", left: "o"}}
        if (uuid == ps[1].uuid) { return { kind: "Left", left: "x"}}
        return {kind: "Right", right: Error("Unable to map uuid")} 
    } 
}


