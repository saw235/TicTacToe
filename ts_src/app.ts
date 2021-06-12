/// <reference path="references.ts" />

import {gameio} from './gameio'
import {matchmaking as mm} from './matchmaking'
import express, {NextFunction, Request, Response} from 'express';
import {utils} from './utils'
import * as R from 'ramda'

var Ddos = require('ddos') // spam filter

const app = express();
var ddos = new Ddos({burst:10, limit:15})
app.use(ddos.express);


/** 
 * The following APIs are provided
 * POST /joinbattle 
 *     Allows the client to create or join an existing game by specifying uuid
 *     or specifying the sid (session id) of a specific game
 * 
 * POST /placemarker
 *     Allows the client to place a marker on the board.
 * 
 * GET /sessionstate
 *     Allows request of information about the match session and the game board. 
 *
 * GET /battles
 *     Greps all the match sid (session id) of a specific user
 *    
*/

app.get('/', (req, res) => {
    res.send("Welcome to Tic Tac Toe")
})

app.post('/api/joinbattle', wrapAsync (async (req: any, res: any) => {
    var uuid : string  // unique user id
    if (req.query && req.query.uuid !== undefined) {
        uuid  = req.query.uuid as string;

        var found: {sessionstate: any; _id?: any;};
        if (req.query.sid) {
            found = {sessionstate: await gameio.loadSessionState(req.query.sid)}
        } else {
            found = await gameio.findOpenSession(<string> uuid)
        }

        if (!found) {
            let new_session = mm.newSessionState()
            let temp = mm.joinBattle(uuid, new_session) as utils.Either<mm.Sessionstate, Error>
            const f = async (e: mm.Sessionstate) => {
                let sid = await gameio.saveNewSessionState(e)
                res.send({sid : sid, key: ""})
            }
            utils.fmap(f, temp)                    
        } else {
            let temp = mm.joinBattle(uuid, found.sessionstate) as utils.Either<mm.Sessionstate, Error>
            const f = async (e: mm.Sessionstate) => {
                if ((<mm.Waiting>e).po.kind == 'player' && (<mm.Waiting>e).px.kind == 'player') {
                    let session = mm.startSession(<mm.Waiting> e)
                    gameio.saveSessionState(found._id, session)
                    res.send({sid: found._id})
                } 
            }
            utils.fmap(f, temp)   
        }
    } 
}))

app.get('/api/sessionstate', wrapAsync(async(req: any, res :any) => {
    var sid : string
    if (req.query && req.query.sid) {
        sid = req.query.sid as string
        (async () => {
            let session = await gameio.loadSessionState(sid)
            if (session.kind != "none") {
                res.send(session)
            } else {
                res.send("Session not found")
            }
        })()
    }
}))

app.get('/api/battles', wrapAsync (async (req:any, res:any) => {
    var uuid : string  // unique user id
    if (req.query && req.query.uuid !== undefined) {
        uuid = req.query.uuid
        let result = await gameio.findSessionWithUUID(uuid)
        res.send(result)
    } else {
        throw Error("uuid is not provided in POST request")
    }
}))

app.post('/api/placemarker', wrapAsync (async (req:any, res:any) => {
    var uuid : string 
    var sid : string
    var pos : number

    if (req.query && req.query.sid) {
        pos = parseInt(req.query.pos as string) 
        sid = req.query.sid as string
        uuid = req.query.uuid as string

        let session = await gameio.loadSessionState(sid)
        if (session.kind == "playing"){
            let temp = mm.placeMarker(pos, uuid, session) as utils.Either<mm.Sessionstate, Error>
            const curriedSaveSessionState = R.curry(await gameio.saveSessionState)(sid)
            utils.fmap(curriedSaveSessionState, temp)
            utils.fmap( (a:mm.Sessionstate) => res.send(a), temp)
        } else if (session.kind == "waiting" || session.kind == "done") {
            throw Error("Invalid placemarker operation on non playing session")
        } else {
            throw Error("Unable to load session state")
        }
    } else throw Error("sid is not provided in post request.")
}))

app.use(function(error:any, req:any, res:any, next:NextFunction) {
    res.json({ message: error.message });
});

app.listen(3000, () => {
    console.log('The application is listening on port 3000!');
})

function wrapAsync(fn: Function) {
    return function(req: any, res: any , next: NextFunction) {
      fn(req, res, next).catch(next);
    };
}