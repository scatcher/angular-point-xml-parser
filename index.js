var q = require('q');
var fs = require('fs');
var _ = require('lodash');

module.exports = {
    createJSON: createJSON
};


function createJSON(options) {
    var defaults = {
            moduleName: 'angularPoint',
            constantName: 'apCachedXML',
            fileName: 'offlineXML.js',
            //dest: '.',
            src: []
        },
        deferred = q.defer(),
        opts = _.extend({}, defaults, options),
        offlineXML = {};

    opts.dest = opts.dest || opts.src[0];

    opts.src.forEach(function (fileDirectory) {
        var promises = [];
        fs.readdir(fileDirectory, function (err, files) {
            if (err) throw err;

            files.forEach(function (fileName) {
                if (fileName.indexOf('.xml') > -1) {
                    promises.push(parseFile(fileName, fileDirectory)
                        .then(function (file) {
                            offlineXML[fileName.split('.xml')[0]] = file;
                        }));
                }
            });

            q.all(promises).then(function () {
                var fileContents = 'angular.module(\'' + opts.moduleName + '\').constant(\'' + opts.constantName + '\', ';
                fileContents += JSON.stringify(offlineXML) + ');';

                fs.writeFile(opts.dest + '/' + opts.fileName, fileContents, {encoding: 'utf8'}, function (err) {
                    if (err) throw err;
                    deferred.resolve(offlineXML);
                    console.log("Parsed XML Constant File Created");
                });
            });
        });
    });

    return deferred.promise;
}

function parseFile(fileName, filePath) {
    var deferred = q.defer();

    fs.readFile(filePath + '/' + fileName, {encoding: 'utf8'}, function (err, data) {
        deferred.resolve(data);
    });
    return deferred.promise;
}