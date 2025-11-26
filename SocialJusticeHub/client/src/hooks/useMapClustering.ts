import { useEffect, useRef, useState } from 'react';

declare global {
  interface Window {
    L: any;
  }
}

export const useMapClustering = (
  mapInstance: any,
  markers: any[],
  leafletLoaded: boolean,
  markerDeps: unknown
) => {
  const clusterGroupRef = useRef<any>(null);
  const [markerClusterLoaded, setMarkerClusterLoaded] = useState(false);
  const [clusterReady, setClusterReady] = useState(false);

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

  useEffect(() => {
    if (!leafletLoaded || !mapInstance) {
      setClusterReady(false);
      return;
    }

    if (
      !markerClusterLoaded ||
      !window.L?.markerClusterGroup ||
      !markers.length
    ) {
      if (clusterGroupRef.current && mapInstance) {
        mapInstance.removeLayer(clusterGroupRef.current);
        clusterGroupRef.current = null;
      }
      setClusterReady(false);
      return;
    }

    const L = window.L;

    if (!L.markerClusterGroup) {
      setClusterReady(false);
      return;
    }

    if (clusterGroupRef.current) {
      mapInstance.removeLayer(clusterGroupRef.current);
      clusterGroupRef.current = null;
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

        const className = `marker-cluster-${size}`;

        return L.divIcon({
          html: `<div><span>${count}</span></div>`,
          className: `marker-cluster ${className}`,
          iconSize: L.point(40, 40)
        });
      }
    });

    markers.forEach(({ marker }) => {
      if (marker) {
        clusterGroupRef.current.addLayer(marker);
      }
    });

    mapInstance.addLayer(clusterGroupRef.current);
    setClusterReady(true);

    return () => {
      if (clusterGroupRef.current && mapInstance) {
        mapInstance.removeLayer(clusterGroupRef.current);
        clusterGroupRef.current = null;
      }
      setClusterReady(false);
    };
  }, [markerClusterLoaded, leafletLoaded, mapInstance, markerDeps]);

  return { clusterReady };
};

