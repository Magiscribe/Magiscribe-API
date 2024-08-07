export interface GraphNode {
  id: number;
  thought: string;
  type: string;
}

export interface GraphEdge {
  source: number;
  target: number;
  weight: number;
}

export interface LLMOptimizedGraph {
  id: number;
  thought: string;
  type: string;
  upstreamNodes: Array<{ id: number; weight: number }>;
  downstreamNodes: Array<{ id: number; weight: number }>;
}

export interface thoughtWithId {
  id: number;
  thought: string;
}

export type LLMOptimizedChainOfThoughts = thoughtWithId[];

export interface Weights {
  [key: number]: number;
}

export interface Feedback {
  [key: number]: string;
}

export interface ExpandGraphOutputData {
  sourceNode: number;
  thoughts: string[];
  nextCapability: 'EvaluateOptionsCapability';
}

export interface EvaluateOptionsOutputData {
  feedback: Feedback;
  nextCapability: 'CheckCompletionCapability';
  weights: Weights;
  thought: string;
}

export interface CheckCompletionOutputData {
  explanation: string;
  pathComplete: boolean;
  nextCapability: 'PathComplete' | 'nextStepCapability';
}

export interface nextStepOutputData {
  explanation: string;
  nextCapability: 'ExpandGraphCapability' | 'GenericPythonExecutionCapability';
  prompt: string;
}

export interface GenericPythonExecutionOutputData {
  thought: string;
  nextCapability: string;
}

export type CapabilityOutputData =
  | ExpandGraphOutputData
  | EvaluateOptionsOutputData
  | CheckCompletionOutputData
  | nextStepOutputData
  | GenericPythonExecutionOutputData;

export type Capability =
  | 'ExpandGraphCapability'
  | 'EvaluateOptionsCapability'
  | 'CheckCompletionCapability'
  | 'PathComplete'
  | 'NextStepCapability'
  | 'GenericPythonExecutionCapability';

export class Graph {
  nodes: Map<number, GraphNode> = new Map();
  edges: GraphEdge[] = [];
  currentChainOfThought: number[] = [];

  addNode(node: GraphNode): void {
    if (!this.nodes.has(node.id)) {
      this.nodes.set(node.id, node);
    }
  }

  removeNode(id: number): void {
    this.nodes.delete(id);
    this.edges = this.edges.filter(
      (edge) => edge.source !== id && edge.target !== id,
    );
    this.currentChainOfThought = this.currentChainOfThought.filter(
      (nodeId) => nodeId !== id,
    );
  }

  addEdge(edge: GraphEdge): void {
    if (this.nodes.has(edge.source) && this.nodes.has(edge.target)) {
      this.edges.push(edge);
    }
  }

  removeEdge(source: number, target: number): void {
    this.edges = this.edges.filter(
      (edge) => !(edge.source === source && edge.target === target),
    );
  }

  getAdjacentNodes(id: number): GraphNode[] {
    const adjacentNodes = new Set<GraphNode>();
    for (const edge of this.edges) {
      if (edge.source === id) {
        const node = this.nodes.get(edge.target);
        if (node) adjacentNodes.add(node);
      }
      if (edge.target === id) {
        const node = this.nodes.get(edge.source);
        if (node) adjacentNodes.add(node);
      }
    }
    return Array.from(adjacentNodes);
  }

  getIncomingNodes(id: number): GraphNode[] {
    return this.edges
      .filter((edge) => edge.target === id)
      .map((edge) => this.nodes.get(edge.source))
      .filter((node): node is GraphNode => node !== undefined);
  }

  getOutgoingNodes(id: number): GraphNode[] {
    return this.edges
      .filter((edge) => edge.source === id)
      .map((edge) => this.nodes.get(edge.target))
      .filter((node): node is GraphNode => node !== undefined);
  }

  clone(): Graph {
    const newGraph = new Graph();
    newGraph.nodes = new Map(this.nodes);
    newGraph.edges = [...this.edges];
    newGraph.currentChainOfThought = [...this.currentChainOfThought];
    return newGraph;
  }

  addToChainOfThought(nodeId: number): void {
    if (this.nodes.has(nodeId)) {
      this.currentChainOfThought.push(nodeId);
    }
  }

  removeLastFromChainOfThought(): number | undefined {
    return this.currentChainOfThought.pop();
  }

  toLLMOptimizedGraph(): LLMOptimizedGraph[] {
    const optimizedGraph: LLMOptimizedGraph[] = Array.from(
      this.nodes.values(),
    ).map((node) => ({
      id: node.id,
      thought: node.thought,
      type: node.type,
      upstreamNodes: this.getIncomingNodes(node.id).map((n) => ({
        id: n.id,
        weight:
          this.edges.find(
            (edge) => edge.source === n.id && edge.target === node.id,
          )?.weight || 0,
      })),
      downstreamNodes: this.getOutgoingNodes(node.id).map((n) => ({
        id: n.id,
        weight:
          this.edges.find(
            (edge) => edge.source === node.id && edge.target === n.id,
          )?.weight || 0,
      })),
    }));

    return optimizedGraph;
  }

  getChainOfThoughtAsThoughts(): LLMOptimizedChainOfThoughts {
    const chainOfThoughts = this.currentChainOfThought
      .map((id) => {
        const node = this.nodes.get(id);
        return node ? { id: node.id, thought: node.thought } : null;
      })
      .filter(
        (thought): thought is { id: number; thought: string } =>
          thought !== null,
      );
    return chainOfThoughts;
  }

  createEvaluatePrompt(newNodeIds: number[]): string {
    return `Evaluate/synthesize nodes ${newNodeIds.join(', ')}`;
  }

  createCheckCompletionPrompt(): string {
    return `Check if the following chain of thought completes the task: "${this.getChainOfThoughtAsThoughts()}"`;
  }

  createExpandGraphPrompt(nodeToExpand: number): string {
    return `Expand the graph at node ${nodeToExpand}`;
  }

  processResult(capabilityData: CapabilityOutputData): string {
    console.log('Next capability: ', capabilityData.nextCapability);
    switch (capabilityData.nextCapability) {
      case 'EvaluateOptionsCapability':
        const { sourceNode, thoughts } =
          capabilityData as ExpandGraphOutputData;
        const newNodeIds = this.expandGraphWithThoughts(sourceNode, thoughts);
        console.log(this.createEvaluatePrompt(newNodeIds));
        return this.createEvaluatePrompt(newNodeIds);
      case 'CheckCompletionCapability':
        const resultData = capabilityData as EvaluateOptionsOutputData;
        const newNodeId = this.addNewThoughtAsNode(resultData.thought);
        if (resultData.weights) {
          this.addEdgesFromWeights(newNodeId, resultData.weights);
        } else {
          this.addEdge({
            source:
              this.currentChainOfThought[this.currentChainOfThought.length - 1],
            target: newNodeId,
            weight: 1,
          });
        }
        this.addToChainOfThought(newNodeId);
        console.log(this.createCheckCompletionPrompt());
        return this.createCheckCompletionPrompt();
      case 'GenericPythonExecutionCapability':
        const nextStepData = capabilityData as nextStepOutputData;
        const targetNodeId = this.addNewThoughtAsNode(nextStepData.prompt);
        const lastChainOfThoughtNodeId =
          this.currentChainOfThought[this.currentChainOfThought.length - 1];
        this.addEdge({
          source: lastChainOfThoughtNodeId,
          target: targetNodeId,
          weight: 1,
        });

        return 'Generate a Python script to execute the task in accordance with the current chain of thoughts';
      case 'ExpandGraphCapability':
        const expandGraphData = capabilityData as nextStepOutputData;
        return expandGraphData.prompt;
      case 'nextStepCapability':
        return `Figure out the next logical step to take based on the existing graph and current chain of thoughts`;
      default:
        throw new Error(
          `Unsupported capability: ${capabilityData.nextCapability}`,
        );
    }
  }

  addNewThoughtAsNode(thought: string): number {
    let maxNodeId = Math.max(...Array.from(this.nodes.keys()), 0);
    const newNode: GraphNode = {
      id: maxNodeId + 1,
      thought: thought,
      type: 'bot',
    };
    this.addNode(newNode);
    return newNode.id;
  }

  addEdgesFromWeights(targetNodeId: number, weights: Weights): void {
    for (const [sourceNodeId, weight] of Object.entries(weights)) {
      this.addEdge({
        source: parseInt(sourceNodeId),
        target: targetNodeId,
        weight: weight,
      });
    }
  }

  private expandGraphWithThoughts(
    sourceNodeId: number,
    thoughts: string[],
  ): number[] {
    let maxNodeId = Math.max(...Array.from(this.nodes.keys()), 0);
    const newNodeIds: number[] = [];

    thoughts.forEach((thought) => {
      maxNodeId++;
      const newNode: GraphNode = {
        id: maxNodeId,
        thought: thought,
        type: 'bot',
      };

      this.addNode(newNode);
      this.addEdge({
        source: sourceNodeId,
        target: maxNodeId,
        weight: 1,
      });

      newNodeIds.push(maxNodeId);
    });

    return newNodeIds;
  }
}
