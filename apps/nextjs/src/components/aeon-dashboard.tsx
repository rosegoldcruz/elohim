"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@aeon/ui/card";
import { Button } from "@aeon/ui/button";
import { Badge } from "@aeon/ui/badge";
import { Progress } from "@aeon/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@aeon/ui/tabs";
import * as Icons from "@aeon/ui/icons";
import { cn } from "@aeon/ui";
import { ModelSourceSettings } from "./model-source-settings";

interface AeonDashboardProps {
  user: {
    id: string;
    name: string;
    email: string;
    image?: string;
  };
}

export function AeonDashboard({ user }: AeonDashboardProps) {
  const [activeProjects, setActiveProjects] = useState(3);
  const [completedVideos, setCompletedVideos] = useState(12);
  const [creditsRemaining, setCreditsRemaining] = useState(850);
  const [agentStatus, setAgentStatus] = useState({
    scriptWriter: 'idle',
    visualGenerator: 'processing',
    editor: 'idle',
    scheduler: 'idle',
    business: 'completed',
    monetization: 'idle'
  });

  const agents = [
    {
      id: 'script-writer',
      name: 'ScriptWriter Agent',
      description: 'Generates compelling video scripts and narratives',
      status: agentStatus.scriptWriter,
      icon: Icons.FileText,
      color: 'from-aeon-gold to-aeon-gold-dark'
    },
    {
      id: 'visual-generator',
      name: 'VisualGenerator Agent',
      description: 'Creates stunning visuals using Replicate AI',
      status: agentStatus.visualGenerator,
      icon: Icons.Image,
      color: 'from-aeon-violet to-aeon-violet-dark'
    },
    {
      id: 'editor',
      name: 'Editor Agent',
      description: 'Handles video editing and post-production',
      status: agentStatus.editor,
      icon: Icons.Video,
      color: 'from-aeon-gold to-aeon-violet'
    },
    {
      id: 'scheduler',
      name: 'Scheduler Agent',
      description: 'Manages content calendars and publishing',
      status: agentStatus.scheduler,
      icon: Icons.Calendar,
      color: 'from-aeon-violet to-aeon-gold'
    },
    {
      id: 'business',
      name: 'Business Agent',
      description: 'Optimizes for engagement and conversion',
      status: agentStatus.business,
      icon: Icons.TrendingUp,
      color: 'from-aeon-gold to-aeon-violet-dark'
    },
    {
      id: 'monetization',
      name: 'Monetization Agent',
      description: 'Implements revenue strategies and analytics',
      status: agentStatus.monetization,
      icon: Icons.DollarSign,
      color: 'from-aeon-violet-dark to-aeon-gold'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'processing': return 'bg-aeon-violet';
      case 'completed': return 'bg-aeon-gold';
      case 'error': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'processing': return 'Processing';
      case 'completed': return 'Completed';
      case 'error': return 'Error';
      default: return 'Idle';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-aeon-gold to-aeon-violet bg-clip-text text-transparent">
              AEON Dashboard
            </h1>
            <p className="text-gray-400 mt-2">Advanced Efficient Optimized Network</p>
          </div>
          <div className="flex items-center space-x-4">
            <Badge variant="outline" className="border-aeon-gold text-aeon-gold">
              {creditsRemaining} Credits
            </Badge>
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-aeon-gold to-aeon-violet flex items-center justify-center">
              <span className="text-black font-bold text-sm">
                {user.name?.charAt(0) || 'U'}
              </span>
            </div>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-gray-900/50 border-gray-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">Active Projects</CardTitle>
              <Icons.FolderOpen className="h-4 w-4 text-aeon-gold" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{activeProjects}</div>
              <p className="text-xs text-gray-400">+2 from last week</p>
            </CardContent>
          </Card>

          <Card className="bg-gray-900/50 border-gray-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">Videos Generated</CardTitle>
              <Icons.Video className="h-4 w-4 text-aeon-violet" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{completedVideos}</div>
              <p className="text-xs text-gray-400">+4 from last week</p>
            </CardContent>
          </Card>

          <Card className="bg-gray-900/50 border-gray-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">Credits Used</CardTitle>
              <Icons.Zap className="h-4 w-4 text-aeon-gold" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{1000 - creditsRemaining}</div>
              <Progress value={(1000 - creditsRemaining) / 10} className="mt-2" />
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="agents" className="space-y-6">
          <TabsList className="bg-gray-900/50 border border-gray-800">
            <TabsTrigger value="agents" className="data-[state=active]:bg-aeon-gold data-[state=active]:text-black">
              AI Agents
            </TabsTrigger>
            <TabsTrigger value="projects" className="data-[state=active]:bg-aeon-violet data-[state=active]:text-white">
              Projects
            </TabsTrigger>
            <TabsTrigger value="settings" className="data-[state=active]:bg-aeon-gold data-[state=active]:text-black">
              Settings
            </TabsTrigger>
            <TabsTrigger value="analytics" className="data-[state=active]:bg-aeon-gold data-[state=active]:text-black">
              Analytics
            </TabsTrigger>
          </TabsList>

          <TabsContent value="agents" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {agents.map((agent) => (
                <Card key={agent.id} className="bg-gray-900/50 border-gray-800 hover:border-aeon-gold/50 transition-colors">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className={cn(
                        "w-12 h-12 rounded-lg bg-gradient-to-r flex items-center justify-center",
                        agent.color
                      )}>
                        <agent.icon className="h-6 w-6 text-black" />
                      </div>
                      <Badge 
                        variant="outline" 
                        className={cn(
                          "border-0 text-white",
                          getStatusColor(agent.status)
                        )}
                      >
                        {getStatusText(agent.status)}
                      </Badge>
                    </div>
                    <CardTitle className="text-white">{agent.name}</CardTitle>
                    <CardDescription className="text-gray-400">
                      {agent.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button 
                      variant="outline" 
                      className="w-full border-aeon-gold text-aeon-gold hover:bg-aeon-gold hover:text-black"
                      disabled={agent.status === 'processing'}
                    >
                      {agent.status === 'processing' ? 'Processing...' : 'Configure'}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="projects" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-white">Recent Projects</h2>
              <Button className="bg-gradient-to-r from-aeon-gold to-aeon-violet text-black hover:opacity-90">
                <Icons.Plus className="h-4 w-4 mr-2" />
                New Project
              </Button>
            </div>
            
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="bg-gray-900/50 border-gray-800">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-white">AI Product Demo Video {i}</CardTitle>
                        <CardDescription className="text-gray-400">
                          Created 2 days ago • 3 agents active
                        </CardDescription>
                      </div>
                      <Badge variant="outline" className="border-aeon-violet text-aeon-violet">
                        Processing
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center space-x-4">
                      <Progress value={65} className="flex-1" />
                      <span className="text-sm text-gray-400">65%</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ModelSourceSettings
                onModelChange={(model) => {
                  console.log('Model changed to:', model);
                  // You can add additional logic here if needed
                }}
              />

              {/* Additional settings can be added here */}
              <Card className="bg-gray-900/50 border-gray-800">
                <CardHeader>
                  <CardTitle className="text-white">Platform Settings</CardTitle>
                  <CardDescription className="text-gray-400">
                    Configure your AEON platform preferences
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-gray-400 text-sm">
                    Additional platform settings will be available here.
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="bg-gray-900/50 border-gray-800">
                <CardHeader>
                  <CardTitle className="text-white">Performance Metrics</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Average Generation Time</span>
                    <span className="text-white font-semibold">2.3 minutes</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Success Rate</span>
                    <span className="text-aeon-gold font-semibold">98.5%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Credits per Video</span>
                    <span className="text-white font-semibold">12.5 avg</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gray-900/50 border-gray-800">
                <CardHeader>
                  <CardTitle className="text-white">Agent Usage</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">ScriptWriter</span>
                      <span className="text-white">85%</span>
                    </div>
                    <Progress value={85} />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">VisualGenerator</span>
                      <span className="text-white">92%</span>
                    </div>
                    <Progress value={92} />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Editor</span>
                      <span className="text-white">78%</span>
                    </div>
                    <Progress value={78} />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
