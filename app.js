
var express = require( 'express' ),
    basicAuth = require( 'basic-auth-connect' ),
    cfenv = require( 'cfenv' ),
    multer = require( 'multer' ),
    bodyParser = require( 'body-parser' ),
    fs = require( 'fs' ),
    ejs = require( 'ejs' ),
    app = express();
var settings = require( './settings' );
var appEnv = cfenv.getAppEnv();

app.use( multer( { dest: './tmp/' } ).single( 'image' ) );
app.use( bodyParser.urlencoded( { extended: true } ) );
app.use( bodyParser.json() );
app.use( express.Router() );
app.use( express.static( __dirname + '/public' ) );

app.all( '/list*', basicAuth( function( user, pass ){
  return( user === settings.basic_username && pass === settings.basic_password );
}));

app.post( '/post', function( req, res ){
  var imgpath = req.file.path;
  var imgtype = req.file.mimetype;
  //var imgsize = req.file.size;
  var ext = imgtype.split( "/" )[1];
  //var imgfilename = req.file.filename;
  var space = req.body.space;
  var username = req.body.username;
  if( space && username ){
    var dstimgpath = 'public/imgs/' + space + '---' + username + '.png';
    fs.rename( imgpath, dstimgpath, function(){}  );
    res.write( 'ok' );
    res.end();
  }else{
    res.write( 'error' );
    res.end();

    fs.unlink( imgpath, function( err ){} );
  }
});

app.get( '/list', function( req, res ){
  var space = req.query.space;
  var training_template = fs.readFileSync( __dirname + '/public/list.ejs', 'utf-8' );
  var options = { space: space, error: '' };
  if( space ){
    fs.readdir( './public/imgs/', function( err, files ){
      if( err ){
        options.error = err;
      }else{
        var fileList = [];
        files.filter( function( file ){
          return file.startsWith( space ) && file.endsWith( ".png" );
        }).forEach( function( file ){
          fileList.push( file );
        });
        options.files = fileList;
      }

      var p = ejs.render( training_template, options );
      res.write( p );
      res.end();
    });
  }else{
    options.error = 'No space specified.';
    options.files = [];

    var p = ejs.render( training_template, options );
    res.write( p );
    res.end();
  }
});

app.delete( '/list', function( req, res ){
  var space = req.body.space;

  fs.readdir( './public/imgs/', function( err, files ){
    if( err ){
      options.error = err;
    }else{
      var fileList = [];
      files.filter( function( file ){
        return file.startsWith( space ) && file.endsWith( ".png" );
      }).forEach( function( file ){
        fs.unlink( 'public/imgs/' + file, function( err ){} );
      });
    }
  });

  res.write( space );
  res.end();
});

/*
app.get( '/getimage', function( req, res ){
  var image_id = req.query.id;
  //var image_url = "//" + settings.cloudant_username + ":" + settings.cloudant_password + "@" + settings.cloudant_username + ".cloudant.com/" + settings.cloudant_db + "/" + image_id + "/image";
  spendb.attachment.get( image_id, "image", function( err1, body1 ){
    res.contentType( 'image/png' );
    res.end( body1, 'binary' );
  });
});
*/

app.listen( appEnv.port );
console.log( "server stating on " + appEnv.port + " ..." );

