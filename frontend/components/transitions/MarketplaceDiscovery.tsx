'use client';

/**
 * AEON Marketplace Discovery - Browse and Purchase Community Transitions
 * Discover, preview, and purchase user-created viral transitions
 */

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Search, 
  Filter, 
  Star, 
  Download, 
  Play, 
  Zap, 
  TrendingUp, 
  Crown, 
  Heart,
  ShoppingCart,
  Eye
} from 'lucide-react';
import { marketplaceAgent, type CreatorTransition } from '@/lib/agents/MarketplaceAgent';

interface MarketplaceFilters {
  category: string;
  sortBy: 'viral_score' | 'created_at' | 'usage_count' | 'price';
  sortOrder: 'asc' | 'desc';
  maxPrice: number;
  minViralScore: number;
  tags: string[];
}

export default function MarketplaceDiscovery() {
  const [transitions, setTransitions] = useState<CreatorTransition[]>([]);
  const [filteredTransitions, setFilteredTransitions] = useState<CreatorTransition[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTransition, setSelectedTransition] = useState<CreatorTransition | null>(null);
  const [userCredits, setUserCredits] = useState(100); // Would come from user profile

  const [filters, setFilters] = useState<MarketplaceFilters>({
    category: '',
    sortBy: 'viral_score',
    sortOrder: 'desc',
    maxPrice: 1000,
    minViralScore: 0,
    tags: []
  });

  // Load marketplace transitions
  useEffect(() => {
    loadTransitions();
  }, [filters]);

  // Filter transitions based on search
  useEffect(() => {
    let filtered = transitions;

    if (searchQuery) {
      filtered = filtered.filter(t => 
        t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    setFilteredTransitions(filtered);
  }, [transitions, searchQuery]);

  const loadTransitions = async () => {
    setLoading(true);
    try {
      const result = await marketplaceAgent.getMarketplaceTransitions({
        category: filters.category || undefined,
        minViralScore: filters.minViralScore,
        maxPrice: filters.maxPrice,
        tags: filters.tags.length > 0 ? filters.tags : undefined,
        sortBy: filters.sortBy,
        sortOrder: filters.sortOrder,
        limit: 50
      });
      setTransitions(result);
    } catch (error) {
      console.error('Failed to load transitions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async (transition: CreatorTransition) => {
    if (!transition.id || !transition.price) return;

    try {
      const result = await marketplaceAgent.purchaseTransition(
        transition.id,
        'current-user-id', // Would get from auth
        userCredits
      );

      if (result.success) {
        setUserCredits(prev => prev - (result.creditsUsed || 0));
        alert(`Transition purchased successfully! ${result.creditsUsed} credits used.`);
      } else {
        alert(`Purchase failed: ${result.error}`);
      }
    } catch (error) {
      alert('Purchase failed. Please try again.');
    }
  };

  const getViralScoreColor = (score: number) => {
    if (score >= 8) return 'text-green-400';
    if (score >= 6) return 'text-yellow-400';
    if (score >= 4) return 'text-orange-400';
    return 'text-red-400';
  };

  const getViralScoreIcon = (score: number) => {
    if (score >= 8) return <Crown className="w-4 h-4" />;
    if (score >= 6) return <TrendingUp className="w-4 h-4" />;
    return <Zap className="w-4 h-4" />;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
                <ShoppingCart className="text-purple-400" />
                Transition Marketplace
              </h1>
              <p className="text-gray-300">Discover viral transitions created by the community</p>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-400">Your Credits</div>
              <div className="text-2xl font-bold text-yellow-400">{userCredits}</div>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="mb-8 space-y-4">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search transitions, creators, or tags..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-gray-800 border-gray-600 text-white"
              />
            </div>
            <Button variant="outline" className="border-gray-600 text-gray-300">
              <Filter className="w-4 h-4 mr-2" />
              Filters
            </Button>
          </div>

          <div className="flex gap-4 flex-wrap">
            <Select value={filters.category} onValueChange={(value) => setFilters(prev => ({ ...prev, category: value }))}>
              <SelectTrigger className="w-48 bg-gray-800 border-gray-600 text-white">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Categories</SelectItem>
                <SelectItem value="tiktok-essentials">TikTok Essentials</SelectItem>
                <SelectItem value="glitch">Glitch Effects</SelectItem>
                <SelectItem value="3d-transforms">3D Transforms</SelectItem>
                <SelectItem value="cinematic">Cinematic</SelectItem>
                <SelectItem value="organic">Organic</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filters.sortBy} onValueChange={(value: any) => setFilters(prev => ({ ...prev, sortBy: value }))}>
              <SelectTrigger className="w-48 bg-gray-800 border-gray-600 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="viral_score">Viral Score</SelectItem>
                <SelectItem value="created_at">Newest</SelectItem>
                <SelectItem value="usage_count">Most Used</SelectItem>
                <SelectItem value="price">Price</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Marketplace Tabs */}
        <Tabs defaultValue="all" className="mb-8">
          <TabsList className="bg-gray-800 border-gray-600">
            <TabsTrigger value="all" className="text-gray-300">All Transitions</TabsTrigger>
            <TabsTrigger value="trending" className="text-gray-300">Trending</TabsTrigger>
            <TabsTrigger value="new" className="text-gray-300">New Releases</TabsTrigger>
            <TabsTrigger value="featured" className="text-gray-300">Featured</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-6">
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {[...Array(8)].map((_, i) => (
                  <Card key={i} className="bg-black/20 border-purple-500/20 animate-pulse">
                    <CardHeader>
                      <div className="h-4 bg-gray-700 rounded mb-2"></div>
                      <div className="h-3 bg-gray-700 rounded w-2/3"></div>
                    </CardHeader>
                    <CardContent>
                      <div className="aspect-video bg-gray-700 rounded mb-4"></div>
                      <div className="h-3 bg-gray-700 rounded mb-2"></div>
                      <div className="h-3 bg-gray-700 rounded w-1/2"></div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredTransitions.map((transition) => (
                  <Card key={transition.id} className="bg-black/20 border-purple-500/20 hover:border-purple-400/40 transition-all group">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-white text-lg mb-1">{transition.name}</CardTitle>
                          <CardDescription className="text-gray-400 text-sm">
                            by {transition.creatorId}
                          </CardDescription>
                        </div>
                        <div className={`flex items-center gap-1 ${getViralScoreColor(transition.viralScore || 0)}`}>
                          {getViralScoreIcon(transition.viralScore || 0)}
                          <span className="font-bold">{transition.viralScore?.toFixed(1)}</span>
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent className="space-y-4">
                      {/* Preview */}
                      <div className="aspect-video bg-gray-800 rounded-lg relative group-hover:bg-gray-700 transition-colors">
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-white hover:bg-white/20"
                            onClick={() => setSelectedTransition(transition)}
                          >
                            <Play className="w-6 h-6" />
                          </Button>
                        </div>
                        {transition.previewUrl && (
                          <video
                            src={transition.previewUrl}
                            className="w-full h-full object-cover rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                            muted
                            loop
                            onMouseEnter={(e) => e.currentTarget.play()}
                            onMouseLeave={(e) => e.currentTarget.pause()}
                          />
                        )}
                      </div>

                      {/* Tags */}
                      <div className="flex flex-wrap gap-1">
                        {transition.tags.slice(0, 3).map(tag => (
                          <Badge key={tag} variant="secondary" className="text-xs bg-purple-600/20 text-purple-300">
                            {tag}
                          </Badge>
                        ))}
                        {transition.tags.length > 3 && (
                          <Badge variant="secondary" className="text-xs bg-gray-600/20 text-gray-400">
                            +{transition.tags.length - 3}
                          </Badge>
                        )}
                      </div>

                      {/* Price and Actions */}
                      <div className="flex items-center justify-between">
                        <div className="text-yellow-400 font-bold">
                          {transition.price === 0 ? 'FREE' : `${transition.price} credits`}
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-gray-400 hover:text-white"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-gray-400 hover:text-red-400"
                          >
                            <Heart className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            className="bg-purple-600 hover:bg-purple-700"
                            onClick={() => handlePurchase(transition)}
                            disabled={userCredits < transition.price}
                          >
                            <Download className="w-4 h-4 mr-1" />
                            {transition.price === 0 ? 'Get' : 'Buy'}
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Other tabs would have similar content with different filters */}
          <TabsContent value="trending">
            <div className="text-center text-gray-400 py-12">
              Trending transitions coming soon...
            </div>
          </TabsContent>

          <TabsContent value="new">
            <div className="text-center text-gray-400 py-12">
              New releases coming soon...
            </div>
          </TabsContent>

          <TabsContent value="featured">
            <div className="text-center text-gray-400 py-12">
              Featured transitions coming soon...
            </div>
          </TabsContent>
        </Tabs>

        {/* Transition Preview Modal */}
        {selectedTransition && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
            <Card className="bg-gray-900 border-purple-500/20 max-w-2xl w-full">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-white">{selectedTransition.name}</CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedTransition(null)}
                    className="text-gray-400"
                  >
                    ×
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="aspect-video bg-gray-800 rounded-lg mb-4">
                  {selectedTransition.previewUrl && (
                    <video
                      src={selectedTransition.previewUrl}
                      controls
                      autoPlay
                      loop
                      className="w-full h-full rounded-lg"
                    />
                  )}
                </div>
                <p className="text-gray-300 mb-4">{selectedTransition.description}</p>
                <div className="flex items-center justify-between">
                  <div className="text-yellow-400 font-bold text-xl">
                    {selectedTransition.price === 0 ? 'FREE' : `${selectedTransition.price} credits`}
                  </div>
                  <Button
                    className="bg-purple-600 hover:bg-purple-700"
                    onClick={() => {
                      handlePurchase(selectedTransition);
                      setSelectedTransition(null);
                    }}
                    disabled={userCredits < selectedTransition.price}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    {selectedTransition.price === 0 ? 'Get Transition' : 'Purchase'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
