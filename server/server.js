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

async function sendEmail(msg){
  console.log("3");
  await sgMail
    .send(msg)
    .then(() => {
    console.log('Email sent')
    })
    .catch((error) => {
      console.error(error)
    })
}

// async function insertNewVerification(db, user, verificationCode, subject, text){
//   const msg = {
//     to: user.Email, // Change to your recipient
//     from: 'peerstudygroupfinder@gmail.com', // Change to your verified sender
//     subject: subject,
//     text: text,
//   }
//   console.log("2");
//   sendEmail(msg);

//   const response = await db.collection('Users').updateOne(
//     {UserId: user.UserId},
//     {$set: {VerificationCode: verificationCode}}
//   );
// }

async function insertNewVerification(db, user, verificationCode, emailType){

  // Add the repeated parts of the message.
  let msg = {
    to: user.Email, // Change to your recipient
    from: 'peerstudygroupfinder@gmail.com', // Change to your verified sender
    dynamicTemplateData: {
      FirstName: user.FirstName,
      VerificationCode: verificationCode
    }
  };

  // Conditionally choose which email template to send.
  if (emailType === 'emailVerification') {
    msg.templateId = 'd-ca82e12c51184afabcfc761f9a1353f0';
  }
  else if (emailType === 'forgotPassword') {
    msg.templateId = 'd-66c84a90f3c64061adca5fe3683f66a9';
  }

  console.log("2");
  sendEmail(msg);

  const response = await db.collection('Users').updateOne(
    {UserId: user.UserId},
    {$set: {VerificationCode: verificationCode}}
  );
}

app.post('/api/login', async (req, res, next) => 
{
  // incoming: Email, Password
  // outgoing: id, firstName, lastName, displayName, groups, error
  
  let error = '';
  
  const { Email, Password } = req.body;

  const db = client.db('PeerGroupFinder');
  const results = await db.collection('Users').find({ Email: Email, Password: Password }).toArray();

  let UserId = -1;
  let FirstName = '';
  let LastName = '';
  let DisplayName = '';
  let Group = [];

  if (results.length > 0) {
    UserId = results[0].UserId;
    FirstName = results[0].FirstName;
    LastName = results[0].LastName;
    DisplayName = results[0].DisplayName;
    Group = results[0].Group || []; // Ensure Groups is an array
  } else {
    error = 'Invalid Email or Password';
  }

  const ret = { 
    UserId,
    Email, 
    FirstName, 
    LastName, 
    DisplayName, 
    Group, 
    error 
  };
  
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
      
      // DB might take too long to add UserId, so retry at most 10 times (with 100 ms timeouts) to give the DB time to add UserId.
      for (let i = 0; i < 10; i++) {
        if (user.UserId) {
          console.log(`UserId found at ${i}.`);
          break;
        }
  
        await new Promise(resolve => setTimeout(resolve, 100));
        user = await db.collection("Users").findOne({ _id : result.insertedId});
      }
  
    }
    catch(e)
    {
      error = e.toString();
      res.status(600).json({error:error});
      return;
    }
  
    // const msg = {
    //   to: Email, // Change to your recipient
    //   from: 'peerstudygroupfinder@gmail.com', // Change to your verified sender
    //   subject: 'PeerStudyGroupFinder: Email Verification',
    //   text: `Here is your verification code: ${verificationCode}\n\nPlease do not share this code with anyone.`,
    // }
    
    // sendEmail(msg);
  
    insertNewVerification(db, user, verificationCode, 'emailVerification');
  
    var ret = { UserId: user.UserId, error: error };
    res.status(200).json(ret);
  });
  


// Verifies that the user input the correct verification code.
app.post('/api/verifyemail', async (req, res, next) => {
  const { UserId, InputVerificationCode } = req.body;
  console.log("Request Body:", req.body);

  try {
    const db = client.db('PeerGroupFinder');

    // Convert UserId to an integer for the query
    const userIdInt = parseInt(UserId, 10);

    const result = await db.collection('Users').findOne({ UserId: userIdInt });

    if (!result) {
      console.log("User not found with UserId:", userIdInt);
      return res.status(404).json({ error: 'User not found' });
    }

    console.log("Found user:", result);

    const verificationCode = result.VerificationCode;

    if (String(verificationCode) === String(InputVerificationCode)) {
      return res.status(200).json({ error: '' });
    } else {
      return res.status(400).json({ error: "Verification code does not match" });
    }

  } catch (e) {
    console.error("Error during verification:", e);
    return res.status(500).json({ error: e.toString() });
  }
});

app.post('/api/resendverificationemail', async (req, res, next) => {

  var error = '';

  const { UserId } = req.body;
  const db = client.db('PeerGroupFinder');
  const verificationCode = Math.floor(Math.random() * 9000) + 1000;

  try {
    const result = await db.collection('Users').findOne({UserId:UserId});
    // const subject = 'PeerStudyGroupFinder: Resend Email Verification';
    // const text = `Here is your new verification code: ${verificationCode}\n\nPlease do not share this code with anyone.`;
    insertNewVerification(db, result, verificationCode, 'emailVerification');
    res.status(200).json({error:error});
  }
  catch (e) {
    error = e.toString();
    res.status(600).json({error:error});
  }
});

app.post('/api/forgotpasswordverification', async (req, res, next) => {

  var error = '';
  const db = client.db('PeerGroupFinder');

  const { Email } = req.body;
  const verificationCode = Math.floor(Math.random() * 9000) + 1000;

  try {
    const result = await db.collection('Users').findOne({Email:Email});
    if(result == null){
      error = "There is no account associated with this email";
      res.status(200).json({error:error});
      return;
    }
    ;
    // const subject = 'PeerStudyGroupFinder: Forgot Password Verification'
    // const text = `Here is your verification code to change your password: ${verificationCode}\n\nPlease do not share this code with anyone.`;
    insertNewVerification(db, result, verificationCode, "forgotPassword");
    res.status(200).json({UserId: result.UserId, error:error});
  }
  catch (e) {
    error = e.toString();
    res.status(600).json({UserId: -1, error:error});
  }
});

app.post('/api/changepassword', async (req, res, next) => {
  const { UserId, Password } = req.body;

  const db = client.db('PeerGroupFinder');

  console.log("UserId:", UserId);
  console.log("Password:", Password);
  
  try {
    const user = await db.collection('Users').findOne({ UserId: UserId });
    //console.log("Current Password:", user.Password);
    //console.log("Attempting to Set Password to:", Password);

    const response = await db.collection('Users').updateOne(
      { UserId: UserId },
      { $set: { Password: Password } }
    );
    
    console.log("Response:", response);
    if (response.modifiedCount === 0) {
      return res.status(400).json({ error: 'Password was not updated, it may be the same as the current one' });
    }

    res.status(200).json({ message: 'Password updated successfully' });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Error updating password' });
  }
});

app.post('/api/addgroup', async (req, res, next) =>
  {
    // incoming: Class (code), Name, Owner, Link, Modality, Description, Size, Location, MeetingTime
    // outgoing: error
    
    const { Class, Name, Owner, Link, Modality, Description, Size, Location, MeetingTime} = req.body;
  
    const Students = [Owner];
    const newGroup = {
      Class: Class, 
      Name: Name, 
      Owner: Owner, 
      Link: Link, 
      Modality: Modality, 
      Description: Description, 
      Students: Students, 
      Size: Size, 
      Location: Location, 
      MeetingTime: MeetingTime
    };
    var error = '';
  
    try
    {
      const db = client.db('PeerGroupFinder');
      const result = await db.collection('Groups').insertOne(newGroup);
  
      let group = null;
      let retries = 0;
      const maxRetries = 10;
      
      while (retries < maxRetries) {
        group = await db.collection('Groups').findOne({_id: result.insertedId});
        
        if (group && group.GroupId) {
          console.log(`GroupId found after ${retries} retries`);
          break;
        }
        
        await new Promise(resolve => setTimeout(resolve, 100)); 
        retries++;
      }
  
      if (!group || !group.GroupId) {
        throw new Error('Failed to get GroupId after maximum retries');
      }
  
      const result2 = await db.collection('Users').updateOne(
        {UserId: Owner},
        {$addToSet: {
          OwnerOfGroup: group.GroupId, 
          Group: group.GroupId
        }}
      );
  
      if (result2.matchedCount === 0) {
        throw new Error('User not found');
      }
  
      if (result2.modifiedCount === 0) {
        console.log('Group IDs already existed in user arrays');
      }
  
      res.status(200).json({ error: '', groupId: group.GroupId });
    }
    catch(e)
    {
      error = e.toString();
      console.error('Error in addgroup:', error);
      res.status(500).json({ error: error });
      return;
    }
  });

app.get('/api/getgroupdetails', async (req, res, next) => {
  const { name } = req.query;

  const db = client.db('PeerGroupFinder');
  const group = await db.collection('Groups').findOne({ Name: name });

  if (!group) {
    res.status(404).json({ error: 'Group not found' });
    return;
  }

  res.status(200).json({
    description: group.Description,
    class: group.Class,
    size: group.Size,
    location: group.Location,
    meetingTime: group.MeetingTime,
    link: group.Link,
    owner: group.Owner,
    modality: group.Modality,
    createdAt: group.createdAt,
    groupId: group.GroupId,
    students: group.Students
  });
});

app.get('/api/getstudentinfo', async (req, res, next) => {
  try {
    const { studentId } = req.query;
    const db = client.db('PeerGroupFinder');
    
    const student = await db.collection('Users').findOne({ UserId: parseInt(studentId) });
    
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }
    
    res.status(200).json({
      firstName: student.FirstName,
      lastName: student.LastName
    });
  } catch (error) {
    console.error('Error fetching student info:', error);
    res.status(500).json({ error: 'An error occurred while fetching student info' });
  }
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


// Adds the userId to the students array for the group, and adds the groupId to the group array for the user.

// Updated /api/fetchgroups endpoint to return all groups
app.post('/api/fetchgroups', async (req, res, next) => {
  try {
    const db = client.db('PeerGroupFinder'); // Specify your DB name
    const groupsCollection = db.collection('Groups');

    // Fetch all groups without any filters
    const groups = await groupsCollection.find({}).toArray();
    console.log('Fetched groups:', groups);

    res.status(200).json({ results: groups });
  } catch (error) {
    console.error('Error fetching groups:', error);
    res.status(500).json({ error: 'An error occurred while fetching groups.' });
  }
});

// Adds the UserId to the Students array for the group, and adds the GroupId to the group array for the user.
app.post('/api/joingroup', async (req, res, next) => 
  {
  // Incoming: userId, groupId
    // Outgoing: error
    
    var error = '';
    
    const { UserId, GroupId } = req.body;
    
    try {
      if (!UserId || !GroupId) {
        throw new Error(`Missing required fields: UserId = ${UserId}, GroupId = ${GroupId}`);
      }
  
      const db = client.db('PeerGroupFinder');
  
      const result = await db.collection('Users').updateOne(
        { UserId: UserId },
        { $addToSet: { Group: GroupId } } // Note: 'Groups' field in Users collection
      );
  
      const result2 = await db.collection('Groups').updateOne(
        { GroupId: GroupId },
        { $addToSet: { Students: UserId } }
      );
    }
    catch(e) {
      error = e.toString();
    }
    
    var ret = { error: error };
    res.status(200).json(ret);
  });
  
// Deletes userId from the students array for the group, and deletes groupId from the group array for the user.
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

app.post('/api/editgroup', async (req, res, next) => {

  console.log('Edit group request received');

  const error = '';
  
  const db = client.db('PeerGroupFinder');

  const { UserId, GroupId, Class, Name, Owner, Link, Modality, Description, Size, Location, MeetingTime } = req.body;

  if (UserId !== Owner) {
    res.status(600).json({error: "User is not the Owner"});
    return;
  }

  try {

    const updateFields = {};
    if (Class) updateFields.Class = Class;
    if (Name) updateFields.Name = Name;
    if (Link) updateFields.Link = Link;
    if (Modality) updateFields.Modality = Modality;
    if (Description) updateFields.Description = Description;
    if (Size) updateFields.Size = Size;
    if (Location) updateFields.Location = Location;
    if (MeetingTime) updateFields.MeetingTime = MeetingTime;

    console.log(updateFields);
    console.log(GroupId);

    const result = await db.collection('Groups').updateOne(
      {GroupId:GroupId},
      {$set: updateFields}
    );

  }
  catch (e) {
    error = e.toString();
  }

  if (!error) {
    console.log('Edit group successful');
    res.status(200).json({error:error});
  }
  else {
    res.status(600).json({error:error});
  }

});

app.post('/api/kickstudent', async (req, res, next) => {

  const error = '';

  const db = client.db('PeerGroupFinder');

  const { UserId, GroupId, KickId } = req.body;

  try {

    const result2 = await db.collection('Groups').findOne({GroupId:GroupId});
    const Owner = result2.Owner;

    if (UserId !== Owner) {
      res.status(600).json({error: "User is not the Owner"});
      return;
    }
    
    const result = await db.collection('Groups').updateOne(
      {GroupId:GroupId},
      {$pull: {Students:KickId}}
    );

    const result3 = await db.collection('Users').updateOne(
      {UserId:KickId},
      {$pull: {Group:GroupId}}
    );

  }
  catch (e) {
    error = e.toString();
  }

  if (!error) {
    res.status(200).json({error:error});
  }
  else {
    res.status(600).json({error:error});
  }

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

const server = app.listen(8000); // start Node + Express server on port 5000

module.exports = { app, server };
