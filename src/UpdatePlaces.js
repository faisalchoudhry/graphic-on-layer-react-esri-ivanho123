function UpdatePlaces(props) {
    const fetchApiData = async () => {
        const data = await fetch("https://ba899dea-d673-44ac-b57f-29155287ffd5.mock.pstmn.io/places_updated").then(res => res.json()).then(result => props.country({
            result
        })).catch(console.log);
        // console.log(props.country);
    }

    return (
        <div id="actions" className="esri-widget">
            <button className="esri-button" id="add" style={{width: "auto"}}
                    onClick={fetchApiData}>CLICK BUTTON TO UPDATE DATA
            </button>
        </div>
    )
}

export default UpdatePlaces;