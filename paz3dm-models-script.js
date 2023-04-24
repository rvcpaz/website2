// Import libraries
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.126.0/build/three.module.js'
import { OrbitControls } from 'https://cdn.jsdelivr.net/npm/three@0.126.0/examples/jsm/controls/OrbitControls.js'
import { Rhino3dmLoader } from 'https://cdn.jsdelivr.net/npm/three@0.126.0/examples/jsm/loaders/3DMLoader.js'
//import { GUI } from './dat.gui.module.js'; 
import { GUI } from 'https://cdn.jsdelivr.net/npm/dat.gui@0.7.9/build/dat.gui.module.js'

const select = document.getElementById( 'file-select' )
select.onchange = load

let model = 'hello_mesh.3dm'

const loader = new Rhino3dmLoader()
//loader.setLibraryPath( 'https://cdn.jsdelivr.net/npm/rhino3dm@7.7.0/' )
loader.setLibraryPath( 'https://cdn.jsdelivr.net/npm/rhino3dm@0.15.0-beta/' );

const material = new THREE.MeshNormalMaterial()
//const material = new THREE.MeshBasicMaterial({color: 0x005500, wireframe: true});



// BOILERPLATE //
let scene, camera, renderer, rhinoObject, mesh, gui;

init()
load()

function load() {

    if ( model === select.value  && rhinoObject !== undefined ) return;    // don't load what's already loaded

    //handle case when the selection isn't related to a 3dm file
    if ( select.value.includes( '.3dm' ) ) {
        model = select.value
    }

    document.getElementById( 'spinloader' ).style.display = 'block'

    // load model
    loader.load( model, function ( object ) {
        console.log( object )
        // clear scene
        scene.traverse( child => {
            if ( child.userData.hasOwnProperty( 'objectType' ) && child.userData.objectType === 'File3dm' ) {
              scene.remove( child )
            }
          } )

        object.traverse( child => {
            child.material = material
        })
        scene.add( object )
        // hide spinner
        document.getElementById( 'spinloader' ).style.display = 'none'
    } )
    document.getElementById( 'spinloader' ).style.display = 'none'
    // Load a 3DM file
    mesh = loader.load(
        // resource URL
        model,
        // called when the resource is loaded
        function ( object ) {

            object.traverse( child => {child.material = material})
            scene.add( object );
            initGUI( object.userData.layers );
        },
        // called as loading progresses
        function ( xhr ) {

            console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );

        },
        // called when loading has errors
        function ( error ) {

            console.log( 'An error happened' );

        }
    );

}



function init() {

    THREE.Object3D.DefaultUp = new THREE.Vector3(0,0,1)

    scene = new THREE.Scene()
    scene.background = new THREE.Color(1,1,1)
    camera = new THREE.PerspectiveCamera( 45, window.innerWidth/window.innerHeight, 1, 1000 )
    camera.position.set(26,-40,5)

    // add a directional light
    const directionalLight = new THREE.DirectionalLight(0xffffff)
    directionalLight.intensity = 2
    scene.add(directionalLight)

    const ambientLight = new THREE.AmbientLight()
    scene.add(ambientLight)

    renderer = new THREE.WebGLRenderer({antialias: true})
    renderer.setPixelRatio( window.devicePixelRatio )
    renderer.setSize( window.innerWidth, window.innerHeight )
    document.body.appendChild( renderer.domElement )
    /*
    const loader = new Rhino3dmLoader();
    loader.setLibraryPath( 'https://cdn.jsdelivr.net/npm/rhino3dm@0.15.0-beta/' );
    loader.load(model, function ( object ) {
        scene.add( object );
        initGUI( object.userData.layers );
    } );
    */
    const controls = new OrbitControls( camera, renderer.domElement )

    window.addEventListener( 'resize', onWindowResize, false )

    gui = new GUI( { width: 300 } );
    
    animate()
}

function animate () {
    requestAnimationFrame( animate )
    //mesh.rotation.x += 0.01;    
    renderer.render( scene, camera )
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight
    camera.updateProjectionMatrix()
    renderer.setSize( window.innerWidth, window.innerHeight )
    animate()

}

function initGUI( layers ) {
    gui.destroy()
    gui = new GUI( { width: 300 } );
    const layersControl = gui.addFolder( 'controls' );
    layersControl.open();
    for ( let i = 0; i < layers.length; i ++ ) {
        const layer = layers[ i ];
        layersControl.add( layer, 'visible' ).name( layer.name ).onChange( function ( val ) {
            const name = this.object.name;
            scene.traverse( function ( child ) {
                if ( child.userData.hasOwnProperty( 'attributes' ) ) {
                    if ( 'layerIndex' in child.userData.attributes ) {
                        const layerName = layers[ child.userData.attributes.layerIndex ].name;
                        if ( layerName === name ) {
                            child.visible = val;
                            layer.visible = val;
                        }
                    }
                }
            } );
        } );
    }
    layersControl.updateDisplay()
    var guicontrols = new function() {
        this.bkcolor = "#ff00ff";
    }

    let bkcolor = gui.addColor(guicontrols, 'bkcolor').name("Scene color").onChange(function(value) { scene.background.set( value );});

}
