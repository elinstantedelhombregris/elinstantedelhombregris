import * as THREE from 'three';

// Tipos para Realidad Aumentada
export interface ARProject {
  id: string;
  title: string;
  description: string;
  location: {
    latitude: number;
    longitude: number;
    address: string;
  };
  arModel: {
    type: 'building' | 'park' | 'infrastructure' | 'community_center' | 'school' | 'hospital' | 'custom';
    dimensions: {
      width: number;
      height: number;
      depth: number;
    };
    color: string;
    texture?: string;
  };
  impact: {
    beneficiaries: number;
    environmental_impact: number;
    economic_value: number;
    social_impact: number;
  };
  status: 'planning' | 'in_progress' | 'completed' | 'cancelled';
  createdBy: string;
  createdAt: string;
}

export interface ARScene {
  id: string;
  projects: ARProject[];
  cameraPosition: {
    x: number;
    y: number;
    z: number;
  };
  lighting: {
    intensity: number;
    color: string;
  };
  markers: Array<{
    id: string;
    position: { x: number; y: number; z: number };
    type: 'image' | 'location' | 'gps';
    data: string; // URL de imagen o coordenadas GPS
  }>;
}

export interface ARVisualization {
  sceneId: string;
  projectId: string;
  modelUrl: string;
  textureUrl?: string;
  animations: Array<{
    type: 'scale' | 'rotate' | 'translate' | 'fade';
    duration: number;
    delay?: number;
    parameters: Record<string, any>;
  }>;
  interactions: Array<{
    type: 'click' | 'hover' | 'gaze';
    action: 'show_info' | 'play_animation' | 'open_url' | 'trigger_event';
    parameters: Record<string, any>;
  }>;
}

export class ARService {
  private scenes: Map<string, ARScene> = new Map();
  private visualizations: Map<string, ARVisualization> = new Map();

  constructor() {
    this.initializeDefaultScenes();
  }

  private initializeDefaultScenes() {
    console.log('🏗️ Inicializando servicio de Realidad Aumentada...');

    // Crear escena por defecto para Argentina
    const defaultScene: ARScene = {
      id: 'argentina_main',
      projects: [],
      cameraPosition: { x: 0, y: 5, z: 10 },
      lighting: {
        intensity: 1,
        color: '#ffffff'
      },
      markers: [
        {
          id: 'location_buenos_aires',
          position: { x: -34.6037, y: -58.3816, z: 0 }, // Coordenadas aproximadas de Buenos Aires
          type: 'gps',
          data: '-34.6037,-58.3816'
        }
      ]
    };

    this.scenes.set(defaultScene.id, defaultScene);
    console.log('✅ Servicio de AR inicializado correctamente');
  }

  // Crear nuevo proyecto AR
  async createARProject(projectData: Omit<ARProject, 'id' | 'createdAt'>): Promise<string> {
    try {
      const projectId = `ar_project_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      const project: ARProject = {
        ...projectData,
        id: projectId,
        createdAt: new Date().toISOString()
      };

      // Agregar proyecto a la escena correspondiente
      const scene = this.scenes.get('argentina_main');
      if (scene) {
        scene.projects.push(project);
      }

      console.log(`✅ Proyecto AR creado: ${projectId}`);
      return projectId;
    } catch (error) {
      console.error('Error creando proyecto AR:', error);
      throw new Error(`Error creando proyecto AR: ${error}`);
    }
  }

  // Obtener proyectos AR por ubicación
  async getARProjectsByLocation(latitude: number, longitude: number, radiusKm: number = 5): Promise<ARProject[]> {
    try {
      const scene = this.scenes.get('argentina_main');
      if (!scene) return [];

      // Calcular distancia entre coordenadas (fórmula de Haversine simplificada)
      const projects = scene.projects.filter(project => {
        const distance = this.calculateDistance(
          latitude, longitude,
          project.location.latitude, project.location.longitude
        );
        return distance <= radiusKm;
      });

      return projects;
    } catch (error) {
      console.error('Error obteniendo proyectos AR por ubicación:', error);
      return [];
    }
  }

  // Crear visualización AR para un proyecto
  async createARVisualization(sceneId: string, projectId: string, visualizationData: Omit<ARVisualization, 'sceneId' | 'projectId'>): Promise<string> {
    try {
      const visualizationId = `ar_viz_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      const visualization: ARVisualization = {
        ...visualizationData,
        sceneId,
        projectId
      };

      this.visualizations.set(visualizationId, visualization);

      console.log(`✅ Visualización AR creada: ${visualizationId}`);
      return visualizationId;
    } catch (error) {
      console.error('Error creando visualización AR:', error);
      throw new Error(`Error creando visualización AR: ${error}`);
    }
  }

  // Generar modelo 3D básico para un proyecto
  generate3DModel(project: ARProject): string {
    try {
      // Crear geometría basada en el tipo de proyecto
      let geometry: string;
      let material: string;

      switch (project.arModel.type) {
        case 'building':
          geometry = 'box';
          material = project.arModel.color;
          break;
        case 'park':
          geometry = 'plane';
          material = '#22c55e'; // Verde para parques
          break;
        case 'infrastructure':
          geometry = 'cylinder';
          material = '#6b7280'; // Gris para infraestructura
          break;
        case 'community_center':
          geometry = 'octahedron';
          material = '#f59e0b'; // Ámbar para centros comunitarios
          break;
        case 'school':
          geometry = 'cone';
          material = '#3b82f6'; // Azul para escuelas
          break;
        case 'hospital':
          geometry = 'dodecahedron';
          material = '#ef4444'; // Rojo para hospitales
          break;
        default:
          geometry = 'box';
          material = project.arModel.color;
      }

      // Generar código Three.js básico
      const modelCode = `
        // Modelo 3D generado para proyecto: ${project.title}
        const geometry = new THREE.${geometry.charAt(0).toUpperCase() + geometry.slice(1)}Geometry(
          ${project.arModel.dimensions.width},
          ${project.arModel.dimensions.height},
          ${project.arModel.dimensions.depth}
        );
        const material = new THREE.MeshLambertMaterial({ color: '${material}' });
        const model = new THREE.Mesh(geometry, material);

        // Posicionar modelo basado en ubicación GPS
        model.position.set(
          ${project.location.longitude},
          0,
          ${project.location.latitude}
        );

        // Agregar animaciones básicas
        model.userData = {
          projectId: '${project.id}',
          title: '${project.title}',
          description: '${project.description}',
          impact: ${JSON.stringify(project.impact)}
        };

        return model;
      `;

      return modelCode;
    } catch (error) {
      console.error('Error generando modelo 3D:', error);
      return '// Error generando modelo 3D';
    }
  }

  // Crear escena AR completa para una ubicación
  async generateARScene(latitude: number, longitude: number): Promise<ARScene> {
    try {
      // Obtener proyectos cercanos
      const nearbyProjects = await this.getARProjectsByLocation(latitude, longitude, 10); // 10km radio

      const scene: ARScene = {
        id: `scene_${latitude}_${longitude}_${Date.now()}`,
        projects: nearbyProjects,
        cameraPosition: {
          x: longitude,
          y: 5,
          z: latitude
        },
        lighting: {
          intensity: 1,
          color: '#ffffff'
        },
        markers: [
          {
            id: `gps_${latitude}_${longitude}`,
            position: { x: longitude, y: latitude, z: 0 },
            type: 'gps',
            data: `${latitude},${longitude}`
          }
        ]
      };

      return scene;
    } catch (error) {
      console.error('Error generando escena AR:', error);
      throw new Error(`Error generando escena AR: ${error}`);
    }
  }

  // Calcular distancia entre dos puntos geográficos
  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Radio de la Tierra en km
    const dLat = this.toRadians(lat2 - lat1);
    const dLon = this.toRadians(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    return distance;
  }

  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  // Obtener escena AR por ID
  getARScene(sceneId: string): ARScene | undefined {
    return this.scenes.get(sceneId);
  }

  // Obtener visualización AR por ID
  getARVisualization(visualizationId: string): ARVisualization | undefined {
    return this.visualizations.get(visualizationId);
  }

  // Listar todas las escenas disponibles
  listARScenes(): ARScene[] {
    return Array.from(this.scenes.values());
  }

  // Actualizar proyecto AR
  async updateARProject(projectId: string, updates: Partial<ARProject>): Promise<boolean> {
    try {
      const scene = this.scenes.get('argentina_main');
      if (!scene) return false;

      const projectIndex = scene.projects.findIndex(p => p.id === projectId);
      if (projectIndex === -1) return false;

      scene.projects[projectIndex] = { ...scene.projects[projectIndex], ...updates };
      return true;
    } catch (error) {
      console.error('Error actualizando proyecto AR:', error);
      return false;
    }
  }

  // Eliminar proyecto AR
  async deleteARProject(projectId: string): Promise<boolean> {
    try {
      const scene = this.scenes.get('argentina_main');
      if (!scene) return false;

      const initialLength = scene.projects.length;
      scene.projects = scene.projects.filter(p => p.id !== projectId);

      return scene.projects.length < initialLength;
    } catch (error) {
      console.error('Error eliminando proyecto AR:', error);
      return false;
    }
  }

  // Generar código AR.js para una escena
  generateARCode(scene: ARScene): string {
    try {
      const arCode = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>¡BASTA! AR - ${scene.id}</title>
          <script src="https://aframe.io/releases/1.4.0/aframe.min.js"></script>
          <script src="https://raw.githack.com/AR-js-org/AR.js/3.4.5/aframe/build/aframe-ar.js"></script>
          <style>
            body { margin: 0; overflow: hidden; }
            .ar-info { position: absolute; top: 10px; left: 10px; color: white; z-index: 100; }
          </style>
        </head>
        <body>
          <div class="ar-info">
            <h3>¡BASTA! Realidad Aumentada</h3>
            <p>Apunta tu cámara a un marcador para ver proyectos</p>
          </div>

          <a-scene embedded arjs>
            <a-camera gps-camera="simulateLatitude: ${scene.cameraPosition.x}; simulateLongitude: ${scene.cameraPosition.z};"></a-camera>

            ${scene.markers.map(marker => `
              <a-anchor hit-testing-enabled="true" gps-entity-place="latitude: ${marker.position.y}; longitude: ${marker.position.x};">
                ${scene.projects.map(project => `
                  <a-box
                    position="${project.location.longitude} ${project.arModel.dimensions.height / 2} ${project.location.latitude}"
                    width="${project.arModel.dimensions.width}"
                    height="${project.arModel.dimensions.height}"
                    depth="${project.arModel.dimensions.depth}"
                    color="${project.arModel.color}"
                    animation="property: rotation; to: 0 360 0; loop: true; dur: 10000"
                  >
                  </a-box>
                `).join('')}
              </a-anchor>
            `).join('')}

            <a-light type="ambient" color="#fff" intensity="${scene.lighting.intensity}"></a-light>
          </a-scene>
        </body>
        </html>
      `;

      return arCode;
    } catch (error) {
      console.error('Error generando código AR:', error);
      return '<!-- Error generando código AR -->';
    }
  }

  // Generar configuración de AR para dispositivos móviles
  generateMobileARConfig(scene: ARScene): any {
    return {
      sceneId: scene.id,
      camera: {
        position: scene.cameraPosition,
        fov: 75,
        near: 0.1,
        far: 1000
      },
      lighting: scene.lighting,
      markers: scene.markers,
      projects: scene.projects.map(project => ({
        id: project.id,
        title: project.title,
        position: [
          project.location.longitude,
          project.arModel.dimensions.height / 2,
          project.location.latitude
        ],
        scale: [
          project.arModel.dimensions.width,
          project.arModel.dimensions.height,
          project.arModel.dimensions.depth
        ],
        color: project.arModel.color,
        type: project.arModel.type,
        impact: project.impact,
        animations: [
          {
            type: 'rotation',
            axis: [0, 1, 0],
            speed: 0.01
          }
        ]
      })),
      ui: {
        showInfo: true,
        showStats: true,
        language: 'es'
      }
    };
  }

  // Validar coordenadas GPS
  isValidCoordinates(latitude: number, longitude: number): boolean {
    return latitude >= -90 && latitude <= 90 && longitude >= -180 && longitude <= 180;
  }

  // Convertir coordenadas GPS a coordenadas de escena 3D
  gpsToSceneCoordinates(latitude: number, longitude: number, altitude: number = 0): { x: number; y: number; z: number } {
    // Conversión simplificada (en producción usar proyecciones más precisas)
    return {
      x: longitude,
      y: altitude,
      z: latitude
    };
  }

  // Crear marcador AR basado en ubicación
  async createLocationMarker(latitude: number, longitude: number, projectId?: string): Promise<string> {
    try {
      const markerId = `marker_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      const marker = {
        id: markerId,
        position: { x: longitude, y: latitude, z: 0 },
        type: 'gps' as const,
        data: `${latitude},${longitude}`,
        projectId
      };

      // Agregar marcador a la escena
      const scene = this.scenes.get('argentina_main');
      if (scene) {
        scene.markers.push(marker);
      }

      return markerId;
    } catch (error) {
      console.error('Error creando marcador de ubicación:', error);
      throw new Error(`Error creando marcador: ${error}`);
    }
  }
}

// Instancia singleton
export const arService = new ARService();
