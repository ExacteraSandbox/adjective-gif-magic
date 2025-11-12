import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, Sparkles } from "lucide-react";

const Index = () => {
  const [adjective, setAdjective] = useState("");
  const [gifUrl, setGifUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!adjective.trim()) {
      toast.error("Please enter an adjective!");
      return;
    }

    setIsLoading(true);
    setGifUrl("");

    try {
      const { data, error } = await supabase.functions.invoke('get-dog-gif', {
        body: { adjective: adjective.trim() }
      });

      if (error) {
        console.error('Function error:', error);
        toast.error("Failed to fetch dog GIF");
        return;
      }

      if (data?.gifUrl) {
        setGifUrl(data.gifUrl);
        toast.success("Found the perfect dog!");
      } else {
        toast.error("No GIF found");
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error("Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted to-secondary/20 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl space-y-8">
        <div className="text-center space-y-3 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="flex items-center justify-center gap-2">
            <Sparkles className="w-10 h-10 text-primary animate-pulse" />
            <h1 className="text-5xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
              Dog GIF Finder
            </h1>
          </div>
          <p className="text-lg text-muted-foreground">
            Describe a dog with an adjective and watch the magic happen! 🐕
          </p>
        </div>

        <Card className="p-8 shadow-2xl border-2 animate-in fade-in slide-in-from-bottom-5 duration-700 delay-150">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="adjective" className="text-sm font-medium text-foreground">
                Enter an adjective
              </label>
              <Input
                id="adjective"
                type="text"
                placeholder="e.g., happy, sleepy, excited..."
                value={adjective}
                onChange={(e) => setAdjective(e.target.value)}
                disabled={isLoading}
                className="h-12 text-lg border-2 focus:border-primary transition-all"
              />
            </div>

            <Button 
              type="submit" 
              disabled={isLoading}
              className="w-full h-12 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Finding the perfect dog...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-5 w-5" />
                  Find Dog GIF
                </>
              )}
            </Button>
          </form>
        </Card>

        {gifUrl && (
          <Card className="p-4 shadow-2xl border-2 animate-in fade-in zoom-in duration-500">
            <div className="relative overflow-hidden rounded-lg bg-muted">
              <img 
                src={gifUrl} 
                alt={`${adjective} dog`}
                className="w-full h-auto object-contain max-h-[500px] mx-auto"
                onError={() => {
                  toast.error("Failed to load GIF");
                  setGifUrl("");
                }}
              />
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Index;
