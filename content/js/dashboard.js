/*
   Licensed to the Apache Software Foundation (ASF) under one or more
   contributor license agreements.  See the NOTICE file distributed with
   this work for additional information regarding copyright ownership.
   The ASF licenses this file to You under the Apache License, Version 2.0
   (the "License"); you may not use this file except in compliance with
   the License.  You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
*/
var showControllersOnly = false;
var seriesFilter = "";
var filtersOnlySampleSeries = true;

/*
 * Add header in statistics table to group metrics by category
 * format
 *
 */
function summaryTableHeader(header) {
    var newRow = header.insertRow(-1);
    newRow.className = "tablesorter-no-sort";
    var cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 1;
    cell.innerHTML = "Requests";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 3;
    cell.innerHTML = "Executions";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 7;
    cell.innerHTML = "Response Times (ms)";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 2;
    cell.innerHTML = "Network (KB/sec)";
    newRow.appendChild(cell);
}

/*
 * Populates the table identified by id parameter with the specified data and
 * format
 *
 */
function createTable(table, info, formatter, defaultSorts, seriesIndex, headerCreator) {
    var tableRef = table[0];

    // Create header and populate it with data.titles array
    var header = tableRef.createTHead();

    // Call callback is available
    if(headerCreator) {
        headerCreator(header);
    }

    var newRow = header.insertRow(-1);
    for (var index = 0; index < info.titles.length; index++) {
        var cell = document.createElement('th');
        cell.innerHTML = info.titles[index];
        newRow.appendChild(cell);
    }

    var tBody;

    // Create overall body if defined
    if(info.overall){
        tBody = document.createElement('tbody');
        tBody.className = "tablesorter-no-sort";
        tableRef.appendChild(tBody);
        var newRow = tBody.insertRow(-1);
        var data = info.overall.data;
        for(var index=0;index < data.length; index++){
            var cell = newRow.insertCell(-1);
            cell.innerHTML = formatter ? formatter(index, data[index]): data[index];
        }
    }

    // Create regular body
    tBody = document.createElement('tbody');
    tableRef.appendChild(tBody);

    var regexp;
    if(seriesFilter) {
        regexp = new RegExp(seriesFilter, 'i');
    }
    // Populate body with data.items array
    for(var index=0; index < info.items.length; index++){
        var item = info.items[index];
        if((!regexp || filtersOnlySampleSeries && !info.supportsControllersDiscrimination || regexp.test(item.data[seriesIndex]))
                &&
                (!showControllersOnly || !info.supportsControllersDiscrimination || item.isController)){
            if(item.data.length > 0) {
                var newRow = tBody.insertRow(-1);
                for(var col=0; col < item.data.length; col++){
                    var cell = newRow.insertCell(-1);
                    cell.innerHTML = formatter ? formatter(col, item.data[col]) : item.data[col];
                }
            }
        }
    }

    // Add support of columns sort
    table.tablesorter({sortList : defaultSorts});
}

$(document).ready(function() {

    // Customize table sorter default options
    $.extend( $.tablesorter.defaults, {
        theme: 'blue',
        cssInfoBlock: "tablesorter-no-sort",
        widthFixed: true,
        widgets: ['zebra']
    });

    var data = {"OkPercent": 71.083, "KoPercent": 28.917};
    var dataset = [
        {
            "label" : "KO",
            "data" : data.KoPercent,
            "color" : "#FF6347"
        },
        {
            "label" : "OK",
            "data" : data.OkPercent,
            "color" : "#9ACD32"
        }];
    $.plot($("#flot-requests-summary"), dataset, {
        series : {
            pie : {
                show : true,
                radius : 1,
                label : {
                    show : true,
                    radius : 3 / 4,
                    formatter : function(label, series) {
                        return '<div style="font-size:8pt;text-align:center;padding:2px;color:white;">'
                            + label
                            + '<br/>'
                            + Math.round10(series.percent, -2)
                            + '%</div>';
                    },
                    background : {
                        opacity : 0.5,
                        color : '#000'
                    }
                }
            }
        },
        legend : {
            show : true
        }
    });

    // Creates APDEX table
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.47848, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.526275, 500, 1500, "\u83B7\u5F97\u5DE9\u56FA\u590D\u4E60\u9898"], "isController": false}, {"data": [0.2969, 500, 1500, "\u7528\u6237\u767B\u5F55"], "isController": false}, {"data": [0.530975, 500, 1500, "\u83B7\u53D6\u5DE9\u56FA\u590D\u4E60\u5386\u53F2\u9519\u9898"], "isController": false}, {"data": [0.5088, 500, 1500, "\u83B7\u53D6\u7528\u6237\u4FE1\u606F"], "isController": false}, {"data": [0.52945, 500, 1500, "\u63D0\u4EA4\u5DE9\u56FA\u9898\u7B54\u6848"], "isController": false}]}, function(index, item){
        switch(index){
            case 0:
                item = item.toFixed(3);
                break;
            case 1:
            case 2:
                item = formatDuration(item);
                break;
        }
        return item;
    }, [[0, 0]], 3);

    // Create statistics table
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 100000, 28917, 28.917, 675.2841899999984, 0, 31055, 115.0, 880.0, 1073.9500000000007, 1580.9800000000032, 1918.5020336121556, 680.8497487661633, 620.4175155038945], "isController": false}, "titles": ["Label", "#Samples", "KO", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions\/s", "Received", "Sent"], "items": [{"data": ["\u83B7\u5F97\u5DE9\u56FA\u590D\u4E60\u9898", 20000, 5787, 28.935, 322.9818000000003, 0, 2417, 172.0, 743.9000000000015, 788.0, 950.0, 399.86404622428375, 135.5899345784933, 119.86459759931623], "isController": false}, {"data": ["\u7528\u6237\u767B\u5F55", 20000, 5713, 28.565, 2062.4346500000197, 3, 31055, 1091.0, 3231.800000000003, 15837.900000000001, 21221.0, 385.10417067816843, 158.08364492673394, 97.36971594957062], "isController": false}, {"data": ["\u83B7\u53D6\u5DE9\u56FA\u590D\u4E60\u5386\u53F2\u9519\u9898", 20000, 5748, 28.74, 321.0342999999997, 0, 2183, 183.5, 748.0, 793.0, 967.9800000000032, 399.88003598920324, 136.4246975907228, 137.7665216060182], "isController": false}, {"data": ["\u83B7\u53D6\u7528\u6237\u4FE1\u606F", 20000, 5903, 29.515, 350.69955000000346, 0, 2939, 295.0, 748.0, 793.0, 966.0, 399.0104540738967, 134.8647151938193, 109.93552396307157], "isController": false}, {"data": ["\u63D0\u4EA4\u5DE9\u56FA\u9898\u7B54\u6848", 20000, 5766, 28.83, 319.2706499999978, 0, 1905, 158.5, 741.0, 789.0, 965.0, 399.8880313512216, 138.2343803110129, 177.6657613993082], "isController": false}]}, function(index, item){
        switch(index){
            // Errors pct
            case 3:
                item = item.toFixed(2) + '%';
                break;
            // Mean
            case 4:
            // Mean
            case 7:
            // Percentile 1
            case 8:
            // Percentile 2
            case 9:
            // Percentile 3
            case 10:
            // Throughput
            case 11:
            // Kbytes/s
            case 12:
            // Sent Kbytes/s
                item = item.toFixed(2);
                break;
        }
        return item;
    }, [[0, 0]], 0, summaryTableHeader);

    // Create error table
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["Non HTTP response code: java.net.URISyntaxException\/Non HTTP response message: Illegal character in query at index 73: https:\\\/\\\/apics.chamiedu.com\\\/index\\\/question\\\/getReview?user_id=error&amp;token=${token}&amp;subject_id=100051", 904, 3.1261887471037797, 0.904], "isController": false}, {"data": ["Non HTTP response code: java.net.URISyntaxException\/Non HTTP response message: Illegal character in query at index 102: https:\\\/\\\/apics.chamiedu.com\\\/index\\\/users_consolidate_practice\\\/reviewHistoryMistake?user_id=error&amp;token=${token}&amp;subject_id=100249&amp;page=1&amp;pageSize=10", 904, 3.1261887471037797, 0.904], "isController": false}, {"data": ["502\/Bad Gateway", 24738, 85.54829339143065, 24.738], "isController": false}, {"data": ["Non HTTP response code: java.net.URISyntaxException\/Non HTTP response message: Illegal character in query at index 65: https:\\\/\\\/apics.chamiedu.com\\\/index\\\/users\\\/info?user_id=error&amp;token=${token}", 904, 3.1261887471037797, 0.904], "isController": false}, {"data": ["Non HTTP response code: java.net.URISyntaxException\/Non HTTP response message: Illegal character in query at index 73: https:\\\/\\\/apics.chamiedu.com\\\/index\\\/question\\\/putAnswer?user_id=error&amp;token=${token}&amp;subject_id=+100249&amp;questions_id=1002490950&amp;answers=10024909504%2C10024909503%2C10024909502%2C10024909501%2C10024909505&amp;answers_sel=10024909504&amp;type=1&amp;start_time=16856203123", 904, 3.1261887471037797, 0.904], "isController": false}, {"data": ["Non HTTP response code: org.apache.http.conn.HttpHostConnectException\/Non HTTP response message: Connect to apics.chamiedu.com:443 [apics.chamiedu.com\\\/47.108.198.229] failed: Connection timed out: connect", 563, 1.9469516201542345, 0.563], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 100000, 28917, "502\/Bad Gateway", 24738, "Non HTTP response code: java.net.URISyntaxException\/Non HTTP response message: Illegal character in query at index 73: https:\\\/\\\/apics.chamiedu.com\\\/index\\\/question\\\/getReview?user_id=error&amp;token=${token}&amp;subject_id=100051", 904, "Non HTTP response code: java.net.URISyntaxException\/Non HTTP response message: Illegal character in query at index 102: https:\\\/\\\/apics.chamiedu.com\\\/index\\\/users_consolidate_practice\\\/reviewHistoryMistake?user_id=error&amp;token=${token}&amp;subject_id=100249&amp;page=1&amp;pageSize=10", 904, "Non HTTP response code: java.net.URISyntaxException\/Non HTTP response message: Illegal character in query at index 65: https:\\\/\\\/apics.chamiedu.com\\\/index\\\/users\\\/info?user_id=error&amp;token=${token}", 904, "Non HTTP response code: java.net.URISyntaxException\/Non HTTP response message: Illegal character in query at index 73: https:\\\/\\\/apics.chamiedu.com\\\/index\\\/question\\\/putAnswer?user_id=error&amp;token=${token}&amp;subject_id=+100249&amp;questions_id=1002490950&amp;answers=10024909504%2C10024909503%2C10024909502%2C10024909501%2C10024909505&amp;answers_sel=10024909504&amp;type=1&amp;start_time=16856203123", 904], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": ["\u83B7\u5F97\u5DE9\u56FA\u590D\u4E60\u9898", 20000, 5787, "502\/Bad Gateway", 4883, "Non HTTP response code: java.net.URISyntaxException\/Non HTTP response message: Illegal character in query at index 73: https:\\\/\\\/apics.chamiedu.com\\\/index\\\/question\\\/getReview?user_id=error&amp;token=${token}&amp;subject_id=100051", 904, null, null, null, null, null, null], "isController": false}, {"data": ["\u7528\u6237\u767B\u5F55", 20000, 5713, "502\/Bad Gateway", 5150, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException\/Non HTTP response message: Connect to apics.chamiedu.com:443 [apics.chamiedu.com\\\/47.108.198.229] failed: Connection timed out: connect", 563, null, null, null, null, null, null], "isController": false}, {"data": ["\u83B7\u53D6\u5DE9\u56FA\u590D\u4E60\u5386\u53F2\u9519\u9898", 20000, 5748, "502\/Bad Gateway", 4844, "Non HTTP response code: java.net.URISyntaxException\/Non HTTP response message: Illegal character in query at index 102: https:\\\/\\\/apics.chamiedu.com\\\/index\\\/users_consolidate_practice\\\/reviewHistoryMistake?user_id=error&amp;token=${token}&amp;subject_id=100249&amp;page=1&amp;pageSize=10", 904, null, null, null, null, null, null], "isController": false}, {"data": ["\u83B7\u53D6\u7528\u6237\u4FE1\u606F", 20000, 5903, "502\/Bad Gateway", 4999, "Non HTTP response code: java.net.URISyntaxException\/Non HTTP response message: Illegal character in query at index 65: https:\\\/\\\/apics.chamiedu.com\\\/index\\\/users\\\/info?user_id=error&amp;token=${token}", 904, null, null, null, null, null, null], "isController": false}, {"data": ["\u63D0\u4EA4\u5DE9\u56FA\u9898\u7B54\u6848", 20000, 5766, "502\/Bad Gateway", 4862, "Non HTTP response code: java.net.URISyntaxException\/Non HTTP response message: Illegal character in query at index 73: https:\\\/\\\/apics.chamiedu.com\\\/index\\\/question\\\/putAnswer?user_id=error&amp;token=${token}&amp;subject_id=+100249&amp;questions_id=1002490950&amp;answers=10024909504%2C10024909503%2C10024909502%2C10024909501%2C10024909505&amp;answers_sel=10024909504&amp;type=1&amp;start_time=16856203123", 904, null, null, null, null, null, null], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
