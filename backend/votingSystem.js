import SHA256 from 'crypto-js/sha256.js';
import pkg from 'elliptic';
const { ec: EC } = pkg;
const ec = new EC('secp256k1');

class Vote {
  constructor(voterAddress, candidate) {
    this.voterAddress = voterAddress;
    this.candidate = candidate;
  }

  calculateHash() {
    return SHA256(this.voterAddress + this.candidate).toString();
  }

  signVote(signingKey) {
    if (signingKey.getPublic('hex') !== this.voterAddress) {
      throw new Error('You cannot sign votes for other voters!');
    }
    const hashVote = this.calculateHash();
    const sig = signingKey.sign(hashVote, 'base64');
    this.signature = sig.toDER('hex');
  }

  isValid() {
    if (!this.signature || this.signature.length === 0) {
      throw new Error('No signature in this vote');
    }
    const publicKey = ec.keyFromPublic(this.voterAddress, 'hex');
    return publicKey.verify(this.calculateHash(), this.signature);
  }
}

class Block {
  constructor(timestamp, votes, previousHash = "") {
    this.timestamp = timestamp;
    this.votes = votes;
    this.previousHash = previousHash;
    this.hash = this.calculateHash();
    this.nonce = 0;
  }

  calculateHash() {
    return SHA256(this.previousHash + this.timestamp + JSON.stringify(this.votes) + this.nonce).toString();
  }

  mineBlock(difficulty) {
    while (this.hash.substring(0, difficulty) !== Array(difficulty + 1).join("0")) {
      this.nonce++;
      this.hash = this.calculateHash();
    }
    console.log("Block mined: " + this.hash);
  }

  hasValidVotes() {
    for (const vote of this.votes) {
      if (!vote.isValid()) {
        return false;
      }
    }
    return true;
  }
}

class VotingBlockChain {
  constructor() {
    this.chain = [this.createGenesisBlock()];
    this.difficulty = 2;
    this.pendingVotes = [];
    this.voters = new Map(); // Store voters by mobile number
  }

  createGenesisBlock() {
    return new Block("01/01/2024", [], "0");
  }

  getLatestBlock() {
    return this.chain[this.chain.length - 1];
  }

  minePendingVotes() {
    const block = new Block(Date.now(), this.pendingVotes, this.getLatestBlock().hash);
    block.mineBlock(this.difficulty);
    console.log("Block successfully mined!");
    this.chain.push(block);
    this.pendingVotes = [];
  }

  addVote(vote) {
    if (!vote.voterAddress || !vote.candidate) {
      throw new Error('Vote must include voter address and candidate');
    }
    if (!vote.isValid()) {
      throw new Error('Cannot add invalid vote');
    }
    if (this.voters.has(vote.voterAddress)) {
      throw new Error('Voter has already cast a vote');
    }
    this.pendingVotes.push(vote);
    this.voters.set(vote.voterAddress, true); // Prevents double voting
  }

  countVotes() {
    const voteCounts = {};
    for (const block of this.chain) {
      for (const vote of block.votes) {
        if (voteCounts[vote.candidate]) {
          voteCounts[vote.candidate]++;
        } else {
          voteCounts[vote.candidate] = 1;
        }
      }
    }
    return voteCounts;
  }

  isChainValid() {
    for (let i = 1; i < this.chain.length; i++) {
      const currentBlock = this.chain[i];
      const previousBlock = this.chain[i - 1];
      if (!currentBlock.hasValidVotes()) {
        return false;
      }
      if (currentBlock.hash !== currentBlock.calculateHash()) {
        return false;
      }
      if (currentBlock.previousHash !== previousBlock.hash) {
        return false;
      }
    }
    return true;
  }

  // Register voter with mobile number, Aadhar number, public/private keys
  registerVoter(mobileNumber, aadharNumber, voterDetails, publicKey, privateKey) {
    // Store voter data using mobile number as the key
    this.voters.set(mobileNumber, { voterDetails, publicKey, privateKey, aadharNumber });
    console.log('Voter registered:', voterDetails);
  }

  // Login voter using mobile number and Aadhar number
  loginVoter(mobileNumber, aadharNumber) {
    if (this.voters.has(mobileNumber)) {
      const voter = this.voters.get(mobileNumber);
      if (voter.aadharNumber === aadharNumber) {
        console.log('Login successful');
        return true;
      } else {
        console.log('Invalid Aadhar number');
        return false;
      }
    } else {
      console.log('Mobile number not registered');
      return false;
    }
  }
}

export { VotingBlockChain, Vote, ec };
