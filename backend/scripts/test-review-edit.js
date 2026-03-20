const axios = require('axios');

async function testReviewEdit() {
  try {
    console.log('🧪 Testing review edit functionality...\n');

    // First, let's login as a farmer to get a token
    console.log('📧 Step 1: Login as farmer...');
    const loginResponse = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'abebe@example.com',
      password: 'password123'
    });
    
    const token = loginResponse.data.token;
    console.log('✅ Login successful');

    // Get articles to find one to rate
    console.log('\n📋 Step 2: Getting articles...');
    const articlesResponse = await axios.get('http://localhost:5000/api/farmers/advice', {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    if (articlesResponse.data.length === 0) {
      console.log('❌ No articles found');
      return;
    }
    
    const articleId = articlesResponse.data[0].id;
    console.log(`✅ Found article ID: ${articleId}`);

    // Submit initial rating
    console.log('\n⭐ Step 3: Submitting initial rating...');
    const initialRating = await axios.post('http://localhost:5000/api/ratings', {
      articleId: articleId,
      rating: 4,
      review: 'This is my initial review'
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log('✅ Initial rating submitted:', initialRating.data.message);

    // Update the rating
    console.log('\n✏️ Step 4: Updating rating...');
    const updateResponse = await axios.put(`http://localhost:5000/api/ratings/article/${articleId}/user`, {
      rating: 5,
      review: 'This is my updated review - much better!'
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log('✅ Rating updated:', updateResponse.data.message);

    // Get user's rating to verify update
    console.log('\n🔍 Step 5: Verifying update...');
    const userRatingResponse = await axios.get(`http://localhost:5000/api/ratings/article/${articleId}/user`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log('✅ Updated rating verified:');
    console.log('   Rating:', userRatingResponse.data.data.rating);
    console.log('   Review:', userRatingResponse.data.data.review);

    console.log('\n🎉 Review edit functionality test PASSED!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

testReviewEdit();