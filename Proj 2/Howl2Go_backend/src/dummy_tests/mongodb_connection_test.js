import mongoose from 'mongoose';
import config from '../config/env.js';

/**
 * MongoDB Connection Test
 *
 * This script tests the MongoDB connection and verifies database accessibility.
 * Run with: node src/dummy_tests/mongodb_connection_test.js
 */

async function testMongoDBConnection() {
  console.log('🔍 Testing MongoDB Connection...\n');

  try {
    // Test 1: Connection
    console.log('Test 1: Connecting to MongoDB Atlas...');
    const conn = await mongoose.connect(config.mongodbUri);
    console.log('✅ Successfully connected to MongoDB!');
    console.log(`   Host: ${conn.connection.host}`);
    console.log(`   Database: ${conn.connection.name}`);
    console.log(`   Port: ${conn.connection.port || 'N/A (Atlas)'}\n`);

    // Test 2: Connection State
    console.log('Test 2: Checking connection state...');
    const state = mongoose.connection.readyState;
    const states = {
      0: 'disconnected',
      1: 'connected',
      2: 'connecting',
      3: 'disconnecting'
    };
    console.log(`✅ Connection state: ${states[state]}\n`);

    // Test 3: List Collections
    console.log('Test 3: Listing collections...');
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log(`✅ Found ${collections.length} collection(s):`);
    collections.forEach(col => {
      console.log(`   - ${col.name}`);
    });
    console.log();

    // Test 4: Database Stats
    console.log('Test 4: Retrieving database stats...');
    const stats = await mongoose.connection.db.stats();
    console.log('✅ Database Statistics:');
    console.log(`   Collections: ${stats.collections}`);
    console.log(`   Data Size: ${(stats.dataSize / 1024 / 1024).toFixed(2)} MB`);
    console.log(`   Storage Size: ${(stats.storageSize / 1024 / 1024).toFixed(2)} MB`);
    console.log(`   Indexes: ${stats.indexes}`);
    console.log(`   Index Size: ${(stats.indexSize / 1024 / 1024).toFixed(2)} MB\n`);

    // Test 5: Sample Query (if FastFoodItems collection exists)
    console.log('Test 5: Testing sample query...');
    const FastFoodItem = mongoose.model('FastFoodItem', new mongoose.Schema({}, { strict: false }));
    const count = await FastFoodItem.countDocuments();
    console.log(`✅ FastFoodItems collection has ${count} document(s)`);

    if (count > 0) {
      const sample = await FastFoodItem.findOne();
      console.log('   Sample document:');
      console.log(`   - Company: ${sample.company}`);
      console.log(`   - Item: ${sample.item}`);
      console.log(`   - Calories: ${sample.calories}`);
    }
    console.log();

    console.log('🎉 All tests passed successfully!\n');

  } catch (error) {
    console.error('❌ MongoDB Connection Test Failed:');
    console.error(`   Error: ${error.message}\n`);

    if (error.message.includes('ENOTFOUND') || error.message.includes('ETIMEDOUT')) {
      console.error('💡 Network Error: Check your internet connection and MongoDB Atlas IP whitelist.');
    } else if (error.message.includes('authentication')) {
      console.error('💡 Authentication Error: Verify your MongoDB username and password in .env file.');
    } else if (error.message.includes('MONGODB_URI')) {
      console.error('💡 Configuration Error: Make sure MONGODB_URI is set in your .env file.');
    }

    process.exit(1);
  } finally {
    // Close connection
    await mongoose.connection.close();
    console.log('🔌 Connection closed.');
  }
}

// Run the test
testMongoDBConnection();
