
Main sources are in `ts_src`

## How to install
```
npm install 
```

## Starting the server
```
npm run start
```

## Running unit tests
```
npm run test
```

The following APIs are provided

| Method | route             | Params                                 | Description                                                                                            |
|--------|-------------------|----------------------------------------|--------------------------------------------------------------------------------------------------------|
| POST   | /api/joinbattle   | uuid: string, sid: string              | Allows the client to create or join an existing match either by uuid or by specifying the specific sid |
| GET    | /api/sessionstate | sid: string                            | Query information of the specific match given its sid                                                  |
| GET    | /api/battles      | uuid: string                           | Query all the ongoing and finished game matching the specific uuid                                     |
| POST   | /api/placemarker  | uuid:string , sid:string , pos: number | Allows the client to make a valid move on the board. Invalid moves will result in an error response.   |