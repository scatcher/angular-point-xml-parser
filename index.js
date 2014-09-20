var fs = require('fs');
var _ = require('lodash');

module.exports = {
    createJSON: createJSON
};

/**
 * @description
 * Takes folders of cached XHR responses (xml files), escapes the contents, and generates an angular constant object with
 * properties equaling the name of the file and values being the escaped contents of the file.
 * @param {object} options
 * @param {string} [options.constantName='apCachedXML']
 * @param {string} [options.dest=opts.src[0]] The output location for the file.
 * @param {string} [options.fileName='offlineXML.js']
 * @param {string} [options.moduleName='angularPoint']
 * @param {string[]} [options.src] Folders containing XML files to process.
 */
function createJSON(options) {
    var defaults = {
            moduleName: 'angularPoint',
            constantName: 'apCachedXML',
            fileName: 'offlineXML.js',
            //dest: '.',
            src: []
        },
        opts = _.extend({}, defaults, options),
        offlineXML = {};

    opts.dest = opts.dest || opts.src[0];

    /** Process each of the src directories */
    opts.src.forEach(function (fileDirectory) {
        /** Go through each XML file in the directory */
        fs.readdirSync(fileDirectory).forEach(function (fileName) {
            if (fileName.indexOf('.xml') > -1) {
                /** Create a property on the offlineXML object with a key equaling the file name (without .xml) and
                 * value being the contents of the file */
                offlineXML[fileName.split('.xml')[0]] =
                    fs.readFileSync(fileDirectory + '/' + fileName, {encoding: 'utf8'});
            }
        });
    });

    var fileContents = 'angular.module(\'' + opts.moduleName + '\').constant(\'' + opts.constantName + '\', ';
    /** Stringify object and indent 4 spaces */
    fileContents += JSON.stringify(offlineXML, null, 4) + ');';

    /** Write file to dest */
    return fs.writeFileSync(opts.dest + '/' + opts.fileName, fileContents, {encoding: 'utf8'});
}