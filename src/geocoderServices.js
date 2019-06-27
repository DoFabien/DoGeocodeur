const geocoderIgn = async (row) => {
    const key_ign = '84v2ztn6o2zhslasn4phvjkc';
    const payload = `<?xml version="1.0" encoding="UTF-8"?> 
    <XLS 
     xmlns:xls="http://www.opengis.net/xls" 
     xmlns:gml="http://www.opengis.net/gml" 
     xmlns="http://www.opengis.net/xls" 
     xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" 
     version="1.2" 
     xsi:schemaLocation="http://www.opengis.net/xls 
    http://schemas.opengis.net/ols/1.2/olsAll.xsd"> 
     <RequestHeader/> 
     <Request requestID="1" version="1.2" methodName="LocationUtilityService"> 
     <GeocodeRequest returnFreeForm="false"> 
     <Address countryCode="StreetAddress"> 
     <StreetAddress> 
     <Street> ${row.num} ${row.adresse} </Street> 
     </StreetAddress> 
     <Place type="Municipality"> ${row.commune} </Place> 
     <PostalCode>${row.cp}</PostalCode> 
     </Address> 
     </GeocodeRequest> 
     </Request> 
    </XLS>`

    const payloadEncoded = encodeURIComponent(payload);
    let url = `https://wxs.ign.fr/${key_ign}/geoportail/ols?xls=${payloadEncoded}`;

    const result = await fetch(url);
    const string = await result.text()


    const coords = string.match(/<gml:pos>.*<\/gml:pos>/)[0]
        .replace('<gml:pos>', '')
        .replace('</gml:pos>', '')
        .split(' ')
        .map(c => parseFloat(c))

    const lat = coords[0]
    const lng = coords[1]

    const matchType = string.match(/matchType=".*"/)[0]
        .replace('matchType="', '')
        .replace('"', '')

    let accuracy = string.match(/accuracy=".*"\s/)[0]
        .replace('accuracy="', '')
        .replace('"', '')
        .trim();
    accuracy = parseFloat(accuracy);

    let qualite = string.match(/<Place\stype="Qualite">.*<\/Place>/)[0]
        .replace('<Place type="Qualite">', '')
        .replace('</Place>', '');


    var score_matchType = 0;
    var score_qualite = 0;
    var score_accuracy = 0;

    switch (matchType) {
        case 'Street number': score_matchType = 90; break;
        case 'Street': score_matchType = 60; break;
        default: score_matchType = 0; break;
    }
         
    switch (qualite) {
        case 'Plaque adresse': score_qualite = 8; break;
        case '2.5': score_qualite = 8; break;
        case 'Projection': score_qualite = 6; break;
        case '1.5': score_qualite = 5; break;
        default: score_qualite = 0; break;
    }

    switch (accuracy) {
        case 1: score_accuracy = 1; break;
        default: score_accuracy = 0; break;
    }

    const score = score_matchType + score_qualite + score_accuracy;

    return { ...row, coords: { 'lat': lat, 'lng': lng }, score: score, geocoder: 'IGN' }
}

const geocoderBan = async (row) => {
    console.log(row);

    var adresse = row.num + ' ' + row.adresse + ',' + row.cp + ',' + row.commune + ', France';
    var adresse_encoded = encodeURIComponent(adresse);
    var url = "http://api-adresse.data.gouv.fr/search/?q=" + adresse_encoded + "&limit=1"
    const result = await fetch(url)
    const data = await result.json()
    console.log(data);

    if (data.features[0]) {
        const res = data.features[0];
        const lat = res.geometry.coordinates[1];
        const lng = res.geometry.coordinates[0];

        let score = 0;
        let score_type = 0;
        let score_precision = 0;

        switch (res.properties.type) {
            case 'housenumber': score_type = 90; break;
            case 'street': score_type = 60; break;
            case 'locality': score_type = 50; break;
            case 'municipality': score_type = 30; break;
            
            default: score_type = 0; break;
        }

        const _score = res.properties.score;
        if (_score > 0.80) { score_precision = 9 }
        else if (_score > 0.70) { score_precision = 7 }
        else if (_score > 0.60) { score_precision = 6 }
        else if (_score > 0.50) { score_precision = 0 }
        else if (_score > 0.40) { score_precision = -3 }
        else if (_score > 0.20) { score_precision = -5 }
        else if (_score > 0.10) { score_precision = -10 }
        else { score_precision = -12 };

        score = score_type + score_precision;
        return { ...row, coords: { 'lat': lat, 'lng': lng }, score: score, geocoder: 'BAN' }
    }
}

const geocoderBing = async (row) => {
    const key = 'ApGNBLFopxSDAUAGO6L8uf6Cj9m-E25CS1OLbVxatLrFVLU89ISYatcs_qPSLrHY';
    // http://dev.virtualearth.net/REST/v1/Locations/FR/38480/Romagnieu/Impasse du bas fort?includeNeighborhood=false&maxResults=1&key=ApGNBLFopxSDAUAGO6L8uf6Cj9m-E25CS1OLbVxatLrFVLU89ISYatcs_qPSLrHY
    const url = `http://dev.virtualearth.net/REST/v1/Locations/FR/${row.cp}/${row.commune}/${row.num + ' ' + row.adresse}?maxResults=1&key=${key}`
    const result = await fetch(url)
    const data = await result.json()

    var score_type = 0;
    var score_precision = 0;
    var score = 0;

    var statut = data.statusDescription;
    if (statut == 'OK') {
        // console.log(data);
        if (data.resourceSets[0].resources.length > 0) {
            //    console.log(data.resourceSets[0].resources[0]);

            var lat = data.resourceSets[0].resources[0].geocodePoints[0].coordinates[0];
            var lng = data.resourceSets[0].resources[0].geocodePoints[0].coordinates[1]
            var entityType = data.resourceSets[0].resources[0].entityType;
            var confidence = data.resourceSets[0].resources[0].confidence;
            var matchCodes = data.resourceSets[0].resources[0].matchCodes[0];
            var calculationMethod = data.resourceSets[0].resources[0].geocodePoints[0].calculationMethod;
            //  console.log(lat + '  ' + lng +' | '+  entityType + ' '+matchCodes + ' '+ confidence + ' ' + calculationMethod);

            switch (entityType) {
                case 'Address': score_type = 90; break;
                case 'RoadBlock': score_type = 60; break;
                case 'Postcode1': score_type = 20; break;
                default: score_type = 0; break;
            }

            switch (calculationMethod) {
                case 'Rooftop': score_precision = 9; break;
                case 'Parcel': score_precision = 8; break;
                case 'InterpolationOffset': score_precision = 8; break;
                case 'Interpolation': score_precision = 6; break;
                default: score_precision = 0; break;
            }


            score = score_type + score_precision;
            return { ...row, coords: { 'lat': lat, 'lng': lng }, score: score, geocoder: 'Bing' }

        }

    }
}

const geocoderMapbox = async (row) => {
    const key = 'pk.eyJ1IjoiZG9mIiwiYSI6IlZvQ3VNbXcifQ.8_mV5dw1jVkC9luc6kjTsA'
    const adresse = `${row.num} ${row.adresse} , ${row.cp} , ${row.commune} , ${row.pays}`;
    const adresse_encoded = encodeURIComponent(adresse);
    const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${adresse_encoded}.json?limit=1&access_token=${key}`
    const result = await fetch(url)
    const data = await result.json()
    if (data.features[0]) {
        const accuracy = data.features[0].properties.accuracy;
        let relevance = data.features[0].relevance || 0;
        const place_type = data.features[0].place_type[0]

        const lat = data.features[0].center[1];
        const lng = data.features[0].center[0];

        relevance = Math.round((relevance - 0.1) * 10);

        let score = 0;
        let score_type = 0;

        switch (place_type) {
            case 'address': score_type = 90; break;
            case 'poi': score_type = 80; break;
            case 'neighborhood': score_type = 30; break;
            case 'locality': score_type = 30; break;
            case 'locality': place = 30; break;
            case 'postcode': score_type = 20; break;
            case 'region': score_type = 10; break;
            case 'country': score_type = 0; break;
            default: score_type = 0; break;
        }
        if (place_type == 'address') {
            if (accuracy === 'street') {
                score_type = 60;
            }
        }

        score = score_type + relevance;
        return { ...row, coords: { 'lat': lat, 'lng': lng }, score: score, geocoder: 'MapBox' }
    }

    // https://api.mapbox.com/geocoding/v5/mapbox.places/57%20impasse%20du%20bas%20fort,%2038480%20Romagnieu%20France.json?limit=1&access_token=pk.eyJ1IjoiZG9mIiwiYSI6IlZvQ3VNbXcifQ.8_mV5dw1jVkC9luc6kjTsA
    // https://docs.mapbox.com/api/search/#geocoding
}

const geocoderGoogle = async (row) => {
    const key = 'AIzaSyCRu8pjG5diwFHKXcaMxxIM2jILJdnOKwI';

    const adresse = `${row.num} ${row.adresse} , ${row.cp} , ${row.commune} , ${row.pays}`;
    var adresse_encoded = encodeURIComponent(adresse);
    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${adresse_encoded}&sensor=true&key=${key}`

    const result = await fetch(url)
    const data = await result.json()

    if (data.status == 'OK') {

        const lat = data.results[0].geometry.location.lat;
        const lng = data.results[0].geometry.location.lng

        var score = 0;
        var score_type = 0;
        var score_precision = 0;

        switch (data.results[0].types[0]) {
            case 'street_number': score_type = 90; break;
            case 'street_address': score_type = 90; break;
            case 'premise': score_type = 90; break;
            case 'subpremise': score_type = 90; break;
            case 'point_of_interest': score_type = 80; break;
            case 'park': score_type = 80; break;
            case 'route': score_type = 60; break;
            case 'sublocality': score_type = 50; break;
            case 'locality': score_type = 30; break;
            case 'postal_code': score_type = 20; break;
            case 'country': score_type = 10; break;
            default: score_type = 0; break;
        }
        switch (data.results[0].geometry.location_type) {
            case 'ROOFTOP': score_precision = 9; break;
            case 'RANGE_INTERPOLATED': score_precision = 7; break;
            case 'GEOMETRIC_CENTER': score_precision = 5; break;
            case 'APPROXIMATE': score_precision = 3; break;
            default: score_type = 0; break;
        }
        score = score_type + score_precision;
        return { ...row, coords: { 'lat': lat, 'lng': lng }, score: score, geocoder: 'Google' }
    }

}

export {
    geocoderIgn,
    geocoderBan,
    geocoderBing,
    geocoderGoogle,
    geocoderMapbox

}