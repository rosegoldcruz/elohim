import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Video, Clock, CheckCircle, AlertCircle, Download, Share2, Play } from "lucide-react";

interface StatusPageProps {
  params: {
    id: string;
  };
}

export default function StatusPage({ params }: StatusPageProps) {
  // Mock video data - in real app, fetch from API
  const video = {
    id: params.id,
    title: "Summer Product Launch Video",
    status: "completed", // completed, processing, failed
    progress: 100,
    duration: "30 seconds",
    quality: "4K",
    createdAt: "2 hours ago",
    estimatedTime: "5 minutes",
    thumbnail: "bg-gradient-to-br from-fuchsia-500 to-purple-600"
  };

  const getStatusIcon = () => {
    switch (video.status) {
      case "completed":
        return <CheckCircle className="w-6 h-6 text-green-400" />;
      case "processing":
        return <Clock className="w-6 h-6 text-blue-400" />;
      case "failed":
        return <AlertCircle className="w-6 h-6 text-red-400" />;
      default:
        return <Clock className="w-6 h-6 text-gray-400" />;
    }
  };

  const getStatusColor = () => {
    switch (video.status) {
      case "completed":
        return "bg-green-500/20 text-green-400";
      case "processing":
        return "bg-blue-500/20 text-blue-400";
      case "failed":
        return "bg-red-500/20 text-red-400";
      default:
        return "bg-gray-500/20 text-gray-400";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a23] via-[#1a1a3a] to-[#2a2a4a]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-white mb-4">Video Status</h1>
          <p className="text-gray-300">Track the progress of your video generation</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Video Preview */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-2"
          >
            <div className="glass-effect rounded-2xl p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-semibold text-white">{video.title}</h2>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor()}`}>
                  {video.status.charAt(0).toUpperCase() + video.status.slice(1)}
                </span>
              </div>

              {/* Video Thumbnail */}
              <div className={`aspect-video ${video.thumbnail} rounded-xl flex items-center justify-center mb-6`}>
                {video.status === "completed" ? (
                  <div className="text-center">
                    <Play className="w-16 h-16 text-white mx-auto mb-4" />
                    <p className="text-white">Video ready to play</p>
                  </div>
                ) : (
                  <div className="text-center">
                    <Video className="w-16 h-16 text-white mx-auto mb-4" />
                    <p className="text-white">Processing video...</p>
                  </div>
                )}
              </div>

              {/* Progress Bar */}
              {video.status === "processing" && (
                <div className="mb-6">
                  <div className="flex justify-between text-sm text-gray-400 mb-2">
                    <span>Processing...</span>
                    <span>{video.progress}%</span>
                  </div>
                  <div className="w-full bg-white/10 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-fuchsia-500 to-purple-600 h-2 rounded-full transition-all duration-1000"
                      style={{ width: `${video.progress}%` }}
                    ></div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex space-x-4">
                {video.status === "completed" ? (
                  <>
                    <Button className="bg-gradient-to-r from-fuchsia-500 to-purple-600 hover:from-fuchsia-600 hover:to-purple-700 text-white">
                      <Play className="w-4 h-4 mr-2" />
                      Play Video
                    </Button>
                    <Button variant="outline" className="border-white/20 text-white hover:bg-white/10">
                      <Download className="w-4 h-4 mr-2" />
                      Download
                    </Button>
                    <Button variant="outline" className="border-white/20 text-white hover:bg-white/10">
                      <Share2 className="w-4 h-4 mr-2" />
                      Share
                    </Button>
                  </>
                ) : (
                  <Button variant="outline" className="border-white/20 text-white hover:bg-white/10">
                    <Clock className="w-4 h-4 mr-2" />
                    Estimated time: {video.estimatedTime}
                  </Button>
                )}
              </div>
            </div>
          </motion.div>

          {/* Status Details */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="glass-effect rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-white mb-6">Status Details</h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Status</span>
                  <div className="flex items-center space-x-2">
                    {getStatusIcon()}
                    <span className="text-white capitalize">{video.status}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Duration</span>
                  <span className="text-white">{video.duration}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Quality</span>
                  <span className="text-white">{video.quality}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Created</span>
                  <span className="text-white">{video.createdAt}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Video ID</span>
                  <span className="text-white font-mono text-sm">{video.id}</span>
                </div>
              </div>

              {/* Processing Steps */}
              {video.status === "processing" && (
                <div className="mt-6">
                  <h4 className="text-sm font-medium text-white mb-3">Processing Steps</h4>
                  <div className="space-y-2">
                    {[
                      { step: "Script Generation", completed: true },
                      { step: "Scene Planning", completed: true },
                      { step: "Video Generation", completed: false },
                      { step: "Audio Sync", completed: false },
                      { step: "Final Render", completed: false }
                    ].map((step, index) => (
                      <div key={step.step} className="flex items-center space-x-2">
                        {step.completed ? (
                          <CheckCircle className="w-4 h-4 text-green-400" />
                        ) : (
                          <div className="w-4 h-4 border-2 border-gray-400 rounded-full" />
                        )}
                        <span className={`text-sm ${step.completed ? 'text-white' : 'text-gray-400'}`}>
                          {step.step}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
} 