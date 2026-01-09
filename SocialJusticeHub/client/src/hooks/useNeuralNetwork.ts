import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';

export interface ConceptNode {
  id: number;
  text: string;
  position: [number, number, number];
  color: string;
  size: number;
}

export interface PersonNode {
  id: number;
  name: string;
  username: string;
  position: [number, number, number];
  concepts: {
    dreams: ConceptNode[];
    values: ConceptNode[];
    needs: ConceptNode[];
    basta: ConceptNode[];
  };
}

export interface CrossConnection {
  from: {
    personId: number;
    conceptId: number;
    type: string;
  };
  to: {
    personId: number;
    conceptId: number;
    type: string;
  };
  strength: number;
  similarity: number;
}

export interface NeuralNetworkData {
  people: PersonNode[];
  crossConnections: CrossConnection[];
  metadata: {
    totalPeople: number;
    totalConcepts: number;
    totalConnections: number;
    avgSimilarity: number;
    generatedAt: string;
  };
}

// Legacy types for backward compatibility during migration
export interface NeuralNode {
  id: number;
  type: 'dream' | 'value' | 'need' | 'basta';
  text: string;
  position: [number, number, number];
  color: string;
  size: number;
  personId?: number;
}

export interface NeuralEdge {
  source: number;
  target: number;
  strength: number;
  type: 'cross-type' | 'same-type';
}

export function useNeuralNetwork(
  minSimilarity: number = 0.3,
  maxConnections: number = 10
) {
  return useQuery<NeuralNetworkData>({
    queryKey: ['neural-network-graph', minSimilarity, maxConnections],
    queryFn: async () => {
      const response = await apiRequest(
        'GET',
        `/api/neural-network/graph?minSimilarity=${minSimilarity}&maxConnections=${maxConnections}`
      );
      if (!response.ok) {
        throw new Error('Failed to fetch neural network graph');
      }
      return response.json();
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 30 * 1000, // Refresh every 30 seconds
  });
}

