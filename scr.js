const radar = document.querySelector('#radar');
radar.createNode("label 1", 500,500);
radar.redraw();
// radar.backgroundColor = "blue";
// console.log(radar._segments);

const radarBuilder = document.querySelector('#radar-builder');
radarBuilder.segmentList = [
    { label: 'fff'},
    { label: 'aaa'}
]
radarBuilder.construct();