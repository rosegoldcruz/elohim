'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  Download, 
  Eye,
  Trash2
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

interface Job {
  id: string
  title: string
  status: 'created' | 'processing' | 'completed' | 'failed'
  created_at: string
  completed_at?: string
  output_url?: string
  error_message?: string
  input_data: {
    style: string
    duration: number
  }
}

interface JobsListProps {
  jobs: Job[]
}

export function JobsList({ jobs }: JobsListProps) {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'created':
        return <Clock className="h-4 w-4 text-blue-400" />
      case 'processing':
        return <Clock className="h-4 w-4 text-yellow-400 animate-spin" />
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-400" />
      case 'failed':
        return <AlertCircle className="h-4 w-4 text-red-400" />
      default:
        return <Clock className="h-4 w-4 text-neutral-400" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'created':
        return 'bg-blue-500/20 text-blue-300 border-blue-500/30'
      case 'processing':
        return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30'
      case 'completed':
        return 'bg-green-500/20 text-green-300 border-green-500/30'
      case 'failed':
        return 'bg-red-500/20 text-red-300 border-red-500/30'
      default:
        return 'bg-neutral-500/20 text-neutral-300 border-neutral-500/30'
    }
  }

  const handleDownload = async (url: string, title: string) => {
    try {
      const response = await fetch(url)
      const blob = await response.blob()
      const downloadUrl = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = downloadUrl
      link.download = `${title}.mp4`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(downloadUrl)
    } catch (error) {
      console.error('Download failed:', error)
    }
  }

  const handleDelete = async (jobId: string) => {
    if (!confirm('Are you sure you want to delete this job?')) {
      return
    }

    try {
      const response = await fetch(`/api/jobs/${jobId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        window.location.reload()
      } else {
        const data = await response.json()
        alert(data.error || 'Failed to delete job')
      }
    } catch (error) {
      console.error('Delete failed:', error)
      alert('Failed to delete job')
    }
  }

  if (jobs.length === 0) {
    return (
      <div className="text-center py-8 text-neutral-400">
        <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <p>No videos yet. Create your first video to get started!</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {jobs.map((job) => (
        <Card key={job.id} className="bg-white/5 border-white/10">
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2 mb-2">
                  {getStatusIcon(job.status)}
                  <h3 className="font-medium text-white truncate">
                    {job.title}
                  </h3>
                  <Badge className={getStatusColor(job.status)}>
                    {job.status}
                  </Badge>
                </div>
                
                <div className="text-sm text-neutral-400 space-y-1">
                  <p>Style: {job.input_data.style} • Duration: {job.input_data.duration}s</p>
                  <p>
                    Created {formatDistanceToNow(new Date(job.created_at), { addSuffix: true })}
                  </p>
                  {job.completed_at && (
                    <p>
                      Completed {formatDistanceToNow(new Date(job.completed_at), { addSuffix: true })}
                    </p>
                  )}
                  {job.error_message && (
                    <p className="text-red-400">Error: {job.error_message}</p>
                  )}
                </div>
              </div>

              <div className="flex items-center space-x-2 ml-4">
                {job.status === 'completed' && job.output_url && (
                  <>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => window.open(job.output_url, '_blank')}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDownload(job.output_url!, job.title)}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                  </>
                )}
                
                {(job.status === 'created' || job.status === 'failed') && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDelete(job.id)}
                    className="text-red-400 hover:text-red-300"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
