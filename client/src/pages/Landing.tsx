import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <div className="flex items-center justify-center mb-6">
            <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center">
              <i className="fab fa-twitter text-white text-2xl"></i>
            </div>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
            MotivateBot
          </h1>
          <p className="text-xl text-blue-200 mb-8 max-w-3xl mx-auto">
            Automate your Twitter presence with AI-powered motivational content. 
            Inspire your audience with intelligent scheduling and engaging posts.
          </p>
          <Button 
            size="lg" 
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 text-lg"
            onClick={() => window.location.href = '/api/login'}
          >
            Get Started
          </Button>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center mb-4">
                <i className="fas fa-robot text-white text-xl"></i>
              </div>
              <CardTitle className="text-white">AI-Powered Content</CardTitle>
              <CardDescription className="text-slate-300">
                Generate engaging motivational tweets using advanced AI technology
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center mb-4">
                <i className="fas fa-calendar-alt text-white text-xl"></i>
              </div>
              <CardTitle className="text-white">Smart Scheduling</CardTitle>
              <CardDescription className="text-slate-300">
                Automatically schedule and post content at optimal times
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mb-4">
                <i className="fas fa-chart-line text-white text-xl"></i>
              </div>
              <CardTitle className="text-white">Analytics Dashboard</CardTitle>
              <CardDescription className="text-slate-300">
                Track engagement and optimize your content strategy
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        <div className="text-center">
          <h2 className="text-3xl font-bold text-white mb-6">
            Ready to inspire your audience?
          </h2>
          <p className="text-blue-200 mb-8">
            Join thousands of creators using MotivateBot to grow their Twitter presence
          </p>
          <Button 
            size="lg" 
            variant="outline" 
            className="border-blue-600 text-blue-400 hover:bg-blue-600 hover:text-white"
            onClick={() => window.location.href = '/api/login'}
          >
            Sign In to Continue
          </Button>
        </div>
      </div>
    </div>
  );
}
