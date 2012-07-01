var should = require('should');
var util = require('util');

describe('edit', function() {
  var edit = require('../../lib/edit.js').edit({});
  

  describe('#get_home()', function() {
    
    it('should retrieve a non-empty home directory', function() {
      edit.t_get_home().length.should.be.above(0);
    });
  });


  describe('#ac_base()', function() {

    it('should accept paths starting with ~', function() {
      edit.t_ac_base('~', null).path.should.be.a('string');
      edit.t_ac_base('~', null).path.length.should.be.above(0);
    });

    it('should accept relative path with a current path', function() {
      edit.t_ac_base('ab', '/home/spolu/envi/test').hint.should.equal('ab');
      edit.t_ac_base('ab', '/home/spolu/envi/test').path.should.equal('/home/spolu/envi');
      edit.t_ac_base('ab', null).hint.should.equal('ab');
      edit.t_ac_base('ab', null).path.should.equal('');
    });

    it('should accept empty arguments', function() {
      edit.t_ac_base(undefined, undefined).path.should.equal('');
      edit.t_ac_base(undefined, undefined).hint.should.equal('');
    });

    it('should not insert superfluous /', function() {
      edit.t_ac_base('~/.em', undefined).path.should.equal(edit.t_get_home());
    });

  });

  describe('#autocomplete()', function() {

    it('should return a list of paths', function(done) {
      edit.autocomplete('~', null, function(err, paths) {
        if(err) throw err;
        paths.should.be.an.instanceOf(Array);
        paths.length.should.be.above(0);
        done();
      });
    });


    it('should accept /', function(done) {
      edit.autocomplete('/', null, function(err, paths) {
        if(err) throw err;
        done();
      })
    });

    it('should return an error when the path does not exist', function(done) {
      edit.autocomplete('/asdkahsd/u23r8uw98uajshasdkjh', null, function(err, paths) {
        err.should.be.a('object');
        err.code.should.equal('ENOENT');
        done();
      })
    });
  });
});
