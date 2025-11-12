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
    console.log('Searching for corgi gif with adjective:', adjective);

    const giphyApiKey = Deno.env.get('GIPHY_API_KEY');
    if (!giphyApiKey) {
      throw new Error('GIPHY_API_KEY not configured');
    }

    // Search for corgi gifs with the adjective
    const searchQuery = `${adjective} corgi`;
    const giphyUrl = `https://api.giphy.com/v1/gifs/search?api_key=${giphyApiKey}&q=${encodeURIComponent(searchQuery)}&limit=10&rating=g`;
    
    const response = await fetch(giphyUrl);
    const data = await response.json();

    if (!data.data || data.data.length === 0) {
      console.log('No gifs found, returning error');
      return new Response(
        JSON.stringify({ error: 'No corgi GIF found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Pick a random gif from the results
    const randomIndex = Math.floor(Math.random() * data.data.length);
    const gifUrl = data.data[randomIndex].images.original.url;

    console.log('Returning gif URL:', gifUrl);

    return new Response(
      JSON.stringify({ gif_url: gifUrl }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in get-corgi-gif function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
