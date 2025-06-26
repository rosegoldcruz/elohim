// Supabase Integration for AEON Video Platform
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { Database } from './supabase-types';

export class SupabaseService {
  private supabase: SupabaseClient<Database>;
  private serviceSupabase: SupabaseClient<Database>;

  constructor() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

    this.supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);
    this.serviceSupabase = createClient<Database>(supabaseUrl, supabaseServiceKey);
  }

  // Video Projects Management
  async createVideoProject(project: CreateVideoProjectInput): Promise<VideoProject> {
    const { data, error } = await this.supabase
      .from('video_projects')
      .insert({
        title: project.title,
        description: project.description,
        user_id: project.userId,
        status: 'draft',
        config: project.config || {},
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw new Error(`Failed to create project: ${error.message}`);
    return this.mapVideoProject(data);
  }

  async getVideoProject(projectId: string, userId: string): Promise<VideoProject | null> {
    const { data, error } = await this.supabase
      .from('video_projects')
      .select(`
        *,
        agent_executions (*)
      `)
      .eq('id', projectId)
      .eq('user_id', userId)
      .single();

    if (error) return null;
    return this.mapVideoProject(data);
  }

  async getUserVideoProjects(userId: string): Promise<VideoProject[]> {
    const { data, error } = await this.supabase
      .from('video_projects')
      .select(`
        *,
        agent_executions (*)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw new Error(`Failed to fetch projects: ${error.message}`);
    return data.map(this.mapVideoProject);
  }

  async updateVideoProject(
    projectId: string, 
    userId: string, 
    updates: Partial<VideoProject>
  ): Promise<VideoProject> {
    const { data, error } = await this.supabase
      .from('video_projects')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', projectId)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw new Error(`Failed to update project: ${error.message}`);
    return this.mapVideoProject(data);
  }

  async deleteVideoProject(projectId: string, userId: string): Promise<void> {
    const { error } = await this.supabase
      .from('video_projects')
      .delete()
      .eq('id', projectId)
      .eq('user_id', userId);

    if (error) throw new Error(`Failed to delete project: ${error.message}`);
  }

  // Agent Executions Management
  async createAgentExecution(execution: CreateAgentExecutionInput): Promise<AgentExecution> {
    const { data, error } = await this.supabase
      .from('agent_executions')
      .insert({
        project_id: execution.projectId,
        agent_type: execution.agentType,
        agent_id: execution.agentId,
        status: execution.status || 'idle',
        input: execution.input,
        output: execution.output || null,
        error_message: execution.error || null,
        started_at: execution.startedAt?.toISOString() || null,
        completed_at: execution.completedAt?.toISOString() || null,
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw new Error(`Failed to create agent execution: ${error.message}`);
    return this.mapAgentExecution(data);
  }

  async updateAgentExecution(
    executionId: string, 
    updates: Partial<AgentExecution>
  ): Promise<AgentExecution> {
    const { data, error } = await this.supabase
      .from('agent_executions')
      .update({
        status: updates.status,
        output: updates.output,
        error_message: updates.error,
        started_at: updates.startedAt?.toISOString(),
        completed_at: updates.completedAt?.toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', executionId)
      .select()
      .single();

    if (error) throw new Error(`Failed to update agent execution: ${error.message}`);
    return this.mapAgentExecution(data);
  }

  async getProjectExecutions(projectId: string): Promise<AgentExecution[]> {
    const { data, error } = await this.supabase
      .from('agent_executions')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: true });

    if (error) throw new Error(`Failed to fetch executions: ${error.message}`);
    return data.map(this.mapAgentExecution);
  }

  // Video Assets Management
  async createVideoAsset(asset: CreateVideoAssetInput): Promise<VideoAsset> {
    const { data, error } = await this.supabase
      .from('video_assets')
      .insert({
        project_id: asset.projectId,
        agent_execution_id: asset.agentExecutionId,
        type: asset.type,
        url: asset.url,
        filename: asset.filename,
        size: asset.size,
        duration: asset.duration || null,
        metadata: asset.metadata || {},
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw new Error(`Failed to create video asset: ${error.message}`);
    return this.mapVideoAsset(data);
  }

  async getProjectAssets(projectId: string): Promise<VideoAsset[]> {
    const { data, error } = await this.supabase
      .from('video_assets')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false });

    if (error) throw new Error(`Failed to fetch assets: ${error.message}`);
    return data.map(this.mapVideoAsset);
  }

  async deleteVideoAsset(assetId: string): Promise<void> {
    const { error } = await this.supabase
      .from('video_assets')
      .delete()
      .eq('id', assetId);

    if (error) throw new Error(`Failed to delete asset: ${error.message}`);
  }

  // User Management
  async createUserProfile(user: CreateUserProfileInput): Promise<UserProfile> {
    const { data, error } = await this.supabase
      .from('user_profiles')
      .insert({
        id: user.id,
        email: user.email,
        full_name: user.fullName,
        avatar_url: user.avatarUrl || null,
        subscription_tier: user.subscriptionTier || 'free',
        credits_remaining: user.creditsRemaining || 100,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw new Error(`Failed to create user profile: ${error.message}`);
    return this.mapUserProfile(data);
  }

  async getUserProfile(userId: string): Promise<UserProfile | null> {
    const { data, error } = await this.supabase
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) return null;
    return this.mapUserProfile(data);
  }

  async updateUserCredits(userId: string, creditsUsed: number): Promise<UserProfile> {
    const { data, error } = await this.supabase
      .rpc('update_user_credits', {
        user_id: userId,
        credits_to_deduct: creditsUsed
      });

    if (error) throw new Error(`Failed to update credits: ${error.message}`);
    return data;
  }

  // Analytics and Reporting
  async getUserAnalytics(userId: string): Promise<UserAnalytics> {
    const { data, error } = await this.supabase
      .rpc('get_user_analytics', { user_id: userId });

    if (error) throw new Error(`Failed to fetch analytics: ${error.message}`);
    return data;
  }

  // Real-time subscriptions
  subscribeToProjectUpdates(
    projectId: string, 
    callback: (payload: any) => void
  ): () => void {
    const subscription = this.supabase
      .channel(`project-${projectId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'agent_executions',
          filter: `project_id=eq.${projectId}`
        },
        callback
      )
      .subscribe();

    return () => subscription.unsubscribe();
  }

  // Helper methods for mapping database types to application types
  private mapVideoProject(data: any): VideoProject {
    return {
      id: data.id,
      title: data.title,
      description: data.description,
      status: data.status,
      userId: data.user_id,
      config: data.config || {},
      agents: data.agent_executions?.map(this.mapAgentExecution) || [],
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at)
    };
  }

  private mapAgentExecution(data: any): AgentExecution {
    return {
      id: data.id,
      projectId: data.project_id,
      agentType: data.agent_type,
      agentId: data.agent_id,
      status: data.status,
      input: data.input,
      output: data.output,
      error: data.error_message,
      startedAt: data.started_at ? new Date(data.started_at) : undefined,
      completedAt: data.completed_at ? new Date(data.completed_at) : undefined
    };
  }

  private mapVideoAsset(data: any): VideoAsset {
    return {
      id: data.id,
      projectId: data.project_id,
      agentExecutionId: data.agent_execution_id,
      type: data.type,
      url: data.url,
      filename: data.filename,
      size: data.size,
      duration: data.duration,
      metadata: data.metadata || {},
      createdAt: new Date(data.created_at)
    };
  }

  private mapUserProfile(data: any): UserProfile {
    return {
      id: data.id,
      email: data.email,
      fullName: data.full_name,
      avatarUrl: data.avatar_url,
      subscriptionTier: data.subscription_tier,
      creditsRemaining: data.credits_remaining,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at)
    };
  }
}

// Types
export interface VideoProject {
  id: string;
  title: string;
  description: string;
  status: 'draft' | 'processing' | 'completed' | 'failed';
  userId: string;
  config: Record<string, any>;
  agents: AgentExecution[];
  createdAt: Date;
  updatedAt: Date;
}

export interface AgentExecution {
  id: string;
  projectId: string;
  agentType: string;
  agentId: string;
  status: 'idle' | 'processing' | 'completed' | 'error';
  input: any;
  output?: any;
  error?: string;
  startedAt?: Date;
  completedAt?: Date;
}

export interface VideoAsset {
  id: string;
  projectId: string;
  agentExecutionId: string;
  type: 'video' | 'image' | 'audio' | 'script';
  url: string;
  filename: string;
  size: number;
  duration?: number;
  metadata: Record<string, any>;
  createdAt: Date;
}

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  avatarUrl?: string;
  subscriptionTier: 'free' | 'pro' | 'enterprise';
  creditsRemaining: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateVideoProjectInput {
  title: string;
  description: string;
  userId: string;
  config?: Record<string, any>;
}

export interface CreateAgentExecutionInput {
  projectId: string;
  agentType: string;
  agentId: string;
  status?: string;
  input: any;
  output?: any;
  error?: string;
  startedAt?: Date;
  completedAt?: Date;
}

export interface CreateVideoAssetInput {
  projectId: string;
  agentExecutionId: string;
  type: 'video' | 'image' | 'audio' | 'script';
  url: string;
  filename: string;
  size: number;
  duration?: number;
  metadata?: Record<string, any>;
}

export interface CreateUserProfileInput {
  id: string;
  email: string;
  fullName: string;
  avatarUrl?: string;
  subscriptionTier?: 'free' | 'pro' | 'enterprise';
  creditsRemaining?: number;
}

export interface UserAnalytics {
  totalProjects: number;
  completedProjects: number;
  totalVideosGenerated: number;
  creditsUsed: number;
  averageProjectDuration: number;
  mostUsedAgent: string;
}

// Export singleton instance
export const supabaseService = new SupabaseService();
