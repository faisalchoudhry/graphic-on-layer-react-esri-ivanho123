import {loadModules} from "esri-loader";
import {useRef} from "react";

function MapView(props) {
    let view;
    // const MapElement = useRef(null);
    loadModules(["esri/views/MapView", "esri/Map", "esri/widgets/Legend"], {
        css: true
    }).then(([MapView, Map, Legend]) => {
        //Map will be created here
        const map = new Map({
            basemap: 'topo-vector',
        });

        try {
            if (props.featureLayerr === null){
                view = new MapView({
                    // spatialReference: 28992,
                    zoom: 8, //Zoom Level can be Between 0 to 23
                    center: [5.3093833, 52.1585149], //longitude, latitude
                    container: props.MapElement.current,
                    map: map //map created above
                });
            }else {
                view = new MapView({
                    // spatialReference: 28992,
                    zoom: 8, //Zoom Level can be Between 0 to 23
                    center: [5.3093833, 52.1585149], //longitude, latitude
                    container: props.MapElement.current,
                    map: map //map created above
                });

                let legend = new Legend({
                    view: view,
                    layerInfos: [{title: "Places", layer: props.featureLayerr}]
                }, "legend");

                map.add(props.featureLayerr);

                view.ui.add(legend, "bottom-left");


            }
        } catch (e) {

        }
        return () => {
            if (view) {
                // destroy the map view
                view.container = null;
            }
        };
    });
}

export default MapView;