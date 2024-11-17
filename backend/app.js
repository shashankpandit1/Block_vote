import { VotingBlockChain, Vote, ec } from './votingSystem.js'; // Blockchain logic
import inquirer from 'inquirer';
import bcrypt from 'bcryptjs';
import fs from 'fs';

// Create a new voting blockchain instance
const votingSystem = new VotingBlockChain();

// Helper function to generate a random password (if needed)
const generateRandomPassword = () => {
  const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+';
  let password = '';
  for (let i = 0; i < 12; i++) {
    const randomIndex = Math.floor(Math.random() * charset.length);
    password += charset[randomIndex];
  }
  return password;
};

// Function to register a voter (using command line for simplicity in this file)
async function registerVoter() {
  const { voterName, aadharNumber, mobileNumber, age } = await inquirer.prompt([
    {
      name: 'voterName',
      message: 'Enter voter name:',
    },
    {
      name: 'aadharNumber',
      message: 'Enter Aadhar number:',
    },
    {
      name: 'mobileNumber',
      message: 'Enter mobile number:',
    },
    {
      name: 'age',
      message: 'Enter age:',
    },
  ]);

  // Generate a unique login ID using the mobile number
  const loginId = mobileNumber;  // Using mobile number as login ID

  // Hash the Aadhar number (used as password)
  const password = await bcrypt.hash(aadharNumber, 10);

  // Generate public/private key pair for the voter
  const keyPair = ec.genKeyPair();
  const privateKey = keyPair.getPrivate('hex');
  const publicKey = keyPair.getPublic('hex');

  // Store voter details
  const voterDetails = {
    voterName,
    aadharNumber,
    mobileNumber,
    age,
    loginId,
    password,  // Store hashed password (Aadhar number)
    publicKey,
    privateKey,
  };

  // Register the voter in the blockchain
  votingSystem.registerVoter(voterDetails, publicKey, privateKey);

  console.log(`Voter ${voterName} registered.`);
  console.log(`Public Key: ${publicKey}`);
  console.log(`Private Key: ${privateKey} (Keep this secure!)`);

  return { voterDetails, privateKey, publicKey };
}

// Function to authenticate the voter (login using mobile number and Aadhar number)
async function authenticateVoter() {
  const { loginId, aadharNumber } = await inquirer.prompt([
    {
      name: 'loginId',
      message: 'Enter your mobile number (Login ID):',
    },
    {
      name: 'aadharNumber',
      message: 'Enter your Aadhar number (Password):',
    },
  ]);

  // Fetch the voter details (you can use the blockchain or a database here)
  const voter = [...votingSystem.voters.values()].find(v => v.voterDetails.loginId === loginId);

  if (!voter) {
    console.log('Voter not found!');
    return null;
  }

  // Compare the provided Aadhar number (password) with the stored hashed password
  const isPasswordValid = await bcrypt.compare(aadharNumber, voter.voterDetails.password);

  if (isPasswordValid) {
    console.log('Authentication successful!');
    return voter.voterDetails;
  } else {
    console.log('Invalid Aadhar number!');
    return null;
  }
}

// Function to cast a vote (voter can choose candidate via terminal input)
async function castVote() {
  const voter = await authenticateVoter();

  if (!voter) {
    console.log('You must authenticate before voting!');
    return;
  }

  const { candidate } = await inquirer.prompt({
    name: 'candidate',
    message: 'Enter candidate you want to vote for:',
  });

  const signingKey = ec.keyFromPrivate(voter.privateKey);
  const vote = new Vote(voter.publicKey, candidate);
  vote.signVote(signingKey);

  // Add the vote to the blockchain
  try {
    votingSystem.addVote(vote);
    console.log(`Vote cast for ${candidate}`);
  } catch (error) {
    console.error(error.message);
  }
}

// Function to mine pending votes
async function mineVotes() {
  votingSystem.minePendingVotes();
  console.log('Votes have been mined and added to the blockchain.');
}

// Function to view voting results
function viewResults() {
  const results = votingSystem.countVotes();
  console.log('Voting Results:', results);
}

// Function to validate the integrity of the blockchain
function validateBlockchain() {
  const isValid = votingSystem.isChainValid();
  console.log(`Blockchain integrity is ${isValid ? 'valid' : 'corrupted'}.`);
}

// Main function to interact with the blockchain via terminal (CLI)
async function main() {
  while (true) {
    const { action } = await inquirer.prompt({
      type: 'list',
      name: 'action',
      message: 'Select an action:',
      choices: [
        'Register as a voter',
        'Cast a vote',
        'Mine votes',
        'View voting results',
        'Validate blockchain',
        'Exit',
      ],
    });

    switch (action) {
      case 'Register as a voter':
        await registerVoter();
        break;
      case 'Cast a vote':
        await castVote(); // Authenticate and allow casting a vote
        break;
      case 'Mine votes':
        await mineVotes(); // Mine pending votes
        break;
      case 'View voting results':
        viewResults(); // View current results
        break;
      case 'Validate blockchain':
        validateBlockchain(); // Validate blockchain integrity
        break;
      case 'Exit':
        process.exit(); // Exit the app
    }
  }
}

// Start the main function
main();
