
;(function ($, window, document, undefined) {
    var pluginName = "editable",
        defaults = {
            keyboard: true,
            dblclick: true,
            button: true,
            buttonSelector: ".edit",
            cancelbuttonSelector:".cancel",
            numbers:[],
            maintainWidth: true,
            dropdowns: {},
            inputclass:"form-control",
            edit: function() {},
            save: function() {},
            cancel: function() {}
        },
        rowlist = [], counter = 0;
        
    function editable(element, options) {
        this.element = element;
        this.options = $.extend({}, defaults, options) ;

        this._defaults = defaults;
        this._name = pluginName;
        $(element).attr(`data-${pluginName}-id`,(++counter));
        this.init();
    }

    editable.prototype = {
        init: function() {
            this.editing = false;
            
            if (this.options.dblclick) {
                $(this.element)
                    .css('cursor', 'pointer')
                    .bind('dblclick', this.toggle.bind(this));
            }

            if (this.options.button) {
                $(this.options.buttonSelector, this.element)
                    .bind('click', this.toggle.bind(this));
                $(this.options.cancelbuttonSelector, this.element)
                .bind('click', this.cancel.bind(this));
            }
        },

        toggle: function(e) {
            e.preventDefault();

            if( $(rowlist[0]).data(pluginName+"-id") != $(this.element).data(pluginName+"-id") && rowlist.length > 0 )
            { 
                return false;
            }

            this.editing = !this.editing;

            if (this.editing) {
                this.edit();
            } else {
                this.save();
            }
        },

        edit: function() {
            var instance = this,
                values = {};

                rowlist.push(this.element);
            $('td[data-field]', this.element).each(function() {
                var input,
                    field = $(this).data('field'),
                    value = $(this).text().trim(),
                    width = $(this).width();

                values[field] = value;

                $(this).empty();

                if (instance.options.maintainWidth) {
                    $(this).width(width);
                }

                if (field in instance.options.dropdowns) {
                    input = $('<select></select>');

                    for (var i = 0; i < instance.options.dropdowns[field].length; i++) {
                        $('<option></option>')
                             .text(instance.options.dropdowns[field][i])
                             .appendTo(input);
                    };

                    input.val(value)
                         .data('old-value', value)
                         .addClass(instance.options.inputclass)
                         .dblclick(instance._captureEvent);
                } else if(instance.options.numbers.length > 0){
                    if(instance.options.numbers.includes(field)){
                        input = $('<input type="number" />')
                            .val(value)
                            .addClass(instance.options.inputclass)
                            .data('old-value', value)
                            .dblclick(instance._captureEvent);
                    }else{
                        input = $('<input type="text" />')
                            .val(value)
                            .addClass(instance.options.inputclass)
                            .data('old-value', value)
                            .dblclick(instance._captureEvent);
                    }
                }

                input.appendTo(this);

                if (instance.options.keyboard) {
                    input.keydown(instance._captureKey.bind(instance));
                }
            });

            this.options.edit.bind(this.element)(values);
        },

        save: function() {
            var instance = this,
                values = {};
            rowlist.pop();
            $('td[data-field]', this.element).each(function() {
                var value = $(':input', this).val();

                values[$(this).data('field')] = value;

                $(this).empty()
                       .text(value);
            });

            this.options.save.bind(this.element)(values);
        },

        cancel: function() {
            var instance = this,
                values = {};
            rowlist.pop();
            if(this.editing){
                this.editing = !this.editing;
                $('td[data-field]', this.element).each(function() {
                    var value = $(':input', this).data('old-value');

                    values[$(this).data('field')] = value;
                    
                    $(this).empty()
                        .text(value);
                });
            }else{
                $('td[data-field]', this.element).each(function() {
                    var value = $(this).text();
                    values[$(this).data('field')] = value;
                });
            }

            this.options.cancel.bind(this.element)(values);
        },

        _captureEvent: function(e) {
            e.stopPropagation();
        },

        _captureKey: function(e) {
            if( $(rowlist[0]).data(pluginName+"-id") != $(this.element).data(pluginName+"-id") && rowlist.length > 0 )
            { 
                return false;
            }
            
            if (e.which === 13) {
                this.editing = false;
                this.save();
            } else if (e.which === 27) {
                this.editing = false;
                this.cancel();
            }
        }
    };

    $.fn[pluginName] = function(options) {
        return this.each(function () {
            if (!$.data(this, "plugin_" + pluginName)) {
                $.data(this, "plugin_" + pluginName,
                new editable(this, options));
            }
        });
    };

})(jQuery, window, document);
