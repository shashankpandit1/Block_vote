import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import bcrypt from 'bcryptjs'; 
import { VotingBlockChain, Vote, ec } from './votingSystem.js'; // Blockchain logic
import { v4 as uuidv4 } from 'uuid'; // For generating unique login ID

const app = express();
const port = process.env.PORT || 4000;



// Middleware setup
app.use(cors());
app.use(bodyParser.json());

// Initialize Blockchain instance
const votingChain = new VotingBlockChain();

// Sample candidates data (you can modify this or pull from a database if needed)
const candidates = [
  { id: 1, name: 'Candidate A' },
  { id: 2, name: 'Candidate B' },
  { id: 3, name: 'Candidate C' },
];

// Route to fetch the list of candidates
app.get('/candidates', (req, res) => {
  res.json(candidates);
});

// Helper function to generate a secure random password for voters
const generateRandomPassword = () => {
  const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+';
  let password = '';
  for (let i = 0; i < 12; i++) {
    const randomIndex = Math.floor(Math.random() * charset.length);
    password += charset[randomIndex];
  }
  return password;
};



// Route to register a voter
// app.post('/register', async (req, res) => {
//   try {
//     const { voterName, aadharNumber, mobileNumber, age } = req.body;

//     // Ensure all required fields are provided
//     if (!voterName || !aadharNumber || !mobileNumber || !age) {
//       return res.status(400).json({ error: 'All fields are required!' });
//     }

//     // Generate a unique login ID using mobile number (UUID is optional)
//     const loginId = mobileNumber;  // Using mobile number as login ID

//     // Generate a random password for the voter
//     const password = generateRandomPassword();
    
//     // Hash the password securely using bcrypt
//     const hashedPassword = await bcrypt.hash(password, 10);

//     // Generate public/private key pair for the voter using elliptic curve
//     const key = ec.genKeyPair();
//     const publicKey = key.getPublic('hex');
//     const privateKey = key.getPrivate('hex');

//     // Store the voter details (you can save these to a database if needed)
//     const voterDetails = {
//       voterName,
//       aadharNumber,
//       mobileNumber,
//       age,
//       loginId,
//       password: hashedPassword, // Store hashed password
//       publicKey,
//       privateKey,
//     };

//     // Register the voter with the blockchain (add the voter to the blockchain)
//     votingChain.registerVoter(voterDetails.mobileNumber, voterDetails.aadharNumber, voterDetails, publicKey, privateKey);

//     // Send the response with login ID, password (to be shown to the user), and public key
//     res.json({ voterDetails, loginId, password });

//   } catch (err) {
//     console.error('Error during registration:', err);
//     res.status(500).json({ error: 'Internal server error' });
//   }
// });

// Route to authenticate voter (login)
  // app.post('/login', async (req, res) => {
  //   try {
  //     const { loginId, aadharNumber } = req.body;

  //     // Fetch the voter details from blockchain (assuming blockchain has voter data)
  //     const voter = [...votingChain.voters.values()].find(v => v.voterDetails.mobileNumber === loginId);

  //     if (!voter) {
  //       return res.status(404).json({ error: 'Voter not found' });
  //     }

  //     // Check if the Aadhar number matches the stored one for the given mobile number
  //     if (voter.voterDetails.aadharNumber === aadharNumber) {
  //       // Login successful, return the public key and login confirmation
  //       res.json({ message: 'Login successful', publicKey: voter.voterDetails.publicKey });
  //     } else {
  //       // Incorrect Aadhar number
  //       res.status(401).json({ error: 'Invalid Aadhar number' });
  //     }
  //   } catch (err) {
  //     console.error('Error during login:', err);
  //     res.status(500).json({ error: 'Internal server error' });
  //   }
  // });

  

  
  app.post('/register', async (req, res) => {
    try {
      const { voterName, aadharNumber, mobileNumber, age } = req.body;
  
      // Hash the Aadhar number (acting as password)
      const hashedPassword = await bcrypt.hash(aadharNumber, 10); // Hash the Aadhar number with salt rounds
  
      // Create a new key pair for the voter
      const keyPair = ec.genKeyPair();
      const publicKey = keyPair.getPublic('hex');
      const privateKey = keyPair.getPrivate('hex');
  
      // Store voter details (hashed password) in the blockchain
      const voterDetails = {
        voterName,
        aadharNumber,
        mobileNumber,
        age,
        password: hashedPassword,  // Store hashed password, not the plain text
        publicKey,
        privateKey,
      };
  
      // Register the voter to the blockchain
      votingChain.registerVoter(voterDetails, publicKey, privateKey);
  
      res.status(200).json({
        message: 'Registration successful',
        voterDetails: { publicKey, privateKey },  // Sending back public key and private key
      });
    } catch (err) {
      console.error('Error during registration:', err);
      res.status(500).json({ error: 'Error registering voter. Please try again.' });
    }
  });
  
  app.post('/login', async (req, res) => {
    try {
      const { loginId, password } = req.body;  // loginId = Aadhar number
  
      // Fetch the voter details from the blockchain (or wherever you're storing them)
      const voter = [...votingChain.voters.values()].find(v => v.voterDetails.loginId === loginId);
  
      if (!voter) {
        return res.status(404).json({ error: 'Voter not found' });
      }
  
      // Compare the entered password (Aadhar number) with the stored hashed password
      const match = await bcrypt.compare(password, voter.voterDetails.password);  // Using bcrypt to compare hashes
  
      if (match) {
        res.json({
          message: 'Login successful',
          publicKey: voter.voterDetails.publicKey,  // Return the public key if the login is successful
        });
      } else {
        res.status(401).json({ error: 'Invalid password' });
      }
    } catch (err) {
      console.error('Error during login:', err);
      res.status(500).json({ error: 'Internal server error' });
    }
  });
  


// Route to cast a vote
app.post('/vote', (req, res) => {
  const { voterId, candidate, privateKey } = req.body;

  try {
    // Create a new vote
    const vote = new Vote(voterId, candidate);

    // Sign the vote using the voter's private key
    vote.signVote(ec.keyFromPrivate(privateKey));

    // Add the vote to the blockchain and mine it
    votingChain.addVote(vote);
    votingChain.minePendingVotes();

    // Return success response
    res.status(200).send('Vote cast successfully.');
  } catch (error) {
    console.error('Vote submission error:', error);
    res.status(400).send('Failed to cast vote.');
  }
});

// Route to get voting results (total votes for each candidate)
app.get('/results', (req, res) => {
  try {
    const results = votingChain.countVotes();
    res.json({ results });
  } catch (err) {
    console.error('Error fetching results:', err);
    res.status(500).json({ error: 'Error fetching results' });
  }
});

// Route to validate the blockchain integrity
app.get('/validate', (req, res) => {
  try {
    const isValid = votingChain.isChainValid();
    res.json({ isValid });
  } catch (err) {
    console.error('Error validating chain:', err);
    res.status(500).json({ error: 'Error validating blockchain' });
  }
});

// API to mine votes and add them to the blockchain
app.get('/mine', (req, res) => {
  try {
    // Trigger the mining process to process pending votes
    votingChain.minePendingVotes();
    res.status(200).send('Votes have been mined successfully.');
  } catch (error) {
    console.error('Error mining votes:', error);
    res.status(500).send('Failed to mine votes.');
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
