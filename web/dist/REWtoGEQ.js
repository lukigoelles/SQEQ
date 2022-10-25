// REW Auto EQ to GEQ


function writeTextFile(afilename, output) {
  var txtFile = new File(afilename);
  txtFile.writeln(output);
  txtFile.close();
}

function makeArr(startValue, stopValue, cardinality) {
  var arr = [];
  var step = (stopValue - startValue) / (cardinality - 1);
  for (var i = 0; i < cardinality; i++) {
    arr.push(startValue + (step * i));
  }
  return arr;
}


function peakfilt(x, fc, fb, G, fs) {
  let H0 = 10 ** (G / 20) - 1;
  let b = (Math.tan(Math.PI * fb / fs) - 1) / (Math.tan(Math.PI * fb / fs) + 1);
  let c = -Math.cos(2 * Math.PI * fc / fs);
  let len = x.length + 2;
  let y1 = new Array(len).fill(0);
  let y = new Array(len).fill(0);
  let a = [0, 0];
  let in2 = a.concat(x);


  for (let ii = 2; ii < len; ii++) {
    y1[ii] = -b * in2[ii] + c * (1 - b) * in2[ii - 1] + in2[ii - 2] - c * (1 - b) * y1[ii - 1] + b * y1[ii - 2];
    y[ii] = H0 / 2 * (in2[ii] - y1[ii]) + in2[ii];
  }
  y.splice(0, 1);
  y.splice(0, 1);
  return y
}


var xyValues = [{ x: 50, y: 7 }];
var xyValues2 = [{ x: 50, y: 7 }];
var fGEQ = [20, 25, 31, 40, 50, 63, 80, 100, 125, 160, 200, 250, 315, 400, 500, 630, 800, 1000, 1250, 1600, 2000, 2500, 3150, 4000, 5000, 6300, 8000, 10000, 12500, 16000, 20000];

var text = [];
var result = [];
var position = [];
var f = [];
var gain = [];
var q = [];
var FFTlength = 0;
var sampleRate = 0;
var h = [];
var HRe = [];
var HIm = [];
var HAbs = [];
var Phase = [];
var HGEQ = [];
var HGEQI = [];
var HGEQF = [];
var ab = [];
var prefix = 'f712120b';
var msg = [];
var chNR = ['00','01','02','03','04','05','06','07','08','09','0a','0b','0c','0d','0e','0f','10','11','12','13','14','15','16','17','18','19','1a','1b','1c','1d','1e'];
var dezi = [0.1,0.2,0.3,0.4,0.5,0.6,0.7,0.8,0.9,0];
var deziH = ['10','2A','44','5E','78','92','AC','C6','E0','FA'];
var inte = [-12,-11,-10,-9,-8,-7,-6,-5,-4,-3,-2,-1,0,1,2,3,4,5,6,7,8,9,10,11,12];
var inteH = ['74','75','76','77','78','79','7a','7b','7c','7d','7e','7f','80','81','82','83','84','85','86','87','88','89','8a','8b','8c'];

var lights = document.getElementById("lights");
lights.height = 12;
lights.width = 12;
let lightctx = lights.getContext("2d");
lightctx.clearRect(0,0,lights.width,lights.height);
lightctx.fillStyle = "red";
lightctx.beginPath();
lightctx.arc(6,6, 6, 0, 2 * Math.PI);
lightctx.fill();

const ws = new WebSocket('ws://localhost:9898/');
ws.onopen = function() {
  console.log('WebSocket Client Connected');
  lightctx.fillStyle = "green";
  lightctx.beginPath();
  lightctx.arc(6,6, 6, 0, 2 * Math.PI);
  lightctx.fill();
};

document.getElementById('inputfile')
  .addEventListener('change', function () {

    var fr = new FileReader();
    fr.onload = function () {
      document.getElementById('output').textContent = fr.result;
      text = fr.result;

      for (let ii = 1; ii <= 21; ii++) {
        if (ii < 10) {
          let filter = "Filter  ";
          position[ii - 1] = text.indexOf(filter.concat(ii.toString()));
        } else {
          let filter = "Filter ";
          position[ii - 1] = text.indexOf(filter.concat(ii.toString()));
        }

      }

      for (let ii = 1; ii <= 20; ii++) {
        result[ii - 1] = text.substring(position[ii - 1], position[ii] - 2);
      }

      var positionFc = result[0].indexOf('Fc');
      var positionHz = result[0].indexOf('Hz');
      var positionGain = result[0].indexOf('Gain');
      var positiondB = result[0].indexOf('dB');
      var positionQ = result[0].indexOf('Q');

      for (let ii = 1; ii <= 20; ii++) {
        if (result[ii - 1].indexOf("None") != -1) {
          break;
        }
        f[ii - 1] = parseFloat(result[ii - 1].substring(positionFc + 2, positionHz));
        gain[ii - 1] = parseFloat(result[ii - 1].substring(positionGain + 4, positiondB));
        q[ii - 1] = parseFloat(result[ii - 1].substring(positionQ + 1, result[ii - 1].length));
      }

      if (document.getElementById('sampleRate').selectedIndex == 0) {
        sampleRate = 44100;
      } else if (document.getElementById('sampleRate').selectedIndex == 1) {
        sampleRate = 48000;
      } else {
        sampleRate = 96000;
      }

      if (document.getElementById('FFTsize').selectedIndex == 0) {
        FFTlength = 1024;
      } else if (document.getElementById('FFTsize').selectedIndex == 1) {
        FFTlength = 2048;
      } else {
        FFTlength = 4096;
      }

      h = new Array(FFTlength).fill(0);
      h[0] = 1;

      for (let ii = 0; ii < f.length; ii++) {
        h = peakfilt(h, f[ii], f[ii] / q[ii], gain[ii], sampleRate);
      }

      //var a = document.body.appendChild(
      //  document.createElement("a")
      //);
      //a.download = "export.json";
      //a.href = "data:text/plain;base64," + btoa(JSON.stringify(h));
      //a.innerHTML = "download IR as .json";

      // DFT
      var N = h.length;
      var dataArray = [];
      var fq = makeArr(0, sampleRate - sampleRate / N, N);
      HRe = new Array(N).fill(0);
      HIm = new Array(N).fill(0);
      for (let ii = 0; ii < N; ii++) {
        for (let jj = 0; jj < N; jj++) {
          HRe[ii] = HRe[ii] + h[jj] * Math.cos(Math.PI * 2 * jj * ii / N);
          HIm[ii] = HIm[ii] - h[jj] * Math.sin(Math.PI * 2 * jj * ii / N);
        }
        HAbs[ii] = 20 * Math.log10(Math.sqrt(HRe[ii] * HRe[ii] + HIm[ii] * HIm[ii]));
        Phase[ii] = Math.atan(HIm[ii] / HRe[ii]) * 180 / Math.PI;
        xyValues[ii] = new Object();
        xyValues[ii].x = fq[ii];
        xyValues[ii].y = HAbs[ii];
        xyValues2[ii] = new Object();
        xyValues2[ii].x = fq[ii];
        xyValues2[ii].y = Phase[ii];
      }



      var data = {
        labels: fq,
        datasets: [{
          label: 'Magnitude',
          data: xyValues,
          backgroundColor: "rgba(255,0,0,0.4)",
          borderColor: "rgba(255,0,0,1)",
          // this dataset is drawn below
          order: 1
        }]
      };

      var ctx = document.getElementById("myChart").getContext("2d");
      ctx.canvas.width = 500 * 1.5;
      ctx.canvas.height = 250 * 1.5;

      var myNewChart = new Chart(ctx, {
        type: 'line',
        heigth: 250 * 1.5,
        width: 500 * 1.5,
        data: data,
        options: {
          responsive: false,
          title: {
            display: true,
            text: 'Frequency Response of Filter'
          },
          scales: {
            yAxes: [{
              display: true,
              scaleLabel: {
                display: true,
                labelString: 'H in dB'
              }
            }],
            xAxes: [{
              ticks: {
                max: 24000
              },
              type: 'logarithmic',
              display: true,
              scaleLabel: {
                display: true,
                labelString: 'f in Hz'
              }
            }]
          }
        }
      }
      );

      var data = {
        labels: fq,
        datasets: [{
          label: 'Phase',
          data: xyValues2,
          backgroundColor: "rgba(0,0,255,0.4)",
          borderColor: "rgba(0,0,255,1)",
          // this dataset is drawn below
          order: 1
        }]
      };

      var ctx = document.getElementById("myChart2").getContext("2d");
      ctx.canvas.width = 500 * 1.5;
      ctx.canvas.height = 250 * 1.5;

      var myNewChart = new Chart(ctx, {
        type: 'line',
        heigth: 250 * 1.5,
        width: 500 * 1.5,
        data: data,
        options: {
          responsive: false,
          title: {
            display: true,
            text: 'Phase Response of Filter'
          },
          scales: {
            yAxes: [{
              display: true,
              scaleLabel: {
                display: true,
                labelString: 'phase in degree'
              }
            }],
            xAxes: [{
              ticks: {
                max: 24000
              },
              type: 'logarithmic',
              display: true,
              scaleLabel: {
                display: true,
                labelString: 'f in Hz'
              }
            }]
          }
        }
      }
      );

      for (let ii = 0; ii < fGEQ.length; ii++) {
        let fdiff = [];
        for (let jj = 0; jj < fq.length; jj++) {
          fdiff[jj] = Math.abs(fq[jj] - fGEQ[ii]);
        }
        let min = Math.min(...fdiff);
        let index = fdiff.indexOf(min);
        HGEQ[ii] = Math.round(HAbs[index] * 10) / 10;
      }


      var myTableDiv = document.getElementById("Table");

      var table = document.createElement('TABLE');
      table.border = '2';

      var tableBody = document.createElement('TBODY');
      table.appendChild(tableBody);

      var tr = document.createElement('TR');
      tableBody.appendChild(tr);
      var td = document.createElement('TD');
      td.width = '50';
      td.appendChild(document.createTextNode('f in Hz'));
      tr.appendChild(td);
      var td = document.createElement('TD');
      td.width = '50';
      td.appendChild(document.createTextNode('H in dB'));
      tr.appendChild(td);
      myTableDiv.appendChild(table);

      for (var ii = 0; ii < fGEQ.length; ii++) {
        var tr = document.createElement('TR');
        tableBody.appendChild(tr);

        for (var jj = 0; jj < 2; jj++) {
          var td = document.createElement('TD');
          td.width = '50';
          if (jj == 0) {
            td.appendChild(document.createTextNode(fGEQ[ii]));
          } else {
            td.appendChild(document.createTextNode(HGEQ[ii]));
          }

          tr.appendChild(td);
        }
      }
      myTableDiv.appendChild(table);

      var wav = new wavefile.WaveFile();
      var hex = [];
      var hmax = Math.max(...h);
      for (let ii = 0; ii < h.length; ii++) {
        hex[ii] = h[ii] / hmax * 2**31;
      }
      console.log(sampleRate);
      wav.fromScratch(1, sampleRate, '32', hex);



      ab = document.getElementById('download_link');
      ab.download = "export.wav";
      ab.href = wav.toDataURI();
      ab.innerHTML = "download IR as .wav";

     

    }

    fr.readAsText(this.files[0]);
  })


  function sendws(number){
    msg = [];

     // tiefste FQ ist 31.5 Hz bei SQ! 
     for (let ii = 2; ii < HGEQ.length; ii++){
      HGEQI[ii] = Math.floor(HGEQ[ii]);
      HGEQF[ii] = Math.round(10*(HGEQ[ii]-HGEQI[ii]))/10;
      let index = dezi.indexOf(HGEQF[ii]);
      let index2 = inte.indexOf(HGEQI[ii]);
      msg = msg + prefix + number + chNR[ii-2] + deziH[index] + inteH[index2];
      //console.log(msg);
      //ws.send(msg.toString());
      //msg = [];
    }
    ws.send(msg.toString())
  }