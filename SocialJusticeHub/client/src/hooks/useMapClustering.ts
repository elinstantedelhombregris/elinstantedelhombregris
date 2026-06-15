import { useEffect, useRef, useState } from 'react';

declare global {
  interface Window {
    L: any;
  }
}

export const useMapClustering = (
  mapInstance: any,
  leafletLoaded: boolean,
) => {
  const clusterGroupRef = useRef<any>(null);
  const [markerClusterLoaded, setMarkerClusterLoaded] = useState(false);

  // Load MarkerCluster library and CSS
  useEffect(() => {
    if (!leafletLoaded || typeof window === 'undefined' || !window.L) {
      return;
    }

    const cssHref =
      'https://unpkg.com/leaflet.markercluster@1.5.3/dist/MarkerCluster.css';
    const scriptSrc =
      'https://unpkg.com/leaflet.markercluster@1.5.3/dist/leaflet.markercluster.js';

    if (!document.querySelector(`link[href="${cssHref}"]`)) {
      const cssLink = document.createElement('link');
      cssLink.rel = 'stylesheet';
      cssLink.href = cssHref;
      document.head.appendChild(cssLink);
    }

    if (!document.querySelector(`script[src="${scriptSrc}"]`)) {
      const script = document.createElement('script');
      script.src = scriptSrc;
      script.onload = () => setMarkerClusterLoaded(true);
      document.head.appendChild(script);
    } else {
      setMarkerClusterLoaded(true);
    }
  }, [leafletLoaded]);

  // Create the cluster group once the library is loaded
  useEffect(() => {
    if (!leafletLoaded || !mapInstance || !markerClusterLoaded) {
      return;
    }

    const L = window.L;
    if (!L?.markerClusterGroup) {
      return;
    }

    if (clusterGroupRef.current) {
      return; // Already created
    }

    clusterGroupRef.current = L.markerClusterGroup({
      chunkedLoading: true,
      chunkDelay: 200,
      spiderfyOnMaxZoom: true,
      showCoverageOnHover: false,
      zoomToBoundsOnClick: true,
      maxClusterRadius: 50,
      iconCreateFunction: function (cluster: any) {
        const count = cluster.getChildCount();
        let size = 'small';

        if (count > 100) {
          size = 'large';
        } else if (count > 50) {
          size = 'medium';
        }

        // Clase scopeada al Mapa Soberano (este hook sólo lo usa SovereignMap),
        // para no pisar el estilo `.marker-cluster` que comparten otros mapas.
        return L.divIcon({
          html: `<div class="sov-cluster__inner"><span>${count}</span></div>`,
          className: `sov-cluster sov-cluster--${size}`,
          iconSize: L.point(46, 46),
        });
      }
    });

    mapInstance.addLayer(clusterGroupRef.current);

    return () => {
      if (clusterGroupRef.current && mapInstance) {
        mapInstance.removeLayer(clusterGroupRef.current);
        clusterGroupRef.current = null;
      }
    };
  }, [markerClusterLoaded, leafletLoaded, mapInstance]);

  return { clusterGroup: clusterGroupRef };
};

