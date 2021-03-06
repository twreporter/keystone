var demand = require('must');
var EmailType = require('../EmailType');

exports.initList = function(List) {
  List.add({
    email: { type: EmailType },
    nested: {
      email: { type: EmailType },
    },
  });
};

exports.createData = function(List) { // eslint-disable-line no-unused-vars

};

exports.testFilters = function(List) { // eslint-disable-line no-unused-vars

};

exports.testFieldType = function(List) {
  var testItem = new List.model();

  it('should update top level fields', function(done) {
    List.fields.email.updateItem(testItem, {
      email: 'sebastian@thinkmill.com.au',
    }, function() {
      demand(testItem.email).be('sebastian@thinkmill.com.au');
      testItem.email = undefined;
      done();
    });
  });

  it('should update nested fields', function(done) {
    List.fields['nested.email'].updateItem(testItem, {
      nested: {
        email: 'sebastian@thinkmill.com.au',
      },
    }, function() {
      demand(testItem.nested.email).be('sebastian@thinkmill.com.au');
      testItem.nested.email = undefined;
      done();
    });
  });

  it('should update nested fields with flat paths', function(done) {
    List.fields['nested.email'].updateItem(testItem, {
      'nested.email': 'sebastian@thinkmill.com.au',
    }, function() {
      demand(testItem.nested.email).be('sebastian@thinkmill.com.au');
      testItem.nested.email = undefined;
      done();
    });
  });

  it('should properly validate invalid emails', function() {
    demand(List.fields.email.inputIsValid({ email: false }, true)).be(false);
    demand(List.fields.email.inputIsValid({ email: null }, true)).be(false);
    demand(List.fields.email.inputIsValid({ email: undefined }, true)).be(false);
    demand(List.fields.email.inputIsValid({ email: '' }, true)).be(false);
    demand(List.fields.email.inputIsValid({ email: 'false' }, true)).be(false);
    demand(List.fields.email.inputIsValid({ email: true }, true)).be(false);
    demand(List.fields.email.inputIsValid({ email: 'true' }, true)).be(false);
  });

  it('should properly validate valid emails', function() {
    demand(List.fields.email.inputIsValid({ email: 'example@example.com' })).be(true);
  });


  it('should properly generate gravatar', function() {
    demand(testItem._.email.gravatarUrl()).be('');
    testItem.email = 'sebastian@thinkmill.com.au';
    demand(testItem._.email.gravatarUrl()).be('//www.gravatar.com/avatar/45eed6685108e64b67f79fb056d95a64?s=80&d=identicon&r=g');
    // size
    demand(testItem._.email.gravatarUrl(50)).be('//www.gravatar.com/avatar/45eed6685108e64b67f79fb056d95a64?s=50&d=identicon&r=g');
    // defaultImage
    demand(testItem._.email.gravatarUrl(null, 'https://avatars1.githubusercontent.com/u/853712')).be('//www.gravatar.com/avatar/45eed6685108e64b67f79fb056d95a64?s=80&d=https%3A%2F%2Favatars1.githubusercontent.com%2Fu%2F853712&r=g');
    // rating
    demand(testItem._.email.gravatarUrl(null, null, 'pg')).be('//www.gravatar.com/avatar/45eed6685108e64b67f79fb056d95a64?s=80&d=identicon&r=pg');
  });
};
