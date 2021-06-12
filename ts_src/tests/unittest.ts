/// <reference path="../references.ts" />

import {game} from '../game'

var assert = require('assert');
describe('game', function() {
  describe('#checkFilled()', function() {
    it('should return false when the boardstate is empty', function() {
      assert.equal(game.checkFilled(game.initBoard()), false);
    });
    it('should return false when the boardstate is partially filled', function() {
        let partiallyFilledBoard = ["#", "#", "x", 
                                    "#", "o", "#", 
                                    "#", "#", "#"]
        assert.equal(game.checkFilled(partiallyFilledBoard), false);
    });
    it('should return true when the boardstate is filled', function() {
        assert.equal(game.checkFilled(Array(9).fill("x")), true);
    });
  });

  describe('#playMove()', function(){
    it('Should return the correct board state after playing a valid move for turn x', function(){
      let gs = game.turn('x')
      let bs = game.initBoard()
      let expected = ["x", "#", "#", 
                      "#", "#", "#", 
                      "#", "#", "#"]
      let new_bs = game.playMove(0,bs,gs)
      assert.deepEqual(new_bs, expected);

      expected = ["#", "#", "#", 
                  "#", "#", "#", 
                  "#", "#", "x"]
      new_bs = game.playMove(8,bs,gs)
      assert.deepEqual(new_bs, expected)
    })
    it('Should return the correct board state after playing a valid move for turn o', function(){
      let gs = game.turn('o')
      let bs = game.initBoard()
      let expected = ["o", "#", "#", 
                      "#", "#", "#", 
                      "#", "#", "#"]
      let new_bs = game.playMove(0,bs,gs)
      assert.deepEqual(new_bs, expected);

      expected = ["#", "#", "#", 
                  "#", "#", "#", 
                  "#", "#", "o"]
      new_bs = game.playMove(8,bs,gs)
      assert.deepEqual(new_bs, expected)
    })
    it('Should return the same board state after playing a invalid move', function(){
      let gs = game.turn('o')
      let bs = game.initBoard()
      let expected = bs
      let new_bs = game.playMove(9,bs,gs)
      assert.deepEqual(new_bs, expected);

      expected = bs
      new_bs = game.playMove(-1,bs,gs)
      assert.deepEqual(new_bs, expected)

      gs = game.turn('x')
      bs =        ["o", "#", "#", 
                  "#", "x", "#", 
                  "#", "#", "o"]
      expected =  bs
      new_bs = game.playMove(4,bs,gs)
      assert.deepEqual(new_bs, expected)

      new_bs = game.playMove(0,bs,gs)
      assert.deepEqual(new_bs, expected)

    })
  })
  describe('#nextGameState()', function(){
    describe('Should return the correct game state after inspecting the boardstate and current game state', function(){
      it('still playing, swap turn', function(){
        let bs = ["#", "o", "#", "#", "#", "#", "#", "#", "#"]
        let gs = game.turn("x")
        let nextgs = game.nexGameState(bs, gs)
        let expected = game.turn("o")
        assert.deepEqual(nextgs, expected)

        bs = ["#", "o", "#", "#", "#", "#", "#", "#", "#"]
        gs = game.turn("o")
        nextgs = game.nexGameState(bs, gs)
        expected = game.turn("x")
        assert.deepEqual(nextgs, expected)
      })
      it('x win', function(){
        let bs = ["#", "o", "#", "x", "x", "x", "#", "#", "#"]
        let gs = game.turn("x")
        let nextgs = game.nexGameState(bs, gs)
        let expected = game.xwin()
        assert.deepEqual(nextgs, expected)

        bs = ["#", "o", "x", "o", "o", "x", "#", "#", "x"]
        gs = game.turn("o")
        nextgs = game.nexGameState(bs, gs)
        expected = game.xwin()
        assert.deepEqual(nextgs, expected)
      })
      it('o win', function(){
        let bs = ["#", "o", "#", "x", "o", "x", "#", "o", "#"]
        let gs = game.turn("x")
        let nextgs = game.nexGameState(bs, gs)
        let expected = game.owin()
        assert.deepEqual(nextgs, expected)

        bs = ["o", "o", "x", "o", "o", "x", "#", "#", "o"]
        gs = game.turn("o")
        nextgs = game.nexGameState(bs, gs)
        expected = game.owin()
        assert.deepEqual(nextgs, expected)
      })
      it('tie', function(){
        let bs = ["x", "o", "o", 
                  "o", "x", "x", 
                  "x", "o", "o"]
        let gs = game.turn("x")
        let nextgs = game.nexGameState(bs, gs)
        let expected = game.tie()
        assert.deepEqual(nextgs, expected)
      })
      it('invalid cases', function(){
        let bs = ["#", "o", "#", "#", "#", "#", "#", "#", "#"]
        let gs = game.turn("a")
        assert.throws(()=> game.nexGameState(bs, gs), Error)
      })
    })
  })
});