const moment = require("moment");

module.exports = {
  formatDate: function (date, format) {
    return moment(date).utc().format(format);
  },
  truncate: function (str, len) {
    if (str.length > len && str.length > 0) {
      let new_str = str + " ";
      new_str = str.substr(0, len);
      new_str = str.substr(0, new_str.lastIndexOf(" "));
      new_str = new_str.length > 0 ? new_str : str.substr(0, len);
      return new_str + "...";
    }
    return str;
  },
  ifEquals: function (arg1, arg2, options) {
    return arg1 == arg2 ? options.fn(this) : options.inverse(this);
  },
  toSplitFile: function (arg1){
    let index = arg1.indexOf('$');
    return arg1.substring(index + 1);
  },
  select: function (selected, options) {
    return options
      .fn(this)
      .replace(
        new RegExp(' value="' + selected + '"'),
        '$& selected="selected"'
      )
      .replace(
        new RegExp(">" + selected + "</option>"),
        ' selected="selected"$&'
      );
  },

  ifIn: function (elem, list, options) {
    for (let index = 0; index < list.length; index++) {
      const element = list[index];
      if (element.fileType==elem) {
           return options.fn(this);
      }
      
    }
    if (list.indexOf(elem) > -1) {
      return options.fn(this);
    }
    return options.inverse(this);
  },
};
