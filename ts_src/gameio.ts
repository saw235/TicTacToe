// Layer to do the game io, ie fetch game state and save game state in and out of db
// Functions here have external side effects 

/// <reference path="references.ts" />

import Datastore from 'nedb-promises';
import {matchmaking as mm} from './matchmaking'

export module gameio {
    let datastore = Datastore.create('game.db')

    export async function saveNewSessionState(sessionstate: mm.Sessionstate) {
        let doc = await datastore.insert({sessionstate})
        if (!doc) {return null}
        else {return doc._id}
    }

    export async function saveSessionState(sid: mm.Sid | null, sessionstate: mm.Sessionstate) {
        return await datastore.update({ _id: sid}, {$set:{sessionstate: sessionstate}})
                    .catch(err => {return null})
    }

    export async function loadSessionState(id: mm.Sid | null) : Promise<mm.MaybeSessionstate> {
        return await datastore.findOne({_id: id})
                .then((v: any) =>{ return v.sessionstate})
                .catch(err => {console.log(err); 
                    return mm.none()})
    }

    export async function findOpenSession(uuid:string) {
        // Query for empty p2 and different uuid in p1
        return await datastore.findOne({ $and : [{"sessionstate.px.kind" : "none"}, {"sessionstate.po.uuid" : { $ne: uuid}}] })
            .then((v: any) =>{ return v})
            .catch(err => {return null})
    }

    export async function findSessionWithUUID(uuid:string) {
        return await datastore.find({ $or : [{"sessionstate.px.kind" : uuid}, {"sessionstate.po.uuid" : uuid}, {"sessionstate.players" : {$elemMatch : {kind:"player", uuid: uuid}}}]})
            .then((v: any) =>{ return v})
            .catch(err => {return null})
    }

    export async function cleanUnusedSession(){
        console.log("cleaning garbage from db")
        await datastore.remove({
            $and : [
                {"sessionstate.ttd" : 0}, // time till dead
                { $or: [{"sessionstate.gamestate.kind" : "owin"}, 
                        {"sessionstate.gamestate.kind" : "xwin"}, 
                        {"sessionstate.gamestate.kind" : "tie"},
                        {"sessionstate.kind" : "waiting"},]}
            ]}, { multi: true })
    }
}