import { Web3 } from 'web3';
import { ethers } from 'ethers';

// Tipos para votaciones blockchain
export interface VoteRecord {
  voterAddress: string;
  proposalId: string;
  vote: 'yes' | 'no' | 'abstain';
  timestamp: number;
  transactionHash: string;
  blockNumber: number;
}

export interface VoteProposal {
  id: string;
  title: string;
  description: string;
  creator: string;
  startTime: number;
  endTime: number;
  totalVotes: number;
  yesVotes: number;
  noVotes: number;
  abstainVotes: number;
  status: 'active' | 'passed' | 'rejected' | 'expired';
}

export interface SocialImpactCertificate {
  id: string;
  projectId: string;
  beneficiary: string;
  impactMetrics: Record<string, number>;
  certifier: string;
  timestamp: number;
  transactionHash: string;
  verificationHash: string;
}

// ABI simplificado para contratos de votación (en producción sería generado desde Solidity)
const VOTING_CONTRACT_ABI = [
  {
    "inputs": [
      {"name": "_proposalId", "type": "uint256"},
      {"name": "_vote", "type": "uint8"}
    ],
    "name": "vote",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"name": "_proposalId", "type": "uint256"}],
    "name": "getProposal",
    "outputs": [
      {"name": "id", "type": "uint256"},
      {"name": "title", "type": "string"},
      {"name": "description", "type": "string"},
      {"name": "creator", "type": "address"},
      {"name": "startTime", "type": "uint256"},
      {"name": "endTime", "type": "uint256"},
      {"name": "yesVotes", "type": "uint256"},
      {"name": "noVotes", "type": "uint256"},
      {"name": "abstainVotes", "type": "uint256"},
      {"name": "status", "type": "uint8"}
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"name": "_voter", "type": "address"}, {"name": "_proposalId", "type": "uint256"}],
    "name": "getVote",
    "outputs": [{"name": "", "type": "uint8"}],
    "stateMutability": "view",
    "type": "function"
  }
];

// ABI para certificación de impacto social
const IMPACT_CERTIFICATE_ABI = [
  {
    "inputs": [
      {"name": "_projectId", "type": "string"},
      {"name": "_beneficiary", "type": "address"},
      {"name": "_impactMetrics", "type": "string"}
    ],
    "name": "certifyImpact",
    "outputs": [{"name": "", "type": "uint256"}],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"name": "_certificateId", "type": "uint256"}],
    "name": "getCertificate",
    "outputs": [
      {"name": "id", "type": "uint256"},
      {"name": "projectId", "type": "string"},
      {"name": "beneficiary", "type": "address"},
      {"name": "certifier", "type": "address"},
      {"name": "timestamp", "type": "uint256"},
      {"name": "impactMetrics", "type": "string"},
      {"name": "verificationHash", "type": "string"}
    ],
    "stateMutability": "view",
    "type": "function"
  }
];

export class BlockchainService {
  private web3!: Web3;
  private ethersProvider!: ethers.JsonRpcProvider;
  private votingContract: any;
  private impactContract: any;
  private isConnected: boolean = false;

  constructor() {
    this.initializeBlockchain();
  }

  private async initializeBlockchain() {
    try {
      console.log('🔗 Inicializando servicio de blockchain...');

      // Inicializar Web3 (para Polygon Mumbai testnet)
      this.web3 = new Web3('https://polygon-mumbai.infura.io/v3/YOUR_INFURA_KEY');

      // Inicializar ethers provider
      this.ethersProvider = new ethers.JsonRpcProvider('https://polygon-mumbai.infura.io/v3/YOUR_INFURA_KEY');

      // En producción, usar contratos desplegados reales
      // Por ahora, usar direcciones de ejemplo
      const votingContractAddress = '0x0000000000000000000000000000000000000000'; // Dirección del contrato desplegado
      const impactContractAddress = '0x0000000000000000000000000000000000000000'; // Dirección del contrato desplegado

      // Inicializar contratos (comentado hasta tener contratos reales desplegados)
      /*
      this.votingContract = new this.web3.eth.Contract(VOTING_CONTRACT_ABI, votingContractAddress);
      this.impactContract = new this.web3.eth.Contract(IMPACT_CERTIFICATE_ABI, impactContractAddress);
      */

      this.isConnected = true;
      console.log('✅ Servicio de blockchain inicializado correctamente');
    } catch (error) {
      console.error('❌ Error inicializando servicio de blockchain:', error);
      this.isConnected = false;
    }
  }

  // Verificar si el servicio está conectado a la blockchain
  isServiceConnected(): boolean {
    return this.isConnected;
  }

  // Crear una propuesta de votación (simulado por ahora)
  async createVotingProposal(proposal: Omit<VoteProposal, 'id' | 'totalVotes' | 'yesVotes' | 'noVotes' | 'abstainVotes' | 'status'>): Promise<string> {
    try {
      if (!this.isConnected) {
        throw new Error('Servicio de blockchain no conectado');
      }

      // En producción, esto haría una transacción al contrato inteligente
      const proposalId = `proposal_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      // Simular almacenamiento local (reemplazar con llamada real al contrato)
      const newProposal: VoteProposal = {
        ...proposal,
        id: proposalId,
        totalVotes: 0,
        yesVotes: 0,
        noVotes: 0,
        abstainVotes: 0,
        status: 'active'
      };

      console.log('✅ Propuesta de votación creada:', proposalId);

      // Aquí iría la transacción real al contrato
      // const tx = await this.votingContract.methods.createProposal(...).send({from: account});

      return proposalId;
    } catch (error) {
      console.error('Error creando propuesta de votación:', error);
      throw new Error(`Error creando propuesta: ${error}`);
    }
  }

  // Votar en una propuesta
  async voteOnProposal(proposalId: string, voterAddress: string, vote: 'yes' | 'no' | 'abstain'): Promise<string> {
    try {
      if (!this.isConnected) {
        throw new Error('Servicio de blockchain no conectado');
      }

      // Verificar que la propuesta existe y está activa
      // const proposal = await this.votingContract.methods.getProposal(proposalId).call();

      // Crear registro de voto
      const voteRecord: VoteRecord = {
        voterAddress,
        proposalId,
        vote,
        timestamp: Date.now(),
        transactionHash: `0x${Math.random().toString(16).substr(2, 64)}`,
        blockNumber: Math.floor(Math.random() * 1000000) + 40000000
      };

      // Aquí iría la transacción real al contrato
      // const tx = await this.votingContract.methods.vote(proposalId, voteMapping[vote]).send({
      //   from: voterAddress
      // });

      console.log('✅ Voto registrado:', { proposalId, voterAddress, vote });

      return voteRecord.transactionHash;
    } catch (error) {
      console.error('Error votando en propuesta:', error);
      throw new Error(`Error votando: ${error}`);
    }
  }

  // Obtener información de una propuesta
  async getProposal(proposalId: string): Promise<VoteProposal | null> {
    try {
      if (!this.isConnected) {
        throw new Error('Servicio de blockchain no conectado');
      }

      // Aquí iría la llamada real al contrato
      // const proposalData = await this.votingContract.methods.getProposal(proposalId).call();

      // Simular datos por ahora
      return {
        id: proposalId,
        title: 'Propuesta de Desarrollo Comunitario',
        description: 'Implementar proyecto de desarrollo comunitario en la región',
        creator: '0x742d35Cc6A3e5C79c0F0E5A0B5e6B8c8c8c8c8c8c',
        startTime: Date.now() - 86400000, // 1 día atrás
        endTime: Date.now() + 86400000, // 1 día adelante
        totalVotes: 150,
        yesVotes: 98,
        noVotes: 32,
        abstainVotes: 20,
        status: 'active'
      };
    } catch (error) {
      console.error('Error obteniendo propuesta:', error);
      return null;
    }
  }

  // Certificar impacto social
  async certifySocialImpact(certificate: Omit<SocialImpactCertificate, 'id' | 'timestamp' | 'transactionHash' | 'verificationHash'>): Promise<string> {
    try {
      if (!this.isConnected) {
        throw new Error('Servicio de blockchain no conectado');
      }

      // Crear certificado único
      const certificateId = `impact_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      const impactCertificate: SocialImpactCertificate = {
        ...certificate,
        id: certificateId,
        timestamp: Date.now(),
        transactionHash: `0x${Math.random().toString(16).substr(2, 64)}`,
        verificationHash: this.generateVerificationHash(certificate)
      };

      // Aquí iría la transacción real al contrato
      // const tx = await this.impactContract.methods.certifyImpact(
      //   certificate.projectId,
      //   certificate.beneficiary,
      //   JSON.stringify(certificate.impactMetrics)
      // ).send({from: certificate.certifier});

      console.log('✅ Impacto social certificado:', certificateId);

      return impactCertificate.transactionHash;
    } catch (error) {
      console.error('Error certificando impacto social:', error);
      throw new Error(`Error certificando impacto: ${error}`);
    }
  }

  // Verificar certificado de impacto social
  async verifySocialImpact(certificateId: string): Promise<SocialImpactCertificate | null> {
    try {
      if (!this.isConnected) {
        throw new Error('Servicio de blockchain no conectado');
      }

      // Aquí iría la llamada real al contrato
      // const certificateData = await this.impactContract.methods.getCertificate(certificateId).call();

      // Simular datos por ahora
      return {
        id: certificateId,
        projectId: 'project_123',
        beneficiary: '0x742d35Cc6A3e5C79c0F0E5A0B5e6B8c8c8c8c8c8c',
        impactMetrics: {
          peopleHelped: 150,
          environmentalImpact: 85,
          economicValue: 50000,
          communityEngagement: 92
        },
        certifier: '0xCertifierAddress',
        timestamp: Date.now() - 86400000,
        transactionHash: `0x${Math.random().toString(16).substr(2, 64)}`,
        verificationHash: 'verification_hash_123'
      };
    } catch (error) {
      console.error('Error verificando certificado:', error);
      return null;
    }
  }

  // Obtener estadísticas de votación
  async getVotingStats(proposalId: string): Promise<{
    totalVotes: number;
    yesPercentage: number;
    noPercentage: number;
    abstainPercentage: number;
    participationRate: number;
    status: string;
  } | null> {
    try {
      const proposal = await this.getProposal(proposalId);
      if (!proposal) return null;

      const totalVotes = proposal.totalVotes;
      const yesPercentage = totalVotes > 0 ? (proposal.yesVotes / totalVotes) * 100 : 0;
      const noPercentage = totalVotes > 0 ? (proposal.noVotes / totalVotes) * 100 : 0;
      const abstainPercentage = totalVotes > 0 ? (proposal.abstainVotes / totalVotes) * 100 : 0;

      // En producción, calcular participación basada en usuarios registrados
      const participationRate = Math.min(totalVotes / 1000 * 100, 100); // Asumir 1000 usuarios potenciales

      return {
        totalVotes,
        yesPercentage: Math.round(yesPercentage * 100) / 100,
        noPercentage: Math.round(noPercentage * 100) / 100,
        abstainPercentage: Math.round(abstainPercentage * 100) / 100,
        participationRate: Math.round(participationRate * 100) / 100,
        status: proposal.status
      };
    } catch (error) {
      console.error('Error obteniendo estadísticas de votación:', error);
      return null;
    }
  }

  // Crear donación con registro blockchain
  async recordDonation(donation: {
    donorAddress: string;
    recipientAddress: string;
    amount: string;
    projectId: string;
    message?: string;
  }): Promise<string> {
    try {
      if (!this.isConnected) {
        throw new Error('Servicio de blockchain no conectado');
      }

      // Crear registro de transacción
      const txHash = `0x${Math.random().toString(16).substr(2, 64)}`;

      // Aquí iría la transacción real para transferir fondos
      // const tx = await this.web3.eth.sendTransaction({
      //   from: donation.donorAddress,
      //   to: donation.recipientAddress,
      //   value: this.web3.utils.toWei(donation.amount, 'ether')
      // });

      console.log('✅ Donación registrada en blockchain:', txHash);

      return txHash;
    } catch (error) {
      console.error('Error registrando donación:', error);
      throw new Error(`Error registrando donación: ${error}`);
    }
  }

  // Verificar integridad de datos usando blockchain
  async verifyDataIntegrity(dataHash: string, expectedHash: string): Promise<boolean> {
    try {
      // En producción, esto verificaría contra el contrato inteligente
      // o contra una cadena de bloques pública

      // Por ahora, simular verificación
      const storedHash = `hash_${dataHash}`;

      return storedHash === expectedHash;
    } catch (error) {
      console.error('Error verificando integridad de datos:', error);
      return false;
    }
  }

  // Generar hash de verificación para certificados
  private generateVerificationHash(certificate: Omit<SocialImpactCertificate, 'id' | 'timestamp' | 'transactionHash' | 'verificationHash'>): string {
    const dataString = JSON.stringify({
      projectId: certificate.projectId,
      beneficiary: certificate.beneficiary,
      impactMetrics: certificate.impactMetrics,
      certifier: certificate.certifier
    });

    // Crear hash simple (en producción usar keccak256 o similar)
    let hash = 0;
    for (let i = 0; i < dataString.length; i++) {
      const char = dataString.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convertir a 32-bit
    }

    return `vh_${Math.abs(hash).toString(16)}`;
  }

  // Obtener balance de una dirección
  async getBalance(address: string): Promise<string> {
    try {
      if (!this.isConnected) {
        throw new Error('Servicio de blockchain no conectado');
      }

      // Aquí iría la llamada real para obtener balance
      // const balance = await this.web3.eth.getBalance(address);

      // Simular balance por ahora
      const mockBalance = (Math.random() * 10).toFixed(4);

      return mockBalance;
    } catch (error) {
      console.error('Error obteniendo balance:', error);
      return '0';
    }
  }

  // Verificar si una dirección es válida
  isValidAddress(address: string): boolean {
    return /^0x[a-fA-F0-9]{40}$/.test(address);
  }

  // Obtener información de la red blockchain
  async getNetworkInfo(): Promise<{
    chainId: number;
    networkName: string;
    blockNumber: number;
    gasPrice: string;
  }> {
    try {
      if (!this.isConnected) {
        throw new Error('Servicio de blockchain no conectado');
      }

      // Aquí iría la llamada real a la red
      // const chainId = await this.web3.eth.getChainId();
      // const blockNumber = await this.web3.eth.getBlockNumber();
      // const gasPrice = await this.web3.eth.getGasPrice();

      // Simular datos por ahora
      return {
        chainId: 80001, // Polygon Mumbai
        networkName: 'Polygon Mumbai Testnet',
        blockNumber: 40000000 + Math.floor(Math.random() * 1000000),
        gasPrice: '20000000000' // 20 gwei
      };
    } catch (error) {
      console.error('Error obteniendo información de red:', error);
      return {
        chainId: 0,
        networkName: 'Desconocido',
        blockNumber: 0,
        gasPrice: '0'
      };
    }
  }
}

// Instancia singleton
export const blockchainService = new BlockchainService();
