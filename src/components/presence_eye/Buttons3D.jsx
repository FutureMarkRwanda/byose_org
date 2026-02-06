// import React, { Suspense } from 'react';
// import { Canvas } from '@react-three/fiber';
// import { 
//     useGLTF, 
//     OrbitControls, 
//     PerspectiveCamera, 
//     Float, 
//     ContactShadows, 
//     Environment,
//     PresentationControls
// } from '@react-three/drei';

// // This component loads the actual file
// function Model({ url }) {
//     // If you have a .glb file, uncomment the line below:
//     const { scene } = useGLTF(url);
//     return <primitive object={scene} scale={2} />;

//     // Placeholder: A high-end "Buttons" digital twin shape
//     // return (
//     //     <mesh scale={[1.2, 1.2, 0.4]}>
//     //         <boxGeometry args={[1, 1, 1]} />
//     //         <meshStandardMaterial color="#195C51" roughness={0.1} metalness={0.8} />
//     //     </mesh>
//     // );
// }

// const Buttons3D = () => {
//     return (
//         <div className="w-full h-[400px] md:h-[500px] lg:h-[600px] relative">
//             {/* Ethereal background glow behind the 3D object */}
//             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-[#195C51]/10 rounded-full blur-[80px] -z-10"></div>
            
//             <Canvas shadows dpr={[1, 2]}>
//                 <PerspectiveCamera makeDefault position={[0, 0, 4]} fov={45} />
                
//                 {/* Lighting to make it look "Apple-style" premium */}
//                 <ambientLight intensity={0.5} />
//                 <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} shadow-mapSize={2048} castShadow />
//                 <Environment preset="city" />

//                 <Suspense fallback={null}>
//                     {/* PresentationControls allow smooth, restricted rotation */}
//                     <PresentationControls
//                         global
//                         config={{ mass: 2, tension: 500 }}
//                         snap={{ mass: 4, tension: 1500 }}
//                         rotation={[0, 0.3, 0]}
//                         polar={[-Math.PI / 3, Math.PI / 3]}
//                         azimuth={[-Math.PI / 1.4, Math.PI / 1.4]}
//                     >
//                         {/* Float makes it drift weightlessly */}
//                         <Float speed={2} rotationIntensity={1} floatIntensity={1}>
//                             <Model url="/assets/models/buttons.glb" />
//                         </Float>
//                     </PresentationControls>

//                     {/* High-end soft shadow on the "ground" */}
//                     <ContactShadows 
//                         position={[0, -1.5, 0]} 
//                         opacity={0.4} 
//                         scale={10} 
//                         blur={2.5} 
//                         far={4.5} 
//                     />
//                 </Suspense>

//                 <OrbitControls enableZoom={false} autoRotate autoRotateSpeed={0.5} />
//             </Canvas>

//             {/* Instruction Tag */}
//             <div className="absolute bottom-4 left-1/2 -translate-x-1/2">
//                 <p className="text-[9px] font-black uppercase tracking-[0.3em] text-gray-300">
//                     Drag to Inspect 360°
//                 </p>
//             </div>
//         </div>
//     );
// };

// export default Buttons3D;