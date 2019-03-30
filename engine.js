"format cjs";

var wrap = require('word-wrap');
var map = require('lodash.map');
var longest = require('longest');
var rightPad = require('right-pad');
var _ = require('lodash');
var fuzzy = require('fuzzy');
var inquirer = require('inquirer');
inquirer.registerPrompt('autocomplete', require('inquirer-autocomplete-prompt'));


var filter = function(array) {
  return array.filter(function(x) {
    return x;
  });
};

// This can be any kind of SystemJS compatible module.
// We use Commonjs here, but ES6 or AMD would do just
// fine.
module.exports = function (options) {

  var types = options.types;

  var length = longest(Object.keys(types)).length + 1;
  var choices = map(types, function (type, key) {
    return {
      name: rightPad(key + ':', length) + ' ' + type.description,
      value: key,
    };
  });
  
  function searchStates(answers, input) {
    input = input || '';
    return new Promise(function(resolve,reject) {
      var fuzzyResult = fuzzy.filter(input||"a", _.map(choices,(value)=>value.name));
      if (true) {
        resolve(
          fuzzyResult.map(function(el) {
            return el.original;
          })
        );
      }
      else{
        reject("1");
      }

    });
  }
  return {
    // When a user runs `git cz`, prompter will
    // be executed. We pass you cz, which currently
    // is just an instance of inquirer.js. Using
    // this you can ask questions and get answers.
    //
    // The commit callback should be executed when
    // you're ready to send back a commit template
    // to git.
    //
    // By default, we'll de-indent your commit
    // template and will keep empty lines.
    
    prompter: function(cz, commit) {
      console.log('\nLine 1 will be cropped at 100 characters. All other lines will be wrapped after 100 characters.\n');

      // Let's ask some questions of the user
      // so that we can populate our commit
      // template.
      //
      // See inquirer.js docs for specifics.
      // You can also opt to use another input
      // collection library if you prefer.

      inquirer.prompt([
        {
          type: 'autocomplete',
          name: 'type',
          message: 'Select the type of change that you\'re committing:',
          source: searchStates,
        },
        {
          type: 'input',
          name: 'subject',
          message: 'Write a short, imperative tense description of the change:\n',
          default: options.defaultSubject
        }
      ]).then(function(answers) {
        if(!answers.subject || answers.subject.length <= 0){
          console.log("Error: subject is empty");
          return -1;
        }
        var choice_type = "";
        _.map(choices,(value,key)=>{
          if (value.name === answers.type) {
            choice_type = value.value;
          }
        });
        answers.type = choice_type;
        var maxLineWidth = 100;
        var wrapOptions = {
          trim: true,
          newline: '\n',
          indent:'',
          width: maxLineWidth
        };
        var head = (answers.type + ': ' + answers.subject.trim()).slice(0, maxLineWidth);


        var body = wrap(answers.body||"", wrapOptions);

        // var issues = answers.issues ? wrap(answers.issues, wrapOptions) : '';
        var footer = "";
        commit(head + '\n\n' + body + '\n\n' + footer);
      });
    }
  };
};
