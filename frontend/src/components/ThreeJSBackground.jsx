import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

const ThreeJSBackground = ({ containerRef }) => {
  const sceneRef = useRef(null);
  
  useEffect(() => {
    if (!containerRef.current) return;
    
    // Scene setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 20;
    
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0xffffff, 0);
    
    // Clear container and append new renderer
    if (containerRef.current.childNodes.length > 0) {
      containerRef.current.removeChild(containerRef.current.childNodes[0]);
    }
    containerRef.current.appendChild(renderer.domElement);
    
    // Create paw shapes
    const pawGroup = new THREE.Group();
    scene.add(pawGroup);
    
    // Create paw shape geometry
    const createPawGeometry = () => {
      const group = new THREE.Group();
      
      // Main pad
      const mainPad = new THREE.Mesh(
        new THREE.CircleGeometry(0.5, 32),
        new THREE.MeshBasicMaterial({ color: 0x4ade80, transparent: true, opacity: 0.3 })
      );
      group.add(mainPad);
      
      // Toe pads
      for (let i = 0; i < 3; i++) {
        const angle = (i - 1) * Math.PI / 6;
        const toe = new THREE.Mesh(
          new THREE.CircleGeometry(0.3, 32),
          new THREE.MeshBasicMaterial({ color: 0x4ade80, transparent: true, opacity: 0.3 })
        );
        toe.position.x = Math.sin(angle) * 0.65;
        toe.position.y = Math.cos(angle) * 0.65 + 0.5;
        group.add(toe);
      }
      
      // Upper toe
      const upperToe = new THREE.Mesh(
        new THREE.CircleGeometry(0.3, 32),
        new THREE.MeshBasicMaterial({ color: 0x4ade80, transparent: true, opacity: 0.3 })
      );
      upperToe.position.y = 0.9;
      group.add(upperToe);
      
      return group;
    };
    
    // Create pet silhouettes
    const createPetSilhouette = (type) => {
      const group = new THREE.Group();
      
      if (type === 'cat') {
        // Cat body
        const bodyGeometry = new THREE.CircleGeometry(0.5, 32);
        const bodyMaterial = new THREE.MeshBasicMaterial({ color: 0x065f46, transparent: true, opacity: 0.2 });
        const catBody = new THREE.Mesh(bodyGeometry, bodyMaterial);
        catBody.scale.y = 0.6;
        group.add(catBody);
        
        // Cat head
        const headGeometry = new THREE.CircleGeometry(0.25, 32);
        const headMaterial = new THREE.MeshBasicMaterial({ color: 0x065f46, transparent: true, opacity: 0.2 });
        const catHead = new THREE.Mesh(headGeometry, headMaterial);
        catHead.position.x = 0.5;
        group.add(catHead);
        
        // Cat ears
        const earGeometry = new THREE.ConeGeometry(0.1, 0.2, 32);
        const earMaterial = new THREE.MeshBasicMaterial({ color: 0x065f46, transparent: true, opacity: 0.2 });
        
        const leftEar = new THREE.Mesh(earGeometry, earMaterial);
        leftEar.position.set(0.4, 0.25, 0);
        leftEar.rotation.z = -Math.PI / 4;
        group.add(leftEar);
        
        const rightEar = new THREE.Mesh(earGeometry, earMaterial);
        rightEar.position.set(0.6, 0.25, 0);
        rightEar.rotation.z = Math.PI / 4;
        group.add(rightEar);
        
        // Cat tail
        const tailGeometry = new THREE.CylinderGeometry(0.05, 0.05, 0.5, 32);
        const tailMaterial = new THREE.MeshBasicMaterial({ color: 0x065f46, transparent: true, opacity: 0.2 });
        const catTail = new THREE.Mesh(tailGeometry, tailMaterial);
        catTail.position.set(-0.5, 0, 0);
        catTail.rotation.z = Math.PI / 2;
        group.add(catTail);
      } else {
        // Dog body
        const bodyGeometry = new THREE.CircleGeometry(0.6, 32);
        const bodyMaterial = new THREE.MeshBasicMaterial({ color: 0x065f46, transparent: true, opacity: 0.2 });
        const dogBody = new THREE.Mesh(bodyGeometry, bodyMaterial);
        dogBody.scale.y = 0.5;
        group.add(dogBody);
        
        // Dog head
        const headGeometry = new THREE.CircleGeometry(0.3, 32);
        const headMaterial = new THREE.MeshBasicMaterial({ color: 0x065f46, transparent: true, opacity: 0.2 });
        const dogHead = new THREE.Mesh(headGeometry, headMaterial);
        dogHead.position.x = 0.7;
        group.add(dogHead);
        
        // Dog ears
        const earGeometry = new THREE.CircleGeometry(0.15, 32);
        const earMaterial = new THREE.MeshBasicMaterial({ color: 0x065f46, transparent: true, opacity: 0.2 });
        
        const leftEar = new THREE.Mesh(earGeometry, earMaterial);
        leftEar.position.set(0.85, 0.3, 0);
        group.add(leftEar);
        
        const rightEar = new THREE.Mesh(earGeometry, earMaterial);
        rightEar.position.set(0.85, -0.3, 0);
        group.add(rightEar);
        
        // Dog tail
        const tailGeometry = new THREE.CylinderGeometry(0.05, 0.05, 0.4, 32);
        const tailMaterial = new THREE.MeshBasicMaterial({ color: 0x065f46, transparent: true, opacity: 0.2 });
        const dogTail = new THREE.Mesh(tailGeometry, tailMaterial);
        dogTail.position.set(-0.6, 0.1, 0);
        dogTail.rotation.z = Math.PI / 2;
        group.add(dogTail);
      }
      
      return group;
    };
    
    // Create particles
    const particles = [];
    const particleCount = 60;
    
    for (let i = 0; i < particleCount; i++) {
      let particle;
      
      if (i % 3 === 0) {
        particle = createPawGeometry();
      } else {
        particle = createPetSilhouette(i % 2 === 0 ? 'cat' : 'dog');
      }
      
      // Scale and position
      const scale = Math.random() * 2 + 1;
      particle.scale.set(scale, scale, scale);
      
      // Random position
      const spread = 50;
      particle.position.x = Math.random() * spread - spread/2;
      particle.position.y = Math.random() * spread - spread/2;
      particle.position.z = Math.random() * 20 - 10;
      
      // Random rotation
      particle.rotation.z = Math.random() * Math.PI * 2;
      
      // Add properties for animation
      particle.userData = {
        speed: Math.random() * 0.05 + 0.02,
        rotSpeed: (Math.random() - 0.5) * 0.01,
        direction: new THREE.Vector3(
          (Math.random() - 0.5) * 0.1,
          (Math.random() - 0.5) * 0.1,
          0
        )
      };
      
      particles.push(particle);
      pawGroup.add(particle);
    }
    
    // Handle window resize
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    
    window.addEventListener('resize', handleResize);
    
    // Animation
    const animate = () => {
      sceneRef.current = requestAnimationFrame(animate);
      
      // Rotate the entire paw group
      pawGroup.rotation.z += 0.001;
      
      // Update each particle
      particles.forEach(particle => {
        // Move particle
        particle.position.x += particle.userData.direction.x;
        particle.position.y += particle.userData.direction.y;
        
        // Rotate particle
        particle.rotation.z += particle.userData.rotSpeed;
        
        // Boundaries check
        const boundary = 30;
        if (Math.abs(particle.position.x) > boundary) {
          particle.userData.direction.x *= -1;
        }
        if (Math.abs(particle.position.y) > boundary) {
          particle.userData.direction.y *= -1;
        }
        
        // Subtle floating effect
        particle.position.y += Math.sin(Date.now() * 0.001 * particle.userData.speed) * 0.01;
      });
      
      // Move camera slightly for parallax
      camera.position.x = (window.scrollY * 0.001);
      
      renderer.render(scene, camera);
    };
    
    animate();
    
    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      if (sceneRef.current) {
        cancelAnimationFrame(sceneRef.current);
      }
      
      if (containerRef.current && containerRef.current.contains(renderer.domElement)) {
        containerRef.current.removeChild(renderer.domElement);
      }
      
      // Dispose of geometries and materials
      particles.forEach(particle => {
        particle.traverse(child => {
          if (child.geometry) child.geometry.dispose();
          if (child.material) {
            if (Array.isArray(child.material)) {
              child.material.forEach(material => material.dispose());
            } else {
              child.material.dispose();
            }
          }
        });
      });
      
      scene.remove(pawGroup);
      renderer.dispose();
    };
  }, [containerRef]);
  
  return null;
};

export default ThreeJSBackground;