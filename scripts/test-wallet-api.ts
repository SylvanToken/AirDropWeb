// Test wallet API response
async function testWalletAPI() {
  try {
    const response = await fetch('http://localhost:3333/api/users/wallet', {
      headers: {
        'Cookie': 'next-auth.session-token=YOUR_SESSION_TOKEN_HERE'
      }
    });

    const data = await response.json();
    console.log('=== Wallet API Response ===');
    console.log('Status:', response.status);
    console.log('Data:', JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Error:', error);
  }
}

testWalletAPI();
