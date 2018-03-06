/**
 * Created by Shyam on 1/23/2018.
 */

/**
 * Utilities for various data type validations, comparisons and an advanced "stringify".
 */
var Utilities = {

    isStr: function (str) {
        return str && (typeof str === "string" || str instanceof String);
    },
    isValidStr: function (str) {
        return Utilities.isStr(str) && str.trim().length;
    },
    isNumeric: function (n) {
        return !isNaN(parseFloat(n)) && isFinite(n);
    },
    isValidArray: function (arr) {
        return arr && Array.isArray(arr) && arr.length;
    },
    isFunction: function (fn) {
        return fn && (typeof fn === "function" || fn instanceof Function);
    },

    /**
     * Checks whether the given value is a JSON or not.
     *
     * @param {*} v The value to be checked if JSON or not.
     * @param {boolean} [failIfHasFunctions] If true, the
     * check will fail if the JSON contains functions.
     * @returns {boolean}
     */
    isJSON: function (v, failIfHasFunctions) {
        // Object, string and arrays have keys.
        var isJSON = v && Object.keys(v).length > 0 && !Array.isArray(v) && typeof v !== 'string' && !(v instanceof String);
        if (!isJSON) {
            // pass if empty object
            isJSON = JSON.stringify(v) == "{}";
        }
        else if (failIfHasFunctions) {
            var pv;
            var keys = Object.keys(v);
            for (var i = 0; i < keys.length; ++i) {
                pv = v[keys[i]];
                if (typeof pv === "function") return false;
                else if (Utilities.isJSON(pv)) return Utilities.isJSON(pv, true);
            }
        }
        return isJSON;
    },

    /**
     * Checks whether the two are RegExps and are equal or not.
     *
     * @param r1
     * @param r2
     * @returns {boolean}
     */
    areRegExpsSame: function (r1, r2) {
        return r1 instanceof RegExp && r2 instanceof RegExp
            && r1.source === r2.source
            && r1.global === r2.global
            && r1.ignoreCase === r2.ignoreCase
            && r1.multiline === r2.multiline;
    },

    areDatesSame: function (d1, d2) {
        return d1 instanceof Date && d2 instanceof Date
            && d1.getTime() == d2.getTime();
    },

    areOfSameDataTypes: function (v1, v2) {
        // note: typeof null = "object"
        return v1 == v2 || (typeof v1 == typeof v2 && (typeof v1 !== "object" || (typeof v1 === "object" && v1 != null && v2 != null && v1.constructor === v2.constructor)));
    },

    /**
     * Checks whether the array contains the value or not.
     *
     * @param {Array} arr
     * @param {*} value
     * @returns {boolean} whether the array contains the value or not.
     */
    arrayContainsValue: function (arr, value) {
        if (!arr.length) return false;
        // primitive types
        if (arr.indexOf(value) >= 0) return true;
        // RegExp|json
        for (var i = 0; i < arr.length; ++i) {
            if (Utilities.deepEquals(value, arr[i])) return true;
        }

        return false;
    },

    /**
     * Checks whether the two literals or objects are equal or not. It ignores
     * the sequence of elements of an array.
     *
     * @param {*} o1
     * @param {*} o2
     * @returns {boolean} whether the two literals or objects are equal or not
     */
    deepEquals: function (o1, o2) {
        // primitive types, RegExps and Dates
        if (o1 == o2 || Utilities.areRegExpsSame(o1, o2) || Utilities.areDatesSame(o1, o2)) return true;
        // if of different data types
        if (!Utilities.areOfSameDataTypes(o1, o2)) return false;

        var k1 = Object.keys(o1).sort();
        var k2 = Object.keys(o2).sort();
        // compare keys
        if (!k1.length || k1.length != k2.length || k1.join() != k2.join()) return false;

        for (var i = 0; i < k1.length; ++i) {
            var o1p = o1[k1[i]];
            var o2p = o2[k2[i]];
            if (!Utilities.areOfSameDataTypes(o1p, o2p)
                || (o1p instanceof RegExp && !Utilities.areRegExpsSame(o1p, o2p))
                || (o1p instanceof Date && !Utilities.areDatesSame(o1p, o2p))
                || (Utilities.isJSON(o1p) && !Utilities.deepEquals(o1p, o2p))
                || (!Utilities.isJSON(o1p) && o1p != o2p)) {
                return false;
            }
        }
        return true;
    },

    /**
     * A replacement for the inbuilt JSON.stringify() with abilities to print
     * regexp fields properly, and beautify the output with newlines and indents.
     * @param {*} v The data to be converted to a string.
     * @param {boolean} [beautify=false] If true, the output string of a JSON
     * will be formatted using newlines and indents.
     * @param {string} [indent=""] Additional indentation for the JSON output.
     * @param {string} [indentChar="\t"] Indent character. Default is TAB.
     * @returns {string}
     */
    JSONstringify: function (v, beautify, indent, indentChar) {
        var nextIndent;
        if (beautify) {
            indent = indent || "";
            indentChar = indentChar || "\t";
            nextIndent = indent + indentChar;
        }
        var out = "";
        var i;
        if (typeof v == "number") {
            out += v;
        }
        else if (v instanceof RegExp) {
            out += v.toString();
        }
        else if (Array.isArray(v)) {
            out += "[";
            if (beautify && v.length > 1) {
                out += "\n" + nextIndent;
            }
            for (i = 0; i < v.length; ++i) {
                if (i > 0) {
                    out += ",";
                    if (beautify) {
                        out += "\n" + nextIndent;
                    }
                }
                out += Utilities.JSONstringify(v[i], beautify, v.length > 1 ? nextIndent : indent, indentChar);
            }
            if (beautify && v.length > 1) out += "\n" + indent;
            out += "]";
        }
        else if (Utilities.isJSON(v)) {
            out += "{";
            var keys = Object.keys(v);
            if (beautify && keys.length > 1) out += "\n" + nextIndent;
            for (i = 0; i < keys.length; ++i) {
                if (i > 0) {
                    out += ",";
                    if (beautify) out += "\n" + nextIndent;
                }
                out += JSON.stringify(keys[i]) + (beautify ? ": " : ":") + Utilities.JSONstringify(v[keys[i]], beautify, keys.length > 1 ? nextIndent : indent, indentChar);
            }
            if (beautify && keys.length > 1) out += "\n" + indent;
            out += "}";
        }
        else if (v && Utilities.isFunction(v.toString)) {
            // convert to string
            out += JSON.stringify(v.toString());
        }
        else {
            out += JSON.stringify(v);
        }
        return out;
    }
};

module.exports = Utilities;