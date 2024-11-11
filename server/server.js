const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(bodyParser.json());

require('dotenv').config({path:'../.env'});
const url = process.env.MONGODB_URL;
const MongoClient = require('mongodb').MongoClient;
const client = new MongoClient(url);
client.connect();

const sgMail = require('@sendgrid/mail')
sgMail.setApiKey(process.env.SENDGRID_API_KEY)

app.post('/api/login', async (req, res, next) => 
{
  // incoming: login, password
  // outgoing: id, firstName, lastName, error
  
  var error = '';

  const { Email, Password } = req.body;

  const db = client.db('PeerGroupFinder');
  const results = await db.collection('Users').find({Email:Email,Password:Password}).toArray();

  var id = -1;
  var fn = '';
  var ln = '';

  if( results.length > 0 )
  {
    id = results[0].UserId;
    fn = results[0].FirstName;
    ln = results[0].LastName;
  }

  var ret = { UserId:id, FirstName:fn, LastName:ln, error:''};
  res.status(200).json(ret);
});

// Registers a user.
// Also, creates a verification code and adds it as a field to the user, then sends the verification code to the user's email.
app.post('/api/register', async (req, res, next) =>
{ 
  const { FirstName, LastName, DisplayName, Email, Password } = req.body;

  const emptyArray = [];
  var error = '';

  const db = client.db('PeerGroupFinder');
  const results = await db.collection('Users').find({Email:Email}).toArray();

  var isEmailInUse = results.length > 0;
  if(isEmailInUse){
    error = "Email is already in use";
    var ret = { UserId: -1, error: error };
    res.status(200).json(ret);
    return;
  }

  const verificationCode = Math.floor(Math.random() * 9000) + 1000;

  const newUser = {FirstName:FirstName,LastName:LastName,DisplayName:DisplayName,Email:Email,Password:Password,Group:emptyArray, VerificationCode:verificationCode};

  var result;
  var user;
  try
  {
    result = await db.collection('Users').insertOne(newUser);
    user = await db.collection("Users").findOne({ _id : result.insertedId} );
  }
  catch(e)
  {
    error = e.toString();
  }

  const msg = {
    to: Email, // Change to your recipient
    from: 'peerstudygroupfinder@gmail.com', // Change to your verified sender
    subject: 'PeerStudyGroupFinder: Email Verification',
    text: `Here is your verification code: ${verificationCode}\n\nPlease do not share this code with anyone.`,
  }
  
  await sgMail
    .send(msg)
    .then(() => {
    console.log('Email sent')
    })
    .catch((error) => {
      console.error(error)
    })

  var ret = { UserId: user.UserId, error: error };
  res.status(200).json(ret);
});

// Verifies that the user input the correct verification code.
app.post('/api/verifyemail', async (req, res, next) => {

  // incoming: UserId, InputVerificationCode
  // outgoing: error

  var error = '';

  const { UserId, InputVerificationCode } = req.body;

  try {

    const db = client.db('PeerGroupFinder');
    const result = await db.collection('Users').findOne({UserId:UserId});

    const verificationCode = result.VerificationCode;

    if (verificationCode === InputVerificationCode) {
      res.status(200).json({error:error});
    }
    else {
      error = "Verification code does not match";
      res.status(600).json({error:error});
    }

  }
  catch (e) {
    error = e.toString();
    res.status(600).json({error:error});
  }

});

// Updates user's verification code with a new code and sends the new code to the user's email.
app.post('/api/resendverificationemail', async (req, res, next) => {

  // incoming: UserId
  // Outgoing: error

  var error = '';

  const { UserId } = req.body;
  const verificationCode = Math.floor(Math.random() * 9000) + 1000;

  try {
    
    const db = client.db('PeerGroupFinder');

    const user = await db.collection('Users').findOne({ UserId: UserId});

    const msg = {
      to: user.Email, // Change to your recipient
      from: 'peerstudygroupfinder@gmail.com', // Change to your verified sender
      subject: 'PeerStudyGroupFinder: Resend Email Verification',
      text: `Here is your new verification code: ${verificationCode}\n\nPlease do not share this code with anyone.`,
    }
    
    await sgMail
      .send(msg)
      .then(() => {
      console.log('Email sent')
      })
      .catch((error) => {
        console.error(error)
      })

    const response = await db.collection('Users').updateOne(
      {UserId: UserId},
      {$set: {VerificationCode: verificationCode}}
    );

    res.status(200).json({error:error});
  }
  catch (e) {
    error = e.toString();
    res.status(600).json({error:error});
  }
});

app.post('/api/changepassword', async (req, res, next) => {
  var error = '';

  const {UserId, Password}  = req.body;

  const db = client.db('PeerGroupFinder');
  
  console.log(Password);

  try{
    const response = await db.collection('Users').updateOne(
      {UserId: UserId},
      {$set: {Password: Password}}
    );

    console.log(response.matchedCount);
  }
  catch(e) {
    error = e.toString();
  }
  
  var ret = {error:''};
  res.status(200).json(ret);

});

app.post('/api/addgroup', async (req, res, next) =>
{
  // incoming: Class (code), Name, Owner, Link, Modality, Description, Size
  // outgoing: error
	
  const { Class, Name, Owner, Link, Modality, Description, Size, Location, MeetingTime} = req.body;

  const Students = [Owner];
  const newGroup = {Class:Class, Name:Name, Owner:Owner, Link:Link, Modality:Modality, Description:Description, Students:Students, Size:Size, Location:Location, MeetingTime:MeetingTime};
  var error = '';

  try
  {
    const db = client.db('PeerGroupFinder');
    const result = db.collection('Groups').insertOne(newGroup);
  }
  catch(e)
  {
    error = e.toString();
  }

  var ret = { error: error };
  res.status(200).json(ret);
});

app.post('/api/searchgroups', async (req, res, next) => 
{
  // incoming: UserId, search
  // outgoing: results[], error

  // Currently uses Leinecker's searchcards outline, so searches through each group for the specified class.
  // Could be changed to search for the class and return the array of groups that belong to the class.

  var error = '';

  const { UserId, Search } = req.body;

  var _search = Search.trim();
  
  const db = client.db('PeerGroupFinder');
  const results = await db.collection('Groups').find({"Class":{$regex:_search+'.*', $options:'i'}}).toArray();
  
  var _ret = [];
  for( var i=0; i<results.length; i++ )
  {
    _ret.push( results[i].Name );
  }
  
  var ret = {results:_ret, error:error};
  res.status(200).json(ret);
});


// Adds the UserId to the Students array for the group, and adds the GroupId to the group array for the user.
app.post('/api/joingroup', async (req, res, next) => 
{
    // incoming: UserId, GroupId
    // outgoing: error
    
    var error = '';
  
    const { UserId, GroupId } = req.body;
  
    try {
      const db = client.db('PeerGroupFinder');

      const result = await db.collection('Users').updateOne(
        {UserId: UserId},
        {$addToSet: {Group: GroupId}}
      );

      const result2 = await db.collection('Groups').updateOne(
        {GroupId: GroupId},
        {$addToSet: {Students: UserId}}
      );
    }
    catch(e) {
      error = e.toString();
    }
    
    var ret = {error:''};
    res.status(200).json(ret);
});

// Deletes UserId from the Students array for the group, and deletes GroupId from the group array for the user.
app.post('/api/leavegroup', async (req, res, next) =>
{
  // incoming: UserId, GroupId
  // outgoing: error

  var error = '';

  const { UserId, GroupId } = req.body;

  try {
    const db = client.db('PeerGroupFinder');

    const result = await db.collection('Users').updateOne(
      {UserId: UserId},
      {$pull: {Group: GroupId}}
    );

    const result2 = await db.collection('Groups').updateOne(
      {GroupId: GroupId},
      {$pull: {Students: UserId}}
    );
  }
  catch(e) {
    error = e.toString();
  }

  var ret = {error: error};

  if (!error)
    res.status(200).json(ret);
  else
    res.status(404).json(ret);

});


// Deletes the group and updates all the users as necessary.
// NOTICE: Will most likely be changed to utilize js promises!
app.post('/api/deletegroup', async (req, res, next) =>
{
  // incoming: UserId, GroupId
  // outgoing: error

  var error = '';

  const {UserId, GroupId, Owner, Students} = req.body;

  if (UserId !== Owner) {
    error = "User is not Owner of group";
    res.status(404).json({error: error});
    return;
  }

  try {
    const db = client.db('PeerGroupFinder');

    // Deletes the GroupId from the ownerofgroup array of the user.
    const result = await db.collection('Users').updateOne(
      {UserId: UserId},
      {$pull: {OwnerOfGroup: GroupId}}
    );

    // Deletes the GroupId from the group array of each user in the group's Students array.
    const result2 = await db.collection('Users').updateMany(
      {UserId: {$in: Students}},
      {$pull: {Group: GroupId}}
    );

    // Deletes the group from the groups collection.
    const result3 = await db.collection('Groups').deleteOne(
      {GroupId: GroupId}
    );
  }
  catch(e) {
    error = e.toString();
  }

  var ret = {error:error};

  if (!error)
    res.status(200).json(ret);
  else
    res.status(600).json(ret);
});

app.post('/api/addclass')

app.use((req, res, next) => 
{
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept, Authorization'
  );
  res.setHeader(
    'Access-Control-Allow-Methods',
    'GET, POST, PATCH, DELETE, OPTIONS'
  );
  next();
});

const server = app.listen(5000); // start Node + Express server on port 5000

module.exports = { app, server };