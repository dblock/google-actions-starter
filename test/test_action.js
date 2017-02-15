'use strict';

var chai = require('chai');
var expect = chai.expect;
var request = require('supertest');

describe('MyAction', function() {
  var myAction;

  beforeEach(function() {
    myAction = require('../dist/action');
  });

  afterEach(function() {
    myAction.close();
  });

  it('responds to an invalid payload', function() {
    return request(myAction)
      .post('/')
      .expect(400).then(function(response) {
        expect(response.text).to.eql('Action Error: Missing inputs from request body');
      });
  });

  it('responds to action.MAIN', function() {
    return request(myAction)
      .post('/')
      .send({
        inputs: [{
          intent: 'assistant.intent.action.MAIN'
        }]
      })
      .expect(200).then(function(response) {
        expect(response.body).to.eql({
          conversation_token: '{"state":null,"data":{}}',
          expect_user_response: true,
          expected_inputs: [{
            input_prompt: {
              initial_prompts: [{
                ssml: `Hello, my name is Wassim (aka Maneki Nekko on the Internet).
            Congratulations! This is your first action on Google Actions and Google Home.
            Tell me somthing and I will repeat it.`
              }],
              no_input_prompts: [{
                ssml: "Sorry"
              }]
            },
            possible_intents: [{
              intent: "assistant.intent.action.TEXT"
            }]
          }]
        })
      });
  });

  it('repeats text in action.TEXT', function() {
    return request(myAction)
      .post('/')
      .send({
        inputs: [{
          intent: 'assistant.intent.action.TEXT',
          raw_inputs: [{
            query: "testing 123"
          }]
        }],
      })
      .expect(200).then(function(response) {
        expect(response.body.expected_inputs[0].input_prompt.initial_prompts[0].ssml).to.eql(`
            I heard testing 123.
            Tell me something else.
        `)
      });
  });
});
