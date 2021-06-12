export module utils {
    export type Either<L, A> = { kind: 'Left'; left: L } | { kind: 'Right'; right: A } 

    export function fmap<L,Error>(func: Function, either: Either<L, Error>) {
        switch (either.kind) {
            case "Left":
                func(either.left)
                break;
            case "Right":
                throw either.right
        }
    }

    export function allEqual(arr:any[], val:any){
        let arrClone = cloneArr(arr)
        return arrClone.every( v => v === val )
    }
    
    export function between (n:number, a:number , b:number) :boolean {
        return n >= a && n <= b;
    }
    
    export function cloneArr (arr: any[]){
        return arr.map(x => x)
    }
}