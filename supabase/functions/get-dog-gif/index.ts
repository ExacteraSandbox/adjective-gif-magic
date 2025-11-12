import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { adjective } = await req.json();
    console.log('Received adjective:', adjective);

    if (!adjective) {
      return new Response(
        JSON.stringify({ error: 'Adjective is required' }), 
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const GIPHY_API_KEY = Deno.env.get('GIPHY_API_KEY');
    if (!GIPHY_API_KEY) {
      console.error('GIPHY_API_KEY not found');
      return new Response(
        JSON.stringify({ error: 'Giphy API key not configured' }), 
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Search Giphy for dog GIFs with the adjective
    const searchQuery = `${adjective} dog`;
    console.log('Searching Giphy for:', searchQuery);
    
    const giphyUrl = `https://api.giphy.com/v1/gifs/search?api_key=${GIPHY_API_KEY}&q=${encodeURIComponent(searchQuery)}&limit=10&rating=g`;
    
    const response = await fetch(giphyUrl);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Giphy API error:', response.status, errorText);
      return new Response(
        JSON.stringify({ error: 'Failed to search Giphy' }), 
        { status: response.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();
    console.log('Giphy API response:', data);
    
    if (!data.data || data.data.length === 0) {
      console.error('No GIFs found for query:', searchQuery);
      return new Response(
        JSON.stringify({ error: 'No dog GIFs found for that adjective' }), 
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get a random GIF from the first 10 results
    const randomIndex = Math.floor(Math.random() * data.data.length);
    const gifUrl = data.data[randomIndex].images.original.url;
    
    console.log('Found GIF URL:', gifUrl);
    return new Response(
      JSON.stringify({ gifUrl }), 
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in get-dog-gif function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }), 
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
