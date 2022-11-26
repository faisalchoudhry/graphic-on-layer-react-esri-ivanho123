import {useEffect, useRef, useState, lazy, Suspense} from 'react';
import {loadModules} from "esri-loader";

const UpdatePlaces = lazy(() => import("./UpdatePlaces"));

const Maps = () => {
    let view, beginScale;
    const MapElement = useRef(null);
    const beginScaleRef = useRef(8);
    const [country, setCountry] = useState([])

    useEffect(
        () => {
            loadModules(["esri/views/MapView", "esri/Map", "esri/layers/FeatureLayer", "esri/Graphic", "esri/geometry/SpatialReference",
                "esri/widgets/Legend", "esri/core/watchUtils"], {
                css: true
            }).then(([MapView, Map, FeatureLayer, Graphic, SpatialReference, Legend, watchUtils]) => {
                //Map will be created here
                const map = new Map({
                    basemap: 'topo-vector',
                });

                try {
                    if (country.result.places.length > 0) {
                        view = new MapView({
                            // spatialReference: 28992,
                            zoom: beginScaleRef.current, //Zoom Level can be Between 0 to 23
                            center: [5.3093833, 52.1585149], //longitude, latitude
                           container: MapElement.current,
                            map: map //map created above
                        });

                        view.when(function () {
                            // MapView is now ready for display and can be used. Here we will
                            // use goTo to view a particular location at a given zoom level and center
                            view.goTo({
                                center: [5.3093833, 52.1585149],
                                // zoom: 12
                                zoom: beginScaleRef.current,
                            });
                        })
                            .catch(function (err) {
                                // A rejected view indicates a fatal error making it unable to display.
                                // Use the errback function to handle when the view doesn't load properly
                                console.error("MapView rejected:", err);
                            });

                        watchUtils.when(view, "interacting", function () {
                            beginScale = view.get('scale');
                        });

                        watchUtils.when(view, "stationary", function () {
                            const currentScale = view.get('scale');
                            if (currentScale !== beginScale) {
                               beginScaleRef.current = view.get('zoom');
                           }
                        });

                        const responseData = country;

                        // spatial reference of base map and dataset is in wkid 28992
                        const dataSR = new SpatialReference({wkid: 28992});

                        // construct featureset with Graphics of JSON fetched from API and set state
                        const featuresArcGIS = responseData.result.places.map((item, i) => new Graphic({
                            geometry: {
                                spatialReference: dataSR,
                                type: 'polygon',
                                rings: item.geometry.rings
                            },
                            attributes: {
                                ObjectID: i,
                                naam: item.attributes.naam,
                                TIJD_PRIJS_1: parseInt(item.attributes.TIJD_PRIJS_1),
                                TIJD_PRIJS_11: item.attributes.TIJD_PRIJS_1.toString().replace(/\B(?=(\d{3})+(?!\d))/g, "."),
                                Oppervlakte: item.attributes.Area
                            }

                        }));

                        // console.log(featuresArcGIS);

                        const featureLayer = new FeatureLayer({
                            source: featuresArcGIS,  // array of graphics objects
                            objectIdField: "OBJECTID",
                            fields: [{
                                name: "OBJECTID",
                                type: "oid"
                            }, {
                                name: "naam",
                                type: "string"
                            }, {
                                name: "TIJD_PRIJS_1",
                                type: "integer"
                            }, {
                                name: "TIJD_PRIJS_11",
                                type: "string"
                            }, {
                                name: "Oppervlakte",
                                type: "string"
                            }],
                            popupTemplate: {
                                content: "<div><h3 class='titlePopup'>Projectebied:{naam}</h3>" +
                                    "<div><table class='customers'>" +
                                    "<tr style='text-align: left'><th>Naam</th><th>{Naam}</th></tr>" +
                                    "<tr style='text-align: left'><th>Effect on project</th><th>{TIJD_PRIJS_11}</th></tr>" +
                                    "<tr style='text-align: left'><th>m2 kavel</th><th>{Oppervlakte}</th></tr>" +
                                    "</table></div>" +
                                    "</div>"
                            },
                            renderer: {  // overrides the layer's default renderer
                                type: "simple",
                                symbol: {
                                    type: "simple-fill",
                                    // color: "#61ee57",
                                    // text: "\ue661",
                                    // font: {
                                    //     size: 20,
                                    //     family: "CalciteWebCoreIcons"
                                    // }
                                },
                                // },
                                visualVariables: [
                                    {
                                        type: "color",
                                        field: "TIJD_PRIJS_1",
                                        stops: [
                                            {value: 5000000, color: "#2ECEA2"},
                                            {value: 4000000, color: "#2EA7AB"},
                                            {value: 3000000, color: "#5DA484"},
                                            {value: 2000000, color: "#F9DC90"},
                                            {value: 1000000, color: "#B27829"}
                                        ]
                                    }

                                ]
                            }
                        });

                        console.log(featureLayer);
                        let legend = new Legend({
                            view: view,
                            layerInfos: [{title: "Places", layer: featureLayer}]
                        }, "legend");

                        map.add(featureLayer);

                        view.ui.add(legend, "bottom-left");


                    } else {
                        // console.log("no country");
                    }
                } catch (e) {

                }
            });

        },);

    useEffect(
        () => {
            fetchApiOnLoad();
        }, []);
    const fetchApiOnLoad = async () => {
        const data = await fetch("https://ba899dea-d673-44ac-b57f-29155287ffd5.mock.pstmn.io/places").then(res => res.json()).then(result => setCountry({
            result
        })).catch(console.log);
        // console.log(props.country);
    }
    return (
        <>
            <div style={{height: 600}} ref={MapElement}>
            </div>
            <Suspense fallback={<div style={{bottom: 0, position: "absolute"}}>Please wait...</div>}>
                <UpdatePlaces country={setCountry}></UpdatePlaces>
            </Suspense>
        </>
    );

}

export default Maps;