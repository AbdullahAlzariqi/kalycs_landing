exports.handler = async (event, context) => {
  // Return Supabase configuration from environment variables
  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=300' // Cache for 5 minutes
    },
    body: JSON.stringify({
      url: process.env.SUPABASE_URL || '',
      anonKey: process.env.SUPABASE_ANON_KEY || ''
    })
  };
};
