"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { apiClient, CreateJobRequest, JobStatus } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";

export default function GeneratePage() {
  const { getToken } = useAuth();
  const [text, setText] = useState("");
  const [videoLength, setVideoLength] = useState<30 | 60 | 90 | 120>(60);
  const [sceneDuration, setSceneDuration] = useState<5 | 10>(5);
  const [jobId, setJobId] = useState<string>("");
  const [status, setStatus] = useState<JobStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const submit = async () => {
    setLoading(true);
    setError("");
    try {
      const token = await getToken();
      if (!token) throw new Error("Not authenticated");
      const payload: CreateJobRequest = {
        text,
        video_length: videoLength,
        scene_duration: sceneDuration,
        style: "tiktok",
      };
      const res = await apiClient.createJob(payload, token);
      setJobId(res.job_id);
    } catch (e: any) {
      setError(e?.message || "Failed to start job");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let interval: any;
    (async () => {
      if (!jobId) return;
      const token = await getToken();
      if (!token) return;
      const poll = async () => {
        try {
          const s = await apiClient.getJobStatus(jobId, token);
          setStatus(s);
          if (s.status === "completed" || s.status === "failed" || s.status === "cancelled") {
            clearInterval(interval);
          }
        } catch (e) {
          // stop polling on error
          clearInterval(interval);
        }
      };
      await poll();
      interval = setInterval(poll, 2500);
    })();
    return () => interval && clearInterval(interval);
  }, [jobId, getToken]);

  const downloadUrl = jobId ? apiClient.getDownloadUrl(jobId) : "";

  return (
    <main className="min-h-screen bg-gradient-to-br from-black via-zinc-900 to-black flex flex-col items-center py-12 px-4">
      <div className="w-full max-w-2xl bg-zinc-900/80 rounded-2xl p-6 border border-zinc-800">
        <h1 className="text-3xl font-bold text-white mb-4">Generate Video</h1>
        <label className="text-sm text-zinc-300 mb-2 block">Script / Story</label>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={6}
          className="w-full rounded-lg bg-black/70 border border-zinc-800 text-white p-3 mb-4"
          placeholder="Paste your script/story here"
        />

        <div className="grid grid-cols-3 gap-3 mb-4">
          <div>
            <label className="text-sm text-zinc-300 mb-1 block">Total Length</label>
            <select
              value={videoLength}
              onChange={(e) => setVideoLength(Number(e.target.value) as any)}
              className="w-full bg-black text-white border border-zinc-800 rounded-md p-2"
            >
              {[30, 60, 90, 120].map((v) => (
                <option key={v} value={v}>{v}s</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-sm text-zinc-300 mb-1 block">Scene Duration</label>
            <select
              value={sceneDuration}
              onChange={(e) => setSceneDuration(Number(e.target.value) as any)}
              className="w-full bg-black text-white border border-zinc-800 rounded-md p-2"
            >
              {[5, 10].map((v) => (
                <option key={v} value={v}>{v}s</option>
              ))}
            </select>
          </div>
          <div className="flex items-end">
            <Button className="w-full" disabled={loading || !text.trim()} onClick={submit}>
              {loading ? "Starting..." : "Create Job"}
            </Button>
          </div>
        </div>

        {error && <div className="text-red-400 text-sm mb-4">{error}</div>}

        {jobId && (
          <div className="bg-black/40 border border-zinc-800 rounded-lg p-4">
            <div className="text-zinc-300 text-sm">Job: {jobId}</div>
            <div className="text-white text-lg font-semibold mt-1">Status: {status?.status || 'queued'}</div>
            {!!status && <div className="text-zinc-400 text-sm">Progress: {Math.round(status.progress || 0)}%</div>}
            {status?.error && <div className="text-red-400 text-sm">{status.error}</div>}
            {status?.status === 'completed' && status.video_url && (
              <div className="mt-4">
                <a
                  href={downloadUrl}
                  className="px-4 py-2 bg-green-600 text-white rounded-md"
                >
                  Download Video
                </a>
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
