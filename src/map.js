import L from "leaflet";

const getIcon = (row) => {

    let url_marker = '';
    const score = row.score;
    if (score > 99){url_marker='./assets/images/black.png';}
    else if (score > 89 && score < 100){url_marker='./assets/images/9x.png';}
    else if (score > 79 && score < 90){url_marker='./assets/images/8x.png';}
    else if (score > 69 && score < 80){url_marker='./assets/images/7x.png';}
    else if (score > 59 && score < 70){url_marker='./assets/images/6x.png';}
    else if (score > 49 && score < 60){url_marker='./assets/images/5x.png';}
    else if (score < 49){url_marker='./assets/images/2x.png';}

    var icon = L.icon({
      iconUrl: url_marker,
      shadowUrl: "./assets/images/markers-shadow.png",
      iconSize: [30, 41],
      iconAnchor: [15, 40],
      shadowSize: [35, 16],
      shadowAnchor: [5, 15]
    });

    return icon;
}


export  {
  getIcon

}