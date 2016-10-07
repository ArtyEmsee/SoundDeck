const chai = require('chai');
const User = require('../../../server/models/User');
const Voting = require('../../../server/models/Voting');

const expect = chai.expect;

describe('Voting', () => {

  describe('Upvoting a DJ', () => {
    it('should give the current DJ a like', () => {

      // create a fake DJ with DJ likes = 0
      const id = 12;
      User.create(id, 'DJJazzyJeff', 'http://www.example.com/avatar.gif', 0);
     
      // call the upvote function


      // expect fake DJ licks = 1
    });
    it('sould allow a user to vote once per song', () => {

    });
  });

  describe('Downvoting a Song', () => {
    it('should give the current song a dislike', () => {

    });
    it('should skip the song if more then x% of users dislike it', () => {

    });
    it('should kick out the DJ if too many downvotes', () => {

    });
  });

  describe('create', () => {
    it('should be a function', () => {
      expect(Voting.create).to.be.a('function');
    });

  });

  describe('upvotes', () => {
    it('should give the current DJ a like', () => {
      // fake likes = 0
      // call the upvote funciton
      // expect fakeDJ.likes = 1
    });
    it('a user can only vote once per song', () => {

    });
  });
  describe('Downvotes', () => {
    it('should give the current song a dislike', () => {

    });
    it('should skip the song if there are X% of people dislike the song', () => {

    });
    it('kick out the DJ if too many downvotes?', () => {

    });
  });
});