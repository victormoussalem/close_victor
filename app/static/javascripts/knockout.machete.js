
//http://www.ewal.net/2012/10/17/bootstrap-knockout-toggle-button-bindings/

ko.bindingHandlers.radio = {
    init: function (element, valueAccessor, allBindings, data, context) {
        var $buttons, $element, elementBindings, observable;
        observable = valueAccessor();
        if (!ko.isWriteableObservable(observable)) {
            throw "You must pass an observable or writeable computed";
        }
        $element = $(element);
        if ($element.hasClass("btn")) {
            $buttons = $element;
        } else {
            $buttons = $(".btn", $element);
        }
        elementBindings = allBindings();
        $buttons.each(function () {
            var $btn, btn, radioValue;
            btn = this;
            $btn = $(btn);
            radioValue = elementBindings.radioValue || $btn.attr("data-value") || $btn.attr("value") || $btn.text();
            $btn.on("click", function () {
                observable(ko.utils.unwrapObservable(radioValue));
            });
            return ko.computed({
                disposeWhenNodeIsRemoved: btn,
                read: function () {
                    $btn.toggleClass("activeButton", observable() === ko.utils.unwrapObservable(radioValue));
                }
            });
        });
    }
};

ko.bindingHandlers.checkbox = {
    init: function (element, valueAccessor, allBindings, data, context) {
        var $element, observable;
        observable = valueAccessor();
        if (!ko.isWriteableObservable(observable)) {
            throw "You must pass an observable or writeable computed";
        }
        $element = $(element);
        $element.on("click", function () {
            observable(!observable());
        });
        ko.computed({
            disposeWhenNodeIsRemoved: element,
            read: function () {
                $element.toggleClass("active", observable());
            }
        });
    }
};


//@* see: http://www.bootstrap-switch.org/ *@
ko.bindingHandlers.bootstrapSwitch = {
    init: function (element, valueAccessor, allBindingsAccessor, viewModel) {
        $elem = $(element);
        $(element).bootstrapSwitch('setState', ko.utils.unwrapObservable(valueAccessor())); // Set intial state
        $elem.on('switch-change', function (e, data) {
            valueAccessor()(data.value);
        }); // Update the model when changed.
    },
    update: function (element, valueAccessor, allBindingsAccessor, viewModel) {
        var vStatus = $(element).bootstrapSwitch('status');
        var vmStatus = ko.utils.unwrapObservable(valueAccessor());
        if (vStatus !== vmStatus) {
            $(element).bootstrapSwitch('setState', vmStatus);
        }
    }
};

ko.bindingHandlers.fadeVisible = {
    init: function (element, valueAccessor) {
        // Initially set the element to be instantly visible/hidden depending on the value
        var value = valueAccessor();
        $(element).toggle(ko.utils.unwrapObservable(value)); // Use "unwrapObservable" so we can handle values that may or may not be observable
    },
    update: function (element, valueAccessor) {
        // Whenever the value subsequently changes, slowly fade the element in or out
        var value = valueAccessor();
        ko.utils.unwrapObservable(value) ? $(element).slideDown() : $(element).slideUp();
    }
};
