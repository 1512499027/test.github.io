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
    cell.colSpan = 1;
    cell.innerHTML = "Throughput";
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

    var data = {"OkPercent": 70.52, "KoPercent": 29.48};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.68718, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.704525, 500, 1500, "\u83B7\u5F97\u5DE9\u56FA\u590D\u4E60\u9898"], "isController": false}, {"data": [0.617825, 500, 1500, "\u7528\u6237\u767B\u5F55"], "isController": false}, {"data": [0.704675, 500, 1500, "\u83B7\u53D6\u5DE9\u56FA\u590D\u4E60\u5386\u53F2\u9519\u9898"], "isController": false}, {"data": [0.7039, 500, 1500, "\u83B7\u53D6\u7528\u6237\u4FE1\u606F"], "isController": false}, {"data": [0.704975, 500, 1500, "\u63D0\u4EA4\u5DE9\u56FA\u9898\u7B54\u6848"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 100000, 29480, 29.48, 1419.6141700000042, 0, 21497, 18.0, 247.0, 21021.0, 21041.0, 653.1550655441108, 439.56162910957, 156.0630216055531], "isController": false}, "titles": ["Label", "#Samples", "KO", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions\/s", "Received", "Sent"], "items": [{"data": ["\u83B7\u5F97\u5DE9\u56FA\u590D\u4E60\u9898", 20000, 5896, 29.48, 28.970300000000062, 0, 1001, 12.0, 86.0, 146.0, 216.0, 133.31822393462076, 73.96719647814915, 29.655441133338222], "isController": false}, {"data": ["\u7528\u6237\u767B\u5F55", 20000, 5896, 29.48, 6980.673999999966, 13, 21497, 359.0, 21051.0, 21108.0, 21308.99, 130.68478829064298, 141.19552077888136, 23.918825858435703], "isController": false}, {"data": ["\u83B7\u53D6\u5DE9\u56FA\u590D\u4E60\u5386\u53F2\u9519\u9898", 20000, 5896, 29.48, 28.02945000000001, 0, 1001, 12.0, 84.0, 141.0, 207.0, 133.31733525310295, 75.82497652365049, 34.06221461757922], "isController": false}, {"data": ["\u83B7\u53D6\u7528\u6237\u4FE1\u606F", 20000, 5896, 29.48, 33.71860000000002, 0, 1002, 11.0, 114.0, 160.0, 225.0, 133.2418406027861, 74.81110366714856, 27.25269273432243], "isController": false}, {"data": ["\u63D0\u4EA4\u5DE9\u56FA\u9898\u7B54\u6848", 20000, 5896, 29.48, 26.6785, 0, 999, 12.0, 77.0, 134.0, 201.0, 133.31644658343276, 79.91535915867323, 43.88579529926209], "isController": false}]}, function(index, item){
        switch(index){
            // Errors pct
            case 3:
                item = item.toFixed(2) + '%';
                break;
            // Mean
            case 4:
            // Mean
            case 7:
            // Median
            case 8:
            // Percentile 1
            case 9:
            // Percentile 2
            case 10:
            // Percentile 3
            case 11:
            // Throughput
            case 12:
            // Kbytes/s
            case 13:
            // Sent Kbytes/s
                item = item.toFixed(2);
                break;
        }
        return item;
    }, [[0, 0]], 0, summaryTableHeader);

    // Create error table
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["Non HTTP response code: java.net.URISyntaxException\/Non HTTP response message: Illegal character in query at index 60: https:\\\/\\\/apics.chamiedu.com\\\/index\\\/users\\\/info?user_id=&amp;token=${token}", 5896, 20.0, 5.896], "isController": false}, {"data": ["Non HTTP response code: java.net.URISyntaxException\/Non HTTP response message: Illegal character in query at index 68: https:\\\/\\\/apics.chamiedu.com\\\/index\\\/question\\\/getReview?user_id=&amp;token=${token}&amp;subject_id=100051", 5896, 20.0, 5.896], "isController": false}, {"data": ["Non HTTP response code: org.apache.http.conn.HttpHostConnectException\/Non HTTP response message: Connect to apics.chamiedu.com:443 [apics.chamiedu.com\\\/47.108.198.229] failed: Connection timed out: connect", 5896, 20.0, 5.896], "isController": false}, {"data": ["Non HTTP response code: java.net.URISyntaxException\/Non HTTP response message: Illegal character in query at index 97: https:\\\/\\\/apics.chamiedu.com\\\/index\\\/users_consolidate_practice\\\/reviewHistoryMistake?user_id=&amp;token=${token}&amp;subject_id=100249&amp;page=1&amp;pageSize=10", 5896, 20.0, 5.896], "isController": false}, {"data": ["Non HTTP response code: java.net.URISyntaxException\/Non HTTP response message: Illegal character in query at index 68: https:\\\/\\\/apics.chamiedu.com\\\/index\\\/question\\\/putAnswer?user_id=&amp;token=${token}&amp;subject_id=+100249&amp;questions_id=1002490950&amp;answers=10024909504%2C10024909503%2C10024909502%2C10024909501%2C10024909505&amp;answers_sel=10024909504&amp;type=1&amp;start_time=16856203123", 5896, 20.0, 5.896], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 100000, 29480, "Non HTTP response code: java.net.URISyntaxException\/Non HTTP response message: Illegal character in query at index 60: https:\\\/\\\/apics.chamiedu.com\\\/index\\\/users\\\/info?user_id=&amp;token=${token}", 5896, "Non HTTP response code: java.net.URISyntaxException\/Non HTTP response message: Illegal character in query at index 68: https:\\\/\\\/apics.chamiedu.com\\\/index\\\/question\\\/getReview?user_id=&amp;token=${token}&amp;subject_id=100051", 5896, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException\/Non HTTP response message: Connect to apics.chamiedu.com:443 [apics.chamiedu.com\\\/47.108.198.229] failed: Connection timed out: connect", 5896, "Non HTTP response code: java.net.URISyntaxException\/Non HTTP response message: Illegal character in query at index 97: https:\\\/\\\/apics.chamiedu.com\\\/index\\\/users_consolidate_practice\\\/reviewHistoryMistake?user_id=&amp;token=${token}&amp;subject_id=100249&amp;page=1&amp;pageSize=10", 5896, "Non HTTP response code: java.net.URISyntaxException\/Non HTTP response message: Illegal character in query at index 68: https:\\\/\\\/apics.chamiedu.com\\\/index\\\/question\\\/putAnswer?user_id=&amp;token=${token}&amp;subject_id=+100249&amp;questions_id=1002490950&amp;answers=10024909504%2C10024909503%2C10024909502%2C10024909501%2C10024909505&amp;answers_sel=10024909504&amp;type=1&amp;start_time=16856203123", 5896], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": ["\u83B7\u5F97\u5DE9\u56FA\u590D\u4E60\u9898", 20000, 5896, "Non HTTP response code: java.net.URISyntaxException\/Non HTTP response message: Illegal character in query at index 68: https:\\\/\\\/apics.chamiedu.com\\\/index\\\/question\\\/getReview?user_id=&amp;token=${token}&amp;subject_id=100051", 5896, null, null, null, null, null, null, null, null], "isController": false}, {"data": ["\u7528\u6237\u767B\u5F55", 20000, 5896, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException\/Non HTTP response message: Connect to apics.chamiedu.com:443 [apics.chamiedu.com\\\/47.108.198.229] failed: Connection timed out: connect", 5896, null, null, null, null, null, null, null, null], "isController": false}, {"data": ["\u83B7\u53D6\u5DE9\u56FA\u590D\u4E60\u5386\u53F2\u9519\u9898", 20000, 5896, "Non HTTP response code: java.net.URISyntaxException\/Non HTTP response message: Illegal character in query at index 97: https:\\\/\\\/apics.chamiedu.com\\\/index\\\/users_consolidate_practice\\\/reviewHistoryMistake?user_id=&amp;token=${token}&amp;subject_id=100249&amp;page=1&amp;pageSize=10", 5896, null, null, null, null, null, null, null, null], "isController": false}, {"data": ["\u83B7\u53D6\u7528\u6237\u4FE1\u606F", 20000, 5896, "Non HTTP response code: java.net.URISyntaxException\/Non HTTP response message: Illegal character in query at index 60: https:\\\/\\\/apics.chamiedu.com\\\/index\\\/users\\\/info?user_id=&amp;token=${token}", 5896, null, null, null, null, null, null, null, null], "isController": false}, {"data": ["\u63D0\u4EA4\u5DE9\u56FA\u9898\u7B54\u6848", 20000, 5896, "Non HTTP response code: java.net.URISyntaxException\/Non HTTP response message: Illegal character in query at index 68: https:\\\/\\\/apics.chamiedu.com\\\/index\\\/question\\\/putAnswer?user_id=&amp;token=${token}&amp;subject_id=+100249&amp;questions_id=1002490950&amp;answers=10024909504%2C10024909503%2C10024909502%2C10024909501%2C10024909505&amp;answers_sel=10024909504&amp;type=1&amp;start_time=16856203123", 5896, null, null, null, null, null, null, null, null], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
