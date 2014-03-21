var mongoose = require( 'mongoose' );
var Schema   = mongoose.Schema;
 
var Chats = new Schema({
    user_id    : String,
    shortUrl    : String,
    updated_at : Date
});
 
mongoose.model( 'Chats', Chats );
mongoose.connect( 'mongodb://localhost/whisperchat' );