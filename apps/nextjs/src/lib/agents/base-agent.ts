import type { BaseAgent, AgentStatus, AgentConfig } from './types';

export abstract class AeonAgent implements BaseAgent {
  public readonly id: string;
  public readonly name: string;
  public readonly type: any;
  public status: AgentStatus = 'idle';
  public readonly capabilities: string[];
  public config: AgentConfig;

  constructor(
    id: string,
    name: string,
    type: any,
    capabilities: string[],
    config: AgentConfig = {}
  ) {
    this.id = id;
    this.name = name;
    this.type = type;
    this.capabilities = capabilities;
    this.config = config;
  }

  abstract execute(input: any): Promise<any>;

  protected async updateStatus(status: AgentStatus): Promise<void> {
    this.status = status;
    // Emit status update event for real-time UI updates
    this.emitStatusUpdate();
  }

  protected emitStatusUpdate(): void {
    // Implementation for real-time status updates
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('agent-status-update', {
        detail: {
          agentId: this.id,
          status: this.status,
          timestamp: new Date()
        }
      }));
    }
  }

  protected async handleError(error: Error): Promise<void> {
    console.error(`Agent ${this.name} (${this.id}) error:`, error);
    await this.updateStatus('error');
    throw error;
  }

  public async validateInput(input: any): Promise<boolean> {
    // Base validation - override in specific agents
    return input !== null && input !== undefined;
  }

  public getCapabilities(): string[] {
    return [...this.capabilities];
  }

  public updateConfig(newConfig: Partial<AgentConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }
}

export class AgentOrchestrator {
  private agents: Map<string, AeonAgent> = new Map();
  private executionQueue: Array<{
    agentId: string;
    input: any;
    resolve: (value: any) => void;
    reject: (error: Error) => void;
  }> = [];
  private isProcessing = false;

  registerAgent(agent: AeonAgent): void {
    this.agents.set(agent.id, agent);
  }

  unregisterAgent(agentId: string): void {
    this.agents.delete(agentId);
  }

  async executeAgent(agentId: string, input: any): Promise<any> {
    const agent = this.agents.get(agentId);
    if (!agent) {
      throw new Error(`Agent with id ${agentId} not found`);
    }

    return new Promise((resolve, reject) => {
      this.executionQueue.push({ agentId, input, resolve, reject });
      this.processQueue();
    });
  }

  private async processQueue(): Promise<void> {
    if (this.isProcessing || this.executionQueue.length === 0) {
      return;
    }

    this.isProcessing = true;

    while (this.executionQueue.length > 0) {
      const task = this.executionQueue.shift()!;
      const agent = this.agents.get(task.agentId)!;

      try {
        await agent.updateStatus('processing');
        const result = await agent.execute(task.input);
        await agent.updateStatus('completed');
        task.resolve(result);
      } catch (error) {
        await agent.updateStatus('error');
        task.reject(error as Error);
      }
    }

    this.isProcessing = false;
  }

  getAgent(agentId: string): AeonAgent | undefined {
    return this.agents.get(agentId);
  }

  getAllAgents(): AeonAgent[] {
    return Array.from(this.agents.values());
  }

  getAgentsByType(type: string): AeonAgent[] {
    return Array.from(this.agents.values()).filter(agent => agent.type === type);
  }

  async executeWorkflow(workflow: Array<{ agentId: string; input: any }>): Promise<any[]> {
    const results: any[] = [];
    
    for (const step of workflow) {
      const result = await this.executeAgent(step.agentId, step.input);
      results.push(result);
    }

    return results;
  }
}

// Global orchestrator instance
export const globalOrchestrator = new AgentOrchestrator();
